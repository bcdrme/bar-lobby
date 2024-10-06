import { GameVersion } from "@main/cache/model/game-version";
import { gameContentAPI } from "@main/content/game/game-content";
import { gameAPI } from "@main/game/game";
import { ipcMain } from "electron";

function init() {
    gameContentAPI.init();
}

function registerIpcHandlers() {
    // Content
    ipcMain.handle("game:downloadGame", (_, version: string) => gameContentAPI.downloadGame(version));
    ipcMain.handle("game:getGameOptions", (_, version: string) => gameContentAPI.getGameOptions(version));
    ipcMain.handle("game:getScenarios", () => gameContentAPI.getScenarios());
    ipcMain.handle("game:getInstalledVersions", () => gameContentAPI.installedVersions);
    ipcMain.handle("game:isVersionInstalled", (_, id: string) => gameContentAPI.isVersionInstalled(id));
    ipcMain.handle("game:uninstallVersion", (_, version: GameVersion) => gameContentAPI.uninstallVersion(version));

    // Game
    ipcMain.handle("game:launchGame", (_, script: string) => gameAPI.launch(script));

    // Events
    gameAPI.onGameLaunched.add(() => {
        ipcMain.emit("game:launched");
    });
    gameAPI.onGameClosed.add(() => {
        ipcMain.emit("game:closed");
    });
}

const gameService = {
    init,
    registerIpcHandlers,
};

export default gameService;
