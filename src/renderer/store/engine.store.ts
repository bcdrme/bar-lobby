import { reactive } from "vue";
import { db } from "@renderer/store/db";

export const enginesStore = reactive({
    isInitialized: false,
} as {
    isInitialized: boolean;
});

export async function initEnginesStore() {
    const engineVersions = await window.engine.getInstalledVersions();
    await db.engineVersions.clear();
    await db.engineVersions.bulkAdd(engineVersions);
    enginesStore.isInitialized = true;
}
