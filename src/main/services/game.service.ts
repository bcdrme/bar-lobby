import { gameContentAPI } from "@main/content/game/game-content";
import { gameAPI } from "@main/game/game";
import { ipcMain } from "electron";
import { Replay } from "@main/content/replays/replay";
import { BattleWithMetadata } from "@main/game/battle/battle-types";

async function init() {
    await gameContentAPI.init();
}

function registerIpcHandlers(mainWindow: Electron.BrowserWindow) {
    // Content
    ipcMain.handle("game:downloadGame", (_, version: string) => gameContentAPI.downloadGame(version));
    ipcMain.handle("game:getScenarios", (_, version: string) => gameContentAPI.getScenarios(version));
    ipcMain.handle("game:getInstalledVersions", () => gameContentAPI.installedVersions.values().toArray());
    ipcMain.handle("game:isVersionInstalled", (_, id: string) => gameContentAPI.isVersionInstalled(id));
    ipcMain.handle("game:uninstallVersion", (_, version: string) => gameContentAPI.uninstallVersionById(version));

    // Game
    ipcMain.handle("game:launchScript", (_, script: string) => gameAPI.launchScript(script));
    ipcMain.handle("game:launchReplay", (_, replay: Replay) => gameAPI.launchReplay(replay));
    ipcMain.handle("game:launchBattle", (_, battle: BattleWithMetadata) => gameAPI.launchBattle(battle));

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
