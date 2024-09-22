import { BrowserWindow, screen, shell } from "electron";
import path from "path";
// import { watch } from "vue";

// import { StoreAPI } from "@/api/store";
// import { settingsSchema } from "$/model/settings";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

export class MainWindow {
    public window: BrowserWindow;

    // protected settings: StoreAPI<typeof settingsSchema>;

    constructor() {
        // this.settings = settings;

        this.window = new BrowserWindow({
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

        // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        //   this.window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        // } else {
        //   this.window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
        // };

        this.window.once("ready-to-show", () => this.show());

        this.window.webContents.on("render-process-gone", (event, details) => {
            console.error(details);
        });

        this.window.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: "deny" };
        });

        this.window.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
            callback({ requestHeaders: { Origin: "*", ...details.requestHeaders } });
        });

        this.window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            const obj = { responseHeaders: { ...details.responseHeaders } };
            if (!obj.responseHeaders["Access-Control-Allow-Origin"] && !obj.responseHeaders["access-control-allow-origin"]) {
                obj.responseHeaders["Access-Control-Allow-Origin"] = ["*"];
            }
            callback(obj);
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
        //
        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
          this.window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
          this.window.webContents.openDevTools();
        } else {
          this.window.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
          );
        }

        // if (process.env.ELECTRON_RENDERER_URL) {
        //     this.window.loadURL(process.env.ELECTRON_RENDERER_URL);
        //     this.window.webContents.openDevTools();
        // } else {
        //     this.window.loadFile(path.join(__dirname, "../renderer/index.html"));
        // }
    }

    public show() {
        // this.setDisplay(this.settings.model.displayIndex);
        this.window.setMenuBarVisibility(false)
        this.window.show();
        this.window.focus();
    }

    public setDisplay(displayIndex: number) {
        const display = screen.getAllDisplays()[displayIndex];
        if (display) {
            const { x, y, width, height } = display.bounds;
            this.window.setPosition(x, y);
            this.window.setSize(width, height);
            this.window.maximize();
            // this.settings.model.displayIndex = displayIndex;
        }
    }
}
