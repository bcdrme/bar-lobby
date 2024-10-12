import { reactive } from "vue";
import { MapData } from "@main/cache/model/map-data";
import { db } from "@renderer/store/db";

export const mapsStore = reactive({
    isInitialized: false,
} as {
    isInitialized: boolean;
});

export async function initMapsStore() {
    window.maps.onMapCached((mapData: MapData) => {
        console.debug("Received map cached event", mapData);
        db.maps.add(mapData);
    });
    const currentMaps = await window.maps.getInstalledVersions();
    await db.maps.bulkPut(currentMaps);
    mapsStore.isInitialized = true;
}
