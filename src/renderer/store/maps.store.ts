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
    window.maps.onMapDeleted((filename: string) => {
        console.debug("Received map deleted event", filename);
        db.maps.where("fileName").equals(filename).delete();
    });
    await syncMaps();
    mapsStore.isInitialized = true;
}

async function syncMaps() {
    console.debug("Syncing maps");
    // Sync all maps with actual files in map folder
    const allMaps = await db.maps.toArray();
    window.maps.sync(allMaps.map((map) => ({ scriptName: map.scriptName, fileName: map.fileName })));
}
