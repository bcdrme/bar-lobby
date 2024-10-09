import { initBattleStore } from "@renderer/store/battle.store";
import { initDownloadsStore } from "@renderer/store/downloads.store";
import { initGameStore } from "@renderer/store/game.store";
import { initInfosStore } from "@renderer/store/infos.store";
import { initMapsStore } from "@renderer/store/maps.store";
import { initSettingsStore } from "@renderer/store/settings.store";

export async function initStores() {
    await Promise.all([initMapsStore(), initSettingsStore(), initInfosStore(), initGameStore(), initDownloadsStore(), initBattleStore()]);
}
