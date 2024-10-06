import { audioApi } from "./audio";
import { notificationsApi } from "./notifications";
import { utilsApi } from "./utils";
import { EngineVersion } from "@main/cache/model/engine-version";
import { GameVersion } from "@main/cache/model/game-version";
import { MapData } from "@main/cache/model/map-data";
import { Account } from "@main/services/account.service";
import { Message } from "@renderer/model/messages";

interface API {
    account: Account;
    audio: typeof audioApi;
    cacheDb: typeof window.replays;
    content: {
        engine: {
            installedVersions: EngineVersion[];
        };
        game: {
            installedVersions: GameVersion[];
        };
        maps: {
            installedVersions: MapData[];
        };
    };
    //TODO implement comms
    comms: any;
    // game: GameAPI;
    game: any;
    info: typeof window.info;
    notifications: typeof notificationsApi;
    prompt: typeof prompt;
    router: any;
    //TODO implement sesssion
    session: any;
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

    // replaced by settingsStore
    // api.settings = await new StoreAPI(settingsFilePath, settingsSchema).init();

    // TODO implement session when new tachyon protocol is released
    // api.session = new SessionAPI();
    // Mock session object
    api.session = {
        directMessages: new Map<number, Message[]>([
            [
                1,
                [
                    {
                        type: "chat",
                        senderUserId: 1,
                        text: "Hello",
                    },
                ],
            ],
            [2, []],
            [3, []],
        ]),
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
                },
            },
        },
        onlineBattle: undefined,
        // {
        //     contenders: [],
        //     bots: [],
        //     spectators: [],
        //     battleOptions: {},
        //     battleStatus: {
        //         ready: false,
        //         sync: {
        //             engine: 0,
        //             game: 0,
        //             map: 0,
        //         },
        //     },
        // },
        offlineBattle: {
            open: () => {},
            contenders: [],
            bots: [],
            spectators: [],
            battleOptions: {},
            battleStatus: {
                ready: false,
                sync: {
                    engine: 0,
                    game: 0,
                    map: 0,
                },
            },
        },
        offlineUser: {
            battleStatus: {
                ready: false,
                sync: {
                    engine: 0,
                    game: 0,
                    map: 0,
                },
            },
        },
        offlineMode: false,
        outgoingFriendRequests: [],
        incomingFriendRequests: [],
        friends: [],
    };

    // replaced by nothing, use useRouter instead
    // api.router = useRouter();

    // replaced by window.replays
    // api.cacheDb = await new CacheDbAPI().init();
    api.cacheDb = window.replays;

    // replaced by audioApi
    await audioApi.init();
    api.audio = audioApi;

    // replaced by window.account
    // api.account = await new StoreAPI(accountFilePath, accountSchema).init();
    api.account = await window.account.getAccount();

    // api.game = new GameAPI();
    api.game = {
        isGameRunning: false,
    };

    // TODO implement session when new tachyon protocol is released
    // api.comms = new CommsAPI(serverConfig);
    // Mock comms object
    api.comms = {
        connect: () => {},
        disconnect: () => {},
        request: () => {},
        isConnected: false,
        config: {
            host: "localhost",
            port: 1234,
        },
    };

    api.content = {
        engine: {
            installedVersions: [],
        },
        game: {
            installedVersions: [],
        },
        maps: {
            installedVersions: [],
        },
    };
    api.content.engine.installedVersions = await window.engine.getInstalledVersions();
    api.content.game.installedVersions = await window.game.getInstalledVersions();
    api.content.maps.installedVersions = await window.maps.getInstalledVersions();

    // replaced by notificationsApi
    // api.notifications = new NotificationsAPI();
    api.notifications = notificationsApi;

    // replaced by nothing, use prompt directly when needed
    api.prompt = prompt;
}
