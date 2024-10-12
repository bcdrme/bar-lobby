import { Replay } from "@main/content/replays/replay";
import { db } from "@renderer/store/db";
import { reactive } from "vue";

export const replaysStore = reactive({
    isInitialized: false,
} as {
    isInitialized: boolean;
});

export async function initReplaysStore() {
    window.replays.onReplayCached((replay: Replay) => {
        console.debug("Received replay cached event", replay);
        db.replays.add(replay);
    });
    // await window.replays.refreshCache();
    replaysStore.isInitialized = true;
}
