import { EngineVersion } from "@main/content/engine/engine-version";
import { GameVersion } from "@main/content/game/game-version";
import { MapData } from "@main/content/maps/map-data";
import { Replay } from "@main/content/replays/replay";
import Dexie, { EntityTable } from "dexie";

export async function initDb() {
    await db.open();
    await db.maps.toArray();
}

export const db = new Dexie("BarLobby") as Dexie & {
    replays: EntityTable<Replay, "fileName">;
    maps: EntityTable<MapData, "scriptName">;
    gameVersions: EntityTable<GameVersion, "gameVersion">;
    engineVersions: EntityTable<EngineVersion, "id">;
};

db.version(1).stores({
    replays:
        "fileName, gameId, filePath, engineVersion, gameVersion, mapScriptName, startTime, gameDurationMs, gameEndedNormally, hasBots, winningTeamId, teams, contenders, spectators, battleSettings, hostSettings, gameSettings, mapSettings",
    maps: `
        scriptName,
        fileName,
        friendlyName,
        author,
        width,
        height,
        isInstalled,
        isDownloading
      `,
    gameVersions: "gameVersion, packageMd5",
    engineVersions: "id, lastLaunched, ais",
});

db.on("ready", function () {
    console.log("Database is ready");
});
db.on("populate", function () {
    console.log("Database is populated");
});
db.on("blocked", function () {
    console.log("Database is blocked");
});
db.on("versionchange", function () {
    console.log("Database is versionchange");
});
db.on("close", function () {
    console.log("Database is close");
});
