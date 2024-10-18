import { randomFromArray } from "$/jaz-ts-utils/object";
import { defaultMaps } from "@main/config/default-maps";
import { DEFAULT_ENGINE_VERSION, DEFAULT_GAME_VERSION } from "@main/config/default-versions";
import { BattleContenderConfig, BattleOptions, Bot, StartPosType } from "@main/game/battle/battle-types";
import { User } from "@main/model/user";
import { db } from "@renderer/store/db";
import { defaultMapBoxes } from "@renderer/utils/start-boxes";
import { reactive, readonly } from "vue";

export const battleStore = reactive(
    {} as {
        battleOptions: BattleOptions;
        battleState: {
            startTime?: Date;
        };
        contenders: Array<BattleContenderConfig>;
    }
);

export const battleStateStore = readonly(
    {} as {
        startTime?: Date;
        participants: Array<Bot | User>;
        players: Array<User>;
        spectators: Array<User>;
        teams: Map<number, Array<User | Bot>>;
    }
);

export async function defaultBattle(mapScriptName?: string) {
    const me = api.session.offlineUser;
    const map = mapScriptName ?? randomFromArray(defaultMaps)!;

    me.battleStatus.playerId = 0;
    me.battleStatus.teamId = 0;
    me.battleStatus.isSpectator = false;

    const engine = await db.engineVersions.orderBy("version").last();
    const barb = engine?.ais.find((ai) => ai.shortName === "BARb");

    return {
        battleOptions: {
            title: "Offline Custom Battle",
            engineVersion: DEFAULT_ENGINE_VERSION,
            gameVersion: DEFAULT_GAME_VERSION,
            map: map,
            startPosType: StartPosType.Boxes,
            startBoxes: defaultMapBoxes(),
            gameOptions: {},
            mapOptions: {},
            restrictions: [],
        } as BattleOptions,
        battleState: {},
        users: [me],
        bots: barb ? [{ playerId: 1, teamId: 1, ownerUserId: me.userId, name: barb.name, aiShortName: barb.shortName, aiOptions: {} }] : [],
    };
}

export async function resetToDefaultBattle() {
    const battle = await defaultBattle();
    Object.assign(battleStore, battle);
}

export async function initBattleStore() {
    resetToDefaultBattle();
}
