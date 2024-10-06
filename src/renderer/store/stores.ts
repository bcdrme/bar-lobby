import { initInfosStore } from "@renderer/store/infos.store";
import { initMapsStore } from "@renderer/store/maps.store";
import { initSettingsStore } from "@renderer/store/settings.store";

export async function initStores() {
    await Promise.all([initMapsStore(), initSettingsStore(), initInfosStore()]);
}
