import { app, BrowserWindow, ipcMain, screen, shell } from "electron";
import path from "path";
import { settingsService } from "./services/settings.service";

export function createWindow() {
    const settings = settingsService.getSettings();
    const mainWindow = new BrowserWindow({
        title: "Beyond All Reason",
        fullscreen: settings.fullscreen,
        frame: true,
        show: true,
        minWidth: 1440,
        minHeight: 900,
        paintWhenInitiallyHidden: true,
        webPreferences: {
            preload: path.join(__dirname, "../preload/preload.js"),
            // backgroundThrottling: false, // unsure if this is needed
        },
    });
    process.env.MAIN_WINDOW_ID = mainWindow.id.toString();

    console.log("Settings: ", settings);

    setDisplay(settings.displayIndex || 0);
    
    mainWindow.once("ready-to-show", () => {
        mainWindow.setMenuBarVisibility(false);
        mainWindow.webContents.openDevTools();
        mainWindow.show();
        mainWindow.focus();
    });
    
    mainWindow.webContents.on("render-process-gone", (event, details) => {
        console.error(details);
    });
    
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
    
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({ requestHeaders: { Origin: "*", ...details.requestHeaders } });
    });
    
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const obj = { responseHeaders: { ...details.responseHeaders } };
        if (!obj.responseHeaders["Access-Control-Allow-Origin"] && !obj.responseHeaders["access-control-allow-origin"]) {
            obj.responseHeaders["Access-Control-Allow-Origin"] = ["*"];
        }
        callback(obj);
    });
    
    if (process.env.ELECTRON_RENDERER_URL) {
        mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    }

    mainWindow.on("restore", () => mainWindow.flashFrame(false));

    app.on("browser-window-focus", () => mainWindow.flashFrame(false));
    app.on("second-instance", (_event, commandLine, _workingDirectory, _additionalData) => {
        console.log("Second Instance opening with command line: " + commandLine);
        focusWindows();
        openFile(commandLine[commandLine.length - 1]);
    });
    app.on("open-file", (_, path) => {
        console.log("Mac OS opening file: " + path);
        focusWindows();
        openFile(path);
    });

    function focusWindows() {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }

    function openFile(path: string) {
        if (!path.endsWith(".sdfz")) {
            return;
        }
        mainWindow.webContents.send("open-replay", path);
    }

    function setDisplay(displayIndex: number) {
        const display = screen.getAllDisplays()[displayIndex];
        console.log("Display: ", display);
        console.log("Display Index: ", displayIndex);
        console.log("Display Bounds: ", display.bounds);
        if (display) {
            const { x, y, width, height } = display.bounds;
            mainWindow.setPosition(x, y);
            mainWindow.setSize(width, height);
            mainWindow.maximize();
        }
    }

    // Register IPC handlers for the main window
    ipcMain.handle("mainWindow:toggleFullscreen", () => mainWindow.setFullScreen(!mainWindow.isFullScreen()));
    ipcMain.handle('mainWindow:flashFrame', (_event, flag: boolean) => {
        mainWindow.flashFrame(flag);
    });
    /////////////////////////////////////////////

    return mainWindow;
}
