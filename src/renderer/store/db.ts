import { Replay } from "@main/cache/model/replay";
import Dexie, { EntityTable } from "dexie";

export const db = new Dexie("BarLobby") as Dexie & {
    replays: EntityTable<Replay, "replayId">;
};

db.version(1).stores({
    // replays: "++replayId, gameId, fileName, filePath, engineVersion, gameVersion, mapScriptName, startTime, gameDurationMs, gameEndedNormally, chatlog, hasBots, preset, winningTeamId, teams, contenders, spectators, script, battleSettings, hostSettings, gameSettings, mapSettings",
    replays:
        "++replayId, gameId, fileName, filePath, engineVersion, gameVersion, mapScriptName, startTime, gameDurationMs, gameEndedNormally, chatlog, hasBots, preset, winningTeamId, teams, contenders, spectators, script, battleSettings, hostSettings, gameSettings, mapSettings",
});
