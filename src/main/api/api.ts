import * as fs from "fs";
import * as path from "path";
import { Router, createRouter, createMemoryHistory } from "vue-router";

import { AudioAPI } from "@/api/audio";
import { CacheDbAPI } from "@/api/cache-db";
// import { CommsAPI } from "@/api/comms";
import { ContentAPI } from "@/api/content/content";
import { GameAPI } from "@/api/game";
import { NotificationsAPI } from "@/api/notifications";
import { SessionAPI } from "@/api/session";
import { StoreAPI } from "@/api/store";
import { UtilsAPI } from "@/api/utils";
import { serverConfig } from "@/config/server";
import { accountSchema } from "$/model/account";
import type { Info } from "$/model/info";
import { settingsSchema } from "$/model/settings";

interface API {
    account: StoreAPI<typeof accountSchema>;
    audio: AudioAPI;
    cacheDb: CacheDbAPI;
    // comms: CommsAPI;
    content: ContentAPI;
    game: GameAPI;
    info: Info;
    notifications: NotificationsAPI;
    router: Router;
    session: SessionAPI;
    settings: StoreAPI<typeof settingsSchema>;
    utils: UtilsAPI;
}

declare global {
    const api: API;
}

export async function apiInit() {
    const utils = new UtilsAPI();
    // const info = await ipcRenderer.invoke("getInfo");
    // const settingsFilePath = path.join(api.info.configPath, "settings.json");
    // const settings = await new StoreAPI(settingsFilePath, settingsSchema).init();
    // await fs.promises.mkdir(api.info.contentPath, {
    //     recursive: true,
    // });
    const session = new SessionAPI();
    // const router = createRouter({
    //     history: createMemoryHistory(),
    //     routes,
    // });
    const cacheDb = await new CacheDbAPI().init();
    const audio = await new AudioAPI().init();
    // const accountFilePath = path.join(api.info.configPath, "account.json");
    // const account = await new StoreAPI(accountFilePath, accountSchema).init();
    const game = new GameAPI();
    // const comms = new CommsAPI(serverConfig);
    const content = await new ContentAPI().init();
    const notifications = new NotificationsAPI();
    return {
        utils,
        // info,
        // settings,
        session,
        // router,
        cacheDb,
        audio,
        // account,
        game,
        // comms,
        content,
        notifications,
    } as API
}
