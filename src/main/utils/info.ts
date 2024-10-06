import { app, screen } from "electron";
import os from "os";
import { CONFIG_PATH, CONTENT_PATH } from "@main/config/app";

export type Info = {
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
    const displayIds = app.isReady() ? screen.getAllDisplays().map((display) => display.id) : [];
    let currentDisplayId = 0;
    if (app.isReady()) {
        // const ID = Number.parseInt(process.env.MAIN_WINDOW_ID);
        // currentDisplayId = screen.getDisplayNearestPoint(BrowserWindow.fromId(ID)?.getBounds()).id;
    }
    const networkInterfaces = os.networkInterfaces();
    const defaultNetworkInterface = networkInterfaces["Ethernet"]?.[0] ?? Object.values(networkInterfaces)[0]?.[0];
    const info: Info = {
        contentPath: CONTENT_PATH,
        configPath: CONFIG_PATH,
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
