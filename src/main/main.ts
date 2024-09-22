import { app, BrowserWindow, ipcMain, protocol, safeStorage, screen, shell } from "electron";
// import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
// import { autoUpdater } from "electron-updater";
import type { Info } from "$/model/info";
import envPaths from "env-paths";
import os from "os";
import path from "path";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
}

app.setName("Beyond All Reason");
protocol.registerSchemesAsPrivileged([
    {
        scheme: "bar",
        privileges: {
            secure: true,
            standard: true,
            stream: true,
        },
    },
]);

app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling,MediaSessionService");

if (process.env.NODE_ENV !== "production") {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}

app.on("ready", () => createWindow());
app.on("window-all-closed", () => app.quit());
app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (process.env.ELECTRON_RENDERER_URL && parsedUrl.protocol == "http:" && parsedUrl == new URL(process.env.ELECTRON_RENDERER_URL)) {
            return; //allow
        }
        if (parsedUrl.protocol == "file:" && parsedUrl.pathname) {
            if (path.resolve(parsedUrl.pathname) == path.resolve(path.join(__dirname, "../renderer/index.html"))) {
                return; //allow
            }
        }
        event.preventDefault(); //disallow
    });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require("electron-squirrel-startup")) {
//     app.quit();
// }

const createWindow = () => {
    if (process.env.NODE_ENV !== "production") {
        // try {
        //     await installExtension(VUEJS_DEVTOOLS);
        // } catch (err) {
        //     console.error("Vue Devtools failed to install:", err?.toString());
        // }
    } else if (app.isPackaged && process.env.NODE_ENV === "production") {
        // autoUpdater.checkForUpdatesAndNotify();
    }

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        title: "Beyond All Reason",
        fullscreen: false,
        frame: true,
        show: false,
        minWidth: 1440,
        minHeight: 900,
        paintWhenInitiallyHidden: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            sandbox: false,
            nodeIntegration: true,
            // contextIsolation: false,
            // nodeIntegrationInSubFrames: true,
            // nodeIntegrationInWorker: true,
            // webSecurity: false,
            // backgroundThrottling: false,
        },
    });

    function openFile(path: string) {
        if (!path.endsWith(".sdfz")) {
            return;
        }
        mainWindow.webContents.send("open-replay", path);
    }

    app.on("browser-window-focus", () => mainWindow.flashFrame(false));
    mainWindow.on("restore", () => mainWindow.flashFrame(false));

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Setup handlers
    ipcMain.handle("getInfo", () => {
        const resourcesPath = path.join(app.getAppPath(), "resources").split("resources")[0] + "resources";
        const paths = envPaths(app.getName(), { suffix: "" });
        const displayIds = screen.getAllDisplays().map((display) => display.id);
        const currentDisplayId = screen.getDisplayNearestPoint(mainWindow.getBounds()).id;
        const networkInterfaces = os.networkInterfaces();
        const defaultNetworkInterface = networkInterfaces["Ethernet"]?.[0] ?? Object.values(networkInterfaces)[0]?.[0];
        const info: Info = {
            resourcesPath,
            contentPath: paths.data,
            configPath: paths.config,
            lobby: {
                name: "BAR Lobby",
                version: app.getVersion(),
                hash: defaultNetworkInterface?.mac ?? "123",
            },
            hardware: {
                numOfDisplays: displayIds.length,
                currentDisplayIndex: displayIds.indexOf(currentDisplayId),
            },
        };
        return info;
    });
    ipcMain.handle("flashFrame", (_event, flag: boolean) => {
        mainWindow.flashFrame(flag);
    });
    ipcMain.handle("encryptString", (_event, str: string) => {
        if (safeStorage.isEncryptionAvailable()) {
            return safeStorage.encryptString(str);
        }
        console.warn(`encryption not available, storing as plaintext`);
        return str;
    });
    ipcMain.handle("decryptString", (_event, buffer: Buffer) => {
        if (safeStorage.isEncryptionAvailable()) {
            return safeStorage.decryptString(buffer);
        }
        console.warn(`encryption not available, returning buffer`);
        return buffer.toString();
    });
    let openedReplayAlready = false;
    ipcMain.handle("opened-replay", () => {
        console.log(process.argv);
        if (process.argv.length == 0 || openedReplayAlready) return null;
        openedReplayAlready = true; //in case of reloading the app do not open replay again
        return process.argv[process.argv.length - 1].endsWith(".sdfz") ? process.argv[process.argv.length - 1] : null;
    });

    app.on("second-instance", (_event, commandLine, _workingDirectory, _additionalData) => {
        console.log("Second Instance opening with command line: " + commandLine);
        mainWindow.focus();
        openFile(commandLine[commandLine.length - 1]);
    });

    app.on("open-file", (_, path) => {
        console.log("Mac OS opening file: " + path);
        mainWindow.focus();
        openFile(path);
    });

    mainWindow.once("ready-to-show", () => {
        mainWindow.setMenuBarVisibility(false);
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// watch(
//     () => this.settings.model.displayIndex,
//     (displayIndex) => this.setDisplay(displayIndex)
// );

// watch(
//     () => this.settings.model.fullscreen,
//     (fullscreen) => {
//         this.window.setFullScreen(fullscreen);
//         this.window.maximize();
//     }
// );

// public show() {
//     this.setDisplay(this.settings.model.displayIndex);
//     this.window.setMenuBarVisibility(false)
//     this.window.show();
//     this.window.focus();
// }

// public setDisplay(displayIndex: number) {
//     const display = screen.getAllDisplays()[displayIndex];
//     if (display) {
//         const { x, y, width, height } = display.bounds;
//         this.window.setPosition(x, y);
//         this.window.setSize(width, height);
//         this.window.maximize();
//         // this.settings.model.displayIndex = displayIndex;
//     }
// }
