import { gameContentAPI } from "@main/content/game-content";
import { ipcMain } from "electron";

function init() {
    gameContentAPI.init();
}

function getInstalledVersions() {
   return gameContentAPI.installedVersions;
}

function registerIpcHandlers() {
    ipcMain.handle('game:getInstalledVersions', getInstalledVersions);
}

const gameService = {
    init,
    registerIpcHandlers
};

export default gameService;