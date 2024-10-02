import { engineContentAPI } from "@main/content/engine-content";
import { ipcMain } from "electron";

function init() {
    engineContentAPI.init();
}

function getInstalledVersions() {
   return engineContentAPI.installedVersions;
}

function registerIpcHandlers() {
    ipcMain.handle('engine:getInstalledVersions', getInstalledVersions);
}

const engineService = {
    init,
    registerIpcHandlers
};

export default engineService;