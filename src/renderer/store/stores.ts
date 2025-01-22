import { initBattleStore } from "@renderer/store/battle.store";
import { initDownloadsStore } from "@renderer/store/downloads.store";
import { initEnginesStore } from "@renderer/store/engine.store";
import { initGameStore } from "@renderer/store/game.store";
import { initInfosStore } from "@renderer/store/infos.store";
import { initializeMatchmakingStore } from "@renderer/store/matchmaking.store";

import { initSettingsStore } from "@renderer/store/settings.store";
import { initTachyonStore } from "@renderer/store/tachyon.store";

export async function initPreMountStores() {
    await Promise.all([initSettingsStore(), initInfosStore(), initGameStore(), initDownloadsStore(), initBattleStore(), initEnginesStore(), initTachyonStore(), initializeMatchmakingStore()]);
}
