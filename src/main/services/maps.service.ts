import { MapData } from "@main/cache/model/map-data";
import { mapContentAPI } from "@main/content/map-content";
import { ipcMain } from "electron";

function init() {
    mapContentAPI.init();
}

function registerIpcHandlers() {
    ipcMain.handle("maps:downloadMap", (_, scriptName: string) => mapContentAPI.downloadMap(scriptName));
    ipcMain.handle("maps:downloadMaps", (_, scriptNames: string[]) => mapContentAPI.downloadMaps(scriptNames));
    ipcMain.handle("maps:getInstalledVersions", () => mapContentAPI.installedVersions);
    ipcMain.handle("maps:getMapByScriptName", (_, scriptName: string) => mapContentAPI.getMapByScriptName(scriptName));
    ipcMain.handle("maps:getMapImages", (_, mapData: MapData | undefined) => mapContentAPI.getMapImages(mapData));
    ipcMain.handle("maps:isVersionInstalled", (_, id: string) => mapContentAPI.isVersionInstalled(id));
}

const mapsService = {
    init,
    registerIpcHandlers,
};

export default mapsService;
