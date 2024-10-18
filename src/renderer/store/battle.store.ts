import { BattleOptions, Bot, Faction, StartPosType } from "@main/game/battle/battle-types";
import { User } from "@main/model/user";
import { db } from "@renderer/store/db";
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
        _battleMetadataStore.teams = new Map<number, Array<User | Bot>>();
        for (const participant of _battleMetadataStore.participants) {
            const teamId = participant.battleStatus?.teamId || 0;
            if (!_battleMetadataStore.teams.has(teamId)) {
                _battleMetadataStore.teams.set(teamId, []);
            }
            _battleMetadataStore.teams.get(teamId)?.push(participant);
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

    let map;
    if (mapScriptName) {
        map = await db.maps.where("scriptName").equals(mapScriptName).first();
    } else {
        const count = await db.maps.count();
        const randomIndex = Math.floor(Math.random() * count);
        map = await db.maps.offset(randomIndex).first();
    }

    if (!map) {
        throw new Error("No maps available");
    }

    const barbAi = engine.ais.find((ai) => ai.shortName === "BARb");

    return {
        battleOptions: {
            title: "Offline Custom Battle",
            engineVersion: engine.id,
            gameVersion: game.gameVersion,
            map: mapScriptName,
            startPosType: StartPosType.Boxes,
            startBoxes: defaultMapBoxes(),
            gameOptions: {},
            mapOptions: {},
            restrictions: [],
        } as BattleOptions,
        metadata: {},
        users: [me],
        bots: barbAi ? [{ playerId: 666, battleStatus: { faction: Faction.Armada, teamId: 1 }, ownerUserId: me.userId, name: barbAi.name, aiShortName: barbAi.shortName, aiOptions: {} }] : [],
        spectators: [],
        started: false,
    } as BattleState;
}

export interface BattleState {
    battleOptions: BattleOptions;
    users: User[];
    bots: Bot[];
    spectators: User[];
    started: boolean;
}

interface BattleStateMetadata {
    startTime?: Date;
    participants: Array<Bot | User>;
    players: Array<User>;
    teams: Map<number, Array<User | Bot>>;
}

export async function resetToDefaultBattle() {
    const battle = await defaultBattle();
    Object.assign(battleStore, battle);
}

export async function initBattleStore() {
    await resetToDefaultBattle();
}
