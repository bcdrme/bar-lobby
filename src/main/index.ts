import { app, ipcMain, protocol, safeStorage, session } from "electron";

import { createWindow } from "@main/main-window";
import { replaysService } from "@main/services/replays.service";
import { settingsService } from "./services/settings.service";
import { infoService } from "./services/info.service";
import { accountService } from "./services/account.service";
import engineService from "./services/engine.service";
import mapsService from "./services/maps.service";
import gameService from "./services/game.service";
import { initCacheDb } from "./cache/cache-db";
import { logger } from "./utils/logger";
import { getInfo } from "./utils/info";

const log = logger("main/index.ts");
log.info("Starting Electron main process");

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

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

initCacheDb();

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

app.setName("Beyond All Reason");
app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling,MediaSessionService");
app.on("window-all-closed", () => app.quit());
// app.on("web-contents-created", (_, contents) => {
//     contents.on("will-navigate", (event, navigationUrl) => {
//         const parsedUrl = new URL(navigationUrl);
//         if (process.env.ELECTRON_RENDERER_URL && parsedUrl.protocol == "http:" && parsedUrl.toString() == process.env.ELECTRON_RENDERER_URL + "/") {
//             return; //allow
//         }
//         if (parsedUrl.protocol == "file:" && parsedUrl.pathname) {
//             if (path.resolve(parsedUrl.pathname) == path.resolve(path.join(__dirname, "../renderer/index.html"))) {
//                 return; //allow
//             }
//         }
//         event.preventDefault(); //disallow
//     });
// });

//TODO move these to services
function setupHandlers() {
    ipcMain.handle("encryptString", async (_event, str: string) => {
        if (safeStorage.isEncryptionAvailable()) {
            return safeStorage.encryptString(str);
        }
        log.warn(`encryption not available, storing as plaintext`);
        return str;
    });
    ipcMain.handle("decryptString", async (_event, buffer: Buffer) => {
        if (safeStorage.isEncryptionAvailable()) {
            return safeStorage.decryptString(buffer);
        }
        log.warn(`encryption not available, returning buffer`);
        return buffer.toString();
    });
    let openedReplayAlready = false;
    ipcMain.handle("opened-replay", () => {
        log.info(process.argv);
        if (process.argv.length == 0 || openedReplayAlready) return null;
        openedReplayAlready = true; //in case of reloading the app do not open replay again
        return process.argv[process.argv.length - 1].endsWith(".sdfz") ? process.argv[process.argv.length - 1] : null;
    });
}

// Security
app.enableSandbox();

app.whenReady().then(() => {
    log.info("App is ready, getInfo():");
    log.info(getInfo());

    if (process.env.NODE_ENV !== "production") {
        try {
            // await installExtension(VUEJS_DEVTOOLS);
        } catch (err) {
            log.error("Vue Devtools failed to install:", err?.toString());
        }
    } else if (app.isPackaged && process.env.NODE_ENV === "production") {
        // autoUpdater.checkForUpdatesAndNotify();
    }

    // Define CSP for all webContents
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": ["default-src 'self' 'unsafe-inline'"],
            },
        });
    });

    setupHandlers();
    settingsService.init();
    accountService.init();
    replaysService.init();
    engineService.init();
    gameService.init();
    mapsService.init();

    infoService.registerIpcHandlers();
    settingsService.registerIpcHandlers();
    accountService.registerIpcHandlers();
    replaysService.registerIpcHandlers();
    engineService.registerIpcHandlers();
    gameService.registerIpcHandlers();
    mapsService.registerIpcHandlers();

    // Initialize all handlers before creating the window
    createWindow();
});
