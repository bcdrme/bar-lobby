import { mapContentAPI } from "@main/content/map-content";
import { ipcMain } from "electron";

function init() {
    mapContentAPI.init();
}

function getInstalledVersions() {
   return mapContentAPI.installedVersions;
}

function registerIpcHandlers() {
    ipcMain.handle('map:getInstalledVersions', getInstalledVersions);
}

const mapService = {
    init,
    registerIpcHandlers
};

export default mapService;