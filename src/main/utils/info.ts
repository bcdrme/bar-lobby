import { app, BrowserWindow, screen } from "electron";
import envPaths from "env-paths";
import path from "path";
import os from "os";

export type Info = {
    resourcesPath: string;
    contentPath: string;
    configPath: string;
    lobby: {
        name: string;
        version: string;
        hash: string;
    };
    hardware: {
        numOfDisplays: number;
        currentDisplayIndex: number;
    };
};

export function getInfo() {
    const resourcesPath = path.join(app.getAppPath(), "resources").split("resources")[0] + "resources";
    const paths = envPaths(app.getAppPath(), { suffix: "" });
    const displayIds = app.isReady() ? screen.getAllDisplays().map((display) => display.id) : [];
    let currentDisplayId = 0;
    if (app.isReady()) {
        // const ID = Number.parseInt(process.env.MAIN_WINDOW_ID);
        // currentDisplayId = screen.getDisplayNearestPoint(BrowserWindow.fromId(ID)?.getBounds()).id;
    }
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
            numOfDisplays: 0, //displayIds.length,
            currentDisplayIndex: 0, //displayIds.indexOf(currentDisplayId),
        },
    };
    return info;
}
