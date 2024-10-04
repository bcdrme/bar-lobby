import { GameVersion } from "@main/cache/model/game-version";
import { gameContentAPI } from "@main/content/game-content";
import { ipcMain } from "electron";

function init() {
    gameContentAPI.init();
}

function registerIpcHandlers() {
    ipcMain.handle("game:downloadGame", (_, version: string) => gameContentAPI.downloadGame(version));
    ipcMain.handle("game:getGameOptions", (_, version: string) => gameContentAPI.getGameOptions(version));
    ipcMain.handle("game:getScenarios", () => gameContentAPI.getScenarios());
    ipcMain.handle("game:getInstalledVersions", () => gameContentAPI.installedVersions);
    ipcMain.handle("game:isVersionInstalled", (_, id: string) => gameContentAPI.isVersionInstalled(id));
    ipcMain.handle("game:uninstallVersion", (_, version: GameVersion) => gameContentAPI.uninstallVersion(version));
}

const gameService = {
    init,
    registerIpcHandlers,
};

export default gameService;
