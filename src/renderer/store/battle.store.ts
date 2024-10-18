import { BattleOptions, Bot, Faction, StartPosType } from "@main/game/battle/battle-types";
import { User } from "@main/model/user";
import { db } from "@renderer/store/db";
import { deepToRaw } from "@renderer/utils/deep-toraw";
import { defaultMapBoxes } from "@renderer/utils/start-boxes";
import { _ } from "ajv";
import { reactive, readonly, watch } from "vue";

export const battleStore = reactive({} as BattleState);

const _battleMetadataStore = reactive({} as BattleStateMetadata);
export const battleMetadataStore = readonly(_battleMetadataStore);

watch(
    battleStore,
    (battle) => {
        _battleMetadataStore.participants = [...battle.users, ...battle.bots, ...battle.spectators];
        _battleMetadataStore.players = battle.users;
        _battleMetadataStore.teams = [];
        for (const participant of _battleMetadataStore.participants) {
            const teamId = participant.battleStatus.teamId;
            if (!_battleMetadataStore.teams[teamId]) {
                _battleMetadataStore.teams[teamId] = [];
            }
        }
        if (battle.started) _battleMetadataStore.startTime = new Date();
        console.debug("UPDATED battleMetadataStore");
        console.debug(JSON.stringify(battleMetadataStore, null, 2));
    },
    { deep: true }
);

export async function defaultBattle(mapScriptName?: string) {
    const me = api.session.offlineUser;

    const engine = await db.engineVersions.orderBy("id").first();
    if (!engine) {
        throw new Error("No engines available");
    }

    const game = await db.gameVersions.orderBy("gameVersion").first();
    if (!game) {
        throw new Error("No games available");
    }

    let map: string;
    if (mapScriptName) {
        map = (await db.maps.where("scriptName").equals(mapScriptName).first())?.scriptName;
    } else {
        const count = await db.maps.count();
        const randomIndex = Math.floor(Math.random() * count);
        map = (await db.maps.offset(randomIndex).first())?.scriptName;
    }

    if (!map) {
        throw new Error("No maps available");
    }

    const barbAi = engine.ais.find((ai) => ai.shortName === "BARb");

    return {
        isOnline: false,
        battleOptions: {
            title: "Offline Custom Battle",
            engineVersion: engine.id,
            gameVersion: game.gameVersion,
            mapScriptName: mapScriptName,
            startPosType: StartPosType.Boxes,
            startBoxes: defaultMapBoxes(),
            gameOptions: {},
            mapOptions: {},
            restrictions: [],
        } as BattleOptions,
        metadata: {},
        users: [me],
        bots: barbAi ? [{ battleStatus: { faction: Faction.Armada, teamId: 1, participantId: -666 }, ownerUserId: me.userId, name: barbAi.name, aiShortName: barbAi.shortName, aiOptions: {} }] : [],
        spectators: [],
        started: false,
    } as BattleState;
}

export interface BattleState {
    isOnline: boolean;
    battleOptions: BattleOptions;
    users: User[];
    bots: Bot[];
    spectators: User[];
    started: boolean;
}

export interface BattleStateMetadata {
    startTime?: Date;
    participants: Array<Bot | User>;
    players: Array<User>;
    teams: Array<Array<User | Bot>>;
}

export async function resetToDefaultBattle() {
    const battle = await defaultBattle();
    Object.assign(battleStore, battle);
}

export async function initBattleStore() {
    await resetToDefaultBattle();
}

export async function startBattle() {
    await window.game.launchBattle(deepToRaw({ ...battleStore, ..._battleMetadataStore }));
}
