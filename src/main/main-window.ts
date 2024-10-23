import { app, BrowserWindow, ipcMain, screen, shell } from "electron";
import path from "path";
import { settingsService } from "./services/settings.service";
import { logger } from "./utils/logger";
import { replayContentAPI } from "@main/content/replays/replay-content";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const log = logger("main-window");

export function createWindow() {
    const settings = settingsService.getSettings();
    log.info("Creating main window with settings: ", settings);

    const mainWindow = new BrowserWindow({
        title: "Beyond All Reason",
        fullscreen: settings.fullscreen,
        frame: true,
        show: true,
        minWidth: 1440,
        minHeight: 900,
        paintWhenInitiallyHidden: true,
        webPreferences: {
            preload: path.join(__dirname, "../build/preload.js"),
        },
    });
    process.env.MAIN_WINDOW_ID = mainWindow.id.toString();

    log.debug("Settings: ", settings);

    mainWindow.once("ready-to-show", () => {
        mainWindow.setMenuBarVisibility(false);
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.webContents.on("render-process-gone", (event, details) => {
        console.error(details);
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    if (process.env.NODE_ENV === "development") {
        log.debug(`NODE_ENV is development, opening dev tools`);
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("restore", () => mainWindow.flashFrame(false));

    app.on("browser-window-focus", () => mainWindow.flashFrame(false));
    app.on("second-instance", (_event, commandLine, _workingDirectory, _additionalData) => {
        log.info("Second Instance opening with command line: " + commandLine);
        focusWindows();
        openFile(commandLine[commandLine.length - 1]);
    });
    app.on("open-file", (_, path) => {
        log.info("Mac OS opening file: " + path);
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
        replayContentAPI.copyParseAndLaunchReplay(path);
    }

    function setDisplay(display: Electron.Display) {
        const { x, y, width, height } = display.bounds;
        mainWindow.setPosition(x, y);
        mainWindow.setSize(width, height);
        mainWindow.maximize();
    }
    setDisplay(screen.getAllDisplays()[settings.displayIndex]);

    //TODO add an IPC handler for changing display via the settings

    // Register IPC handlers for the main window
    ipcMain.handle("mainWindow:setFullscreen", (_event, flag: boolean) => {
        mainWindow.setFullScreen(flag);
    });
    ipcMain.handle("mainWindow:toggleFullscreen", () => mainWindow.setFullScreen(!mainWindow.isFullScreen()));
    ipcMain.handle("mainWindow:flashFrame", (_event, flag: boolean) => {
        mainWindow.flashFrame(flag);
    });
    /////////////////////////////////////////////

    return mainWindow;
}
