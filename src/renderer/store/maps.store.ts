import { reactive } from "vue";
import { MapData } from "@main/cache/model/map-data";

export const mapsStore = reactive({
    isInitialized: false,
    installedMaps: [],
} as {
    isInitialized: boolean;
    installedMaps: MapData[];
});

export async function getMapByScriptName(scriptName: string) {
    return mapsStore.installedMaps.find((map) => map.scriptName === scriptName);
}

export async function initMapsStore() {
    window.maps.onMapCached((mapData: MapData) => {
        console.debug("Received map cached event", mapData);
        mapsStore.installedMaps.push(mapData);
    });
    const currentMaps = await window.maps.getInstalledVersions();
    mapsStore.installedMaps = currentMaps;
    mapsStore.isInitialized = true;
}
