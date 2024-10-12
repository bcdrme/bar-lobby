import { MapData } from "@main/cache/model/map-data";
import { mapContentAPI } from "@main/content/maps/map-content";
import { ipcMain } from "electron";

function init() {
    mapContentAPI.init();
}

function registerIpcHandlers(mainWindow: Electron.BrowserWindow) {
    ipcMain.handle("maps:downloadMap", (_, scriptName: string) => mapContentAPI.downloadMap(scriptName));
    ipcMain.handle("maps:downloadMaps", (_, scriptNames: string[]) => mapContentAPI.downloadMaps(scriptNames));
    ipcMain.handle("maps:getInstalledVersions", () => mapContentAPI.installedVersions);
    ipcMain.handle("maps:getMapByScriptName", (_, scriptName: string) => mapContentAPI.getMapByScriptName(scriptName));
    ipcMain.handle("maps:isVersionInstalled", (_, id: string) => mapContentAPI.isVersionInstalled(id));
    ipcMain.handle("maps:attemptCacheErrorMaps", () => mapContentAPI.attemptCacheErrorMaps());

    // Events
    mapContentAPI.onMapCached.add((mapData: MapData) => {
        mainWindow.webContents.send("maps:mapCached", mapData);
    });
}

const mapsService = {
    init,
    registerIpcHandlers,
};

export default mapsService;
