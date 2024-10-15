import { db } from "@renderer/store/db";
import { reactive } from "vue";

export const gameStore = reactive({
    isInitialized: false,
    isGameRunning: false,
});

export async function initGameStore() {
    window.game.onGameLaunched(() => {
        console.debug("Game loaded");
        gameStore.isGameRunning = true;
    });
    window.game.onGameClosed(() => {
        console.debug("Game closed");
        gameStore.isGameRunning = false;
    });

    db.gameVersions.clear();
    const installedVersions = await window.game.getInstalledVersions();
    db.gameVersions.bulkAdd(installedVersions);

    gameStore.isInitialized = true;
}
