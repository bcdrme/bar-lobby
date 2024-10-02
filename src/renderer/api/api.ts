import { audioApi } from "./audio";
import { notificationsApi } from "./notifications";
import { utilsApi } from "./utils";

interface API {
    account: typeof window.account;
    audio: typeof audioApi;
    cacheDb: typeof window.replays;
    //TODO implement comms
    comms: any;
    // content: ContentAPI;
    // game: GameAPI;
    info: typeof window.info;
    notifications: typeof notificationsApi;
    prompt: typeof prompt;
    //TODO implement sesssion
    session: any;
    settings: typeof window.settings;
    utils: typeof utilsApi;
}

declare global {
    const api: API;
    interface Window {
        api: API;
    }
}

export async function apiInit() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api: API = (window.api = {} as any);

    // replaced by utilsApi
    // api.utils = new UtilsAPI();
    api.utils = utilsApi;

    // replaced by window.info
    // api.info = await ipcRenderer.invoke("getInfo");
    api.info = window.info;

    // replaced by window.settings
    // api.settings = await new StoreAPI(settingsFilePath, settingsSchema).init();
    api.settings = window.settings;

    // TODO implement session when new tachyon protocol is released
    // api.session = new SessionAPI();
    // Mock session object
    api.session = {
        updateUserBattleStauts: () => {},
        getUserById: () => {},
        getUserByName: () => {},
        fetchUserById: () => {},
        updateBattleList: () => {},
        onlineUser: {
            battleStatus: {
                ready: false,
                sync: {
                    engine: 0,
                    game: 0,
                    map: 0,
                }
            }
        },
        onlineBattle: {
            battleOptions: {}
        }
    };

    // replaced by nothing, use useRouter instead
    // api.router = 

    // replaced by window.replays
    // api.cacheDb = await new CacheDbAPI().init();
    api.cacheDb = window.replays;

    // replaced by audioApi
    // api.audio = await new AudioAPI().init();
    api.audio = audioApi;

    // replaced by window.account
    // api.account = await new StoreAPI(accountFilePath, accountSchema).init();
    api.account = window.account;

    // api.game = new GameAPI();

    // TODO implement session when new tachyon protocol is released
    // api.comms = new CommsAPI(serverConfig);
    // Mock comms object
    api.comms = {
        request: () => {}
    };

    // api.content = await new ContentAPI().init();

    // replaced by notificationsApi
    // api.notifications = new NotificationsAPI();
    api.notifications = notificationsApi;

    // replaced by nothing, use prompt directly when needed
    api.prompt = prompt;
}
