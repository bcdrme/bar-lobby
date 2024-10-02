import { app, ipcMain, protocol, safeStorage } from "electron";
import unhandled from "electron-unhandled";
import { autoUpdater } from "electron-updater";
import path from "path";

import { createWindow } from "@main/main-window";
import { replaysService } from "@main/services/replays.service";
import { settingsService } from "./services/settings.service";
import { infoService } from "./services/info.service";
import { accountService } from "./services/account.service";
import engineService from "./services/engine.service";
import mapService from "./services/map.service";
import gameService from "./services/game.service";

/** Steam integration, commented out until we have a dedicated app id */
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const steamworks = require("steamworks.js");
// const client = steamworks.init(480);
// console.log(client.localplayer.getName());
// steamworks.electronEnableSteamOverlay();

console.log("index.ts loaded");

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

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    unhandled();
}

app.setName("Beyond All Reason");
app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling,MediaSessionService");
app.on("window-all-closed", () => app.quit());
app.on("web-contents-created", (_, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (process.env.ELECTRON_RENDERER_URL && parsedUrl.protocol == "http:" && parsedUrl.toString() == process.env.ELECTRON_RENDERER_URL + "/") {
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

//TODO move these to services
function setupHandlers() {
    ipcMain.handle("encryptString", async (_event, str: string) => {
        if (safeStorage.isEncryptionAvailable()) {
            return safeStorage.encryptString(str);
        }
        console.warn(`encryption not available, storing as plaintext`);
        return str;
    });
    ipcMain.handle("decryptString", async (_event, buffer: Buffer) => {
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
}

app.enableSandbox();
app.whenReady().then(() => {
    if (process.env.NODE_ENV !== "production") {
        try {
            // await installExtension(VUEJS_DEVTOOLS);
        } catch (err) {
            console.error("Vue Devtools failed to install:", err?.toString());
        }
    } else if (app.isPackaged && process.env.NODE_ENV === "production") {
        autoUpdater.checkForUpdatesAndNotify();
    }

    setupHandlers();
    settingsService.init();
    accountService.init();
    replaysService.init();
    engineService.init();
    gameService.init();
    mapService.init();

    infoService.registerIpcHandlers();
    settingsService.registerIpcHandlers();
    accountService.registerIpcHandlers();
    replaysService.registerIpcHandlers();
    engineService.registerIpcHandlers();
    gameService.registerIpcHandlers();
    mapService.registerIpcHandlers();

    // Initialize all handlers before creating the window
    createWindow();
});


