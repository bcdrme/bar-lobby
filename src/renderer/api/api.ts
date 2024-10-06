import { notificationsApi } from "./notifications";
import { EngineVersion } from "@main/cache/model/engine-version";
import { GameVersion } from "@main/cache/model/game-version";
import { MapData } from "@main/cache/model/map-data";
import { Account } from "@main/services/account.service";
import { Message } from "@renderer/model/messages";

interface API {
    account: Account;
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
    notifications: typeof notificationsApi;
    //TODO implement prompt, see usePrompt
    prompt: typeof prompt;
    //TODO implement sesssion
    session: any;
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

    // replaced by window.account
    // api.account = await new StoreAPI(accountFilePath, accountSchema).init();
    api.account = await window.account.getAccount();

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
