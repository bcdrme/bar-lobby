import * as fs from "fs";
import * as path from "path";
import { ipcRenderer } from "electron";
import { createApp, reactive, toRefs } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { createRouterLayout } from "vue-router-layout";
import VueNextSelect from "vue-next-select";
import VueSlider from "vue-slider-component";
import Ajv from "ajv";
import { TachyonClient } from "tachyon-client";
import "vue-next-select/dist/index.css";
import "vue-slider-component/theme/default.css";

import App from "@/App.vue";
import "@/assets/styles/styles.scss";
import routes from "@/routes";
import { StoreAPI } from "@/api/store";
import { AlertsAPI } from "@/api/alerts";
import { settingsSchema, SettingsType } from "@/model/settings";
import { accountSchema, AccountType } from "@/model/account";
import { sessionSchema, SessionType } from "@/model/session";
import { AudioAPI } from "@/api/audio";
import { GameAPI } from "@/api/game";
import { ModalsAPI } from "@/api/modals";
import { ContentAPI } from "@/api/content";
import DefaultLayout from "@/layouts/default.vue";
import { WorkersAPI } from "@/api/workers";

declare module "vue-router" {
    interface RouteMeta {
        title?: string;
        order?: number;
        transition?: string;
        offline?: boolean;
    }
}

(async () => {
    window.info = await ipcRenderer.invoke("getInfo");

    const settingsAPI = await new StoreAPI<SettingsType>("settings", settingsSchema, true).init();

    await fs.promises.mkdir(settingsAPI.model.dataDir.value, { recursive: true });

    // TODO: API this
    const ajv = new Ajv({ coerceTypes: true, useDefaults: true });
    const sessionValidator = ajv.compile(sessionSchema);
    const session = reactive({}) as SessionType;
    sessionValidator(session);

    const userDataDir = window.info.userDataPath;
    const dataDir = settingsAPI.model.dataDir;

    window.api = {
        session: toRefs(session),
        settings: settingsAPI,
        client: new TachyonClient({
            host: "server2.beyondallreason.info",
            port: 8202,
            verbose: process.env.NODE_ENV !== "production"
        }),
        audio: new AudioAPI(),
        alerts: new AlertsAPI(),
        modals: new ModalsAPI(),
        accounts: await new StoreAPI<AccountType>("accounts", accountSchema).init(),
        game: new GameAPI(userDataDir, dataDir),
        content: await new ContentAPI(userDataDir, dataDir).init(),
        workers: new WorkersAPI({
            mapCache: new Worker(new URL("./workers/map-cache-worker.ts", import.meta.url), { type: "module" })
        })
    };

    window.api.client.socket?.on("connect", () => {
        window.api.session.offline.value = false;
    });

    window.api.client.socket?.on("close", () => {
        window.api.session.offline.value = true;
    });

    document.addEventListener("keydown", (event) => {
        if (event.code === "F11") {
            event.preventDefault();
        }
    });

    window.api.audio.init();

    const cacheStoreDir = path.join(window.info.userDataPath, "store");
    const mapCacheFile = path.join(cacheStoreDir, "map-cache.json");

    await window.api.workers.mapCache.init([ mapCacheFile, window.api.settings.model.dataDir.value ]);

    await setupVue();
})();

async function setupVue() {
    const RouterLayout = createRouterLayout(async () => DefaultLayout);

    const router = createRouter({
        history: createWebHashHistory(),
        routes: [
            {
                path: "/",
                component: RouterLayout,
                children: routes
            }
        ]
    });

    const app = createApp(App);

    app.use(router);
    app.component("vue-select", VueNextSelect);
    app.component("vue-slider", VueSlider);
    app.mount("#app");

    app.config.globalProperties.window = window;
    if (process.env.NODE_ENV !== "production") {
        (window as any).router = router;
    }
}