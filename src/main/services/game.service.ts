import { GameVersion } from "@main/content/game/game-version";
import { gameContentAPI } from "@main/content/game/game-content";
import { gameAPI } from "@main/game/game";
import { ipcMain } from "electron";
import { Replay } from "@main/content/replays/replay";

function init() {
    gameContentAPI.init();
}

function registerIpcHandlers(mainWindow: Electron.BrowserWindow) {
    // Content
    ipcMain.handle("game:downloadGame", (_, version: string) => gameContentAPI.downloadGame(version));
    ipcMain.handle("game:getGameOptions", (_, version: string) => gameContentAPI.getGameOptions(version));
    ipcMain.handle("game:getScenarios", () => gameContentAPI.getScenarios());
    ipcMain.handle("game:getInstalledVersions", () => gameContentAPI.installedVersions);
    ipcMain.handle("game:isVersionInstalled", (_, id: string) => gameContentAPI.isVersionInstalled(id));
    ipcMain.handle("game:uninstallVersion", (_, version: GameVersion) => gameContentAPI.uninstallVersion(version));

    // Game
    ipcMain.handle("game:launchGame", (_, script: string) => gameAPI.launch(script));
    ipcMain.handle("game:launchReplay", (_, replay: Replay) => gameAPI.launch(replay));

    // Events
    gameAPI.onGameLaunched.add(() => {
        mainWindow.webContents.send("game:launched");
    });
    gameAPI.onGameClosed.add(() => {
        mainWindow.webContents.send("game:closed");
    });
}

const gameService = {
    init,
    registerIpcHandlers,
};

export default gameService;
