import { EngineVersion } from "@main/content/engine/engine-version";
import { GameVersion } from "@main/content/game/game-version";
import { MapData } from "@main/content/maps/map-data";
import { Replay } from "@main/content/replays/replay";
import Dexie, { EntityTable } from "dexie";

export const db = new Dexie("BarLobby") as Dexie & {
    replays: EntityTable<Replay, "filePath">;
    maps: EntityTable<MapData, "scriptName">;
    gameVersions: EntityTable<GameVersion, "id">;
    engineVersions: EntityTable<EngineVersion, "id">;
};

db.version(1).stores({
    replays:
        "gameId, fileName, filePath, engineVersion, gameVersion, mapScriptName, startTime, gameDurationMs, gameEndedNormally, chatlog, hasBots, preset, winningTeamId, teams, contenders, spectators, script, battleSettings, hostSettings, gameSettings, mapSettings",
    maps: "scriptName, fileName, friendlyName, description, mapHardness, gravity, tidalStrength, maxMetal, extractorRadius, minWind, maxWind, width, height, minDepth, maxDepth, lastLaunched",
    gameVersions: "id, md5, lastLaunched, ais",
    engineVersions: "id, lastLaunched, ais",
});
