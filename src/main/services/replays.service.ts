import { ipcMain } from "electron";

import { cacheDb } from "@main/cache/cache-db";
import fs from "fs";
import path from "path";
import { delay } from "$/jaz-ts-utils/delay";
import { isFileInUse } from "@main/utils/file";
// import { DemoParser } from "sdfz-demo-parser";
import { Replay } from "@main/cache/model/replay";
import { CONTENT_PATH } from "@main/config/app";

const replayCacheQueue: Set<string> = new Set();
export const replaysDir = path.join(CONTENT_PATH, "demos");

async function init() {
    await fs.promises.mkdir(replaysDir, { recursive: true });
    refreshCache();
    startCacheReplaysRoutine();
}

async function refreshCache() {
    let replayFiles = await fs.promises.readdir(replaysDir);
    replayFiles = replayFiles.filter((replayFile) => replayFile.endsWith("sdfz"));
    const cachedReplayFiles = await cacheDb.selectFrom("replay").select(["fileName"]).execute();
    const cachedReplayFileNames = cachedReplayFiles.map((file) => file.fileName);
    const erroredReplayFiles = await cacheDb.selectFrom("replayError").select(["fileName"]).execute();
    const erroredReplayFileNames = erroredReplayFiles.map((file) => file.fileName);
    const replaysFilesToCache = replayFiles.filter((file) => !cachedReplayFileNames.includes(file) && !erroredReplayFileNames.includes(file));
    for (const replayFileToCache of replaysFilesToCache) {
        replayCacheQueue.add(path.join(replaysDir, replayFileToCache));
    }
}

async function startCacheReplaysRoutine() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const [replayToCache] = replayCacheQueue;
        if (replayToCache) {
            const fileInUse = await isFileInUse(replayToCache);
            if (fileInUse) {
                console.debug(`Cannot parse replay yet because it is still being written: ${replayToCache}`);
                replayCacheQueue.delete(replayToCache);
            } else {
                await cacheReplay(replayToCache);
                replayCacheQueue.delete(replayToCache);
            }
        } else {
            await delay(500);
        }
    }
}

// const demoParser = new DemoParser({
//     skipPackets: true,
// });

async function parseReplay(replayPath: string) {
    // const replayData = await demoParser.parseDemo(replayPath);
    const replayData = {} as any;

    const numOfPlayers = replayData.info.players.length + replayData.info.ais.length;
    let preset: "duel" | "team" | "ffa" | "teamffa" = "duel";
    if (replayData.info.allyTeams.length > 2 && replayData.info.players.some((player) => player.playerId !== player.allyTeamId)) {
        preset = "teamffa";
    } else if (replayData.info.allyTeams.length > 2) {
        preset = "ffa";
    } else if (numOfPlayers > 2) {
        preset = "team";
    }

    return {
        gameId: replayData.header.gameId,
        fileName: path.parse(replayPath).base,
        filePath: replayPath,
        engineVersion: replayData.info.meta.engine,
        gameVersion: replayData.info.meta.game,
        mapScriptName: replayData.info.meta.map,
        startTime: replayData.info.meta.startTime,
        gameDurationMs: replayData.info.meta.durationMs,
        gameEndedNormally: replayData.info.meta.winningAllyTeamIds.length > 0,
        chatlog: replayData.chatlog || null,
        hasBots: replayData.info.ais.length > 0,
        preset: preset,
        winningTeamId: replayData.info.meta.winningAllyTeamIds[0],
        teams: replayData.info.allyTeams,
        contenders: [...replayData.info.players, ...replayData.info.ais],
        spectators: replayData.info.spectators,
        script: replayData.script,
        battleSettings: replayData.info.hostSettings,
        gameSettings: replayData.info.gameSettings,
        mapSettings: replayData.info.mapSettings,
        hostSettings: replayData.info.spadsSettings ?? {},
    };
}

async function cacheReplay(replayFilePath: string) {
    const replayFileName = path.parse(replayFilePath).base;
    console.debug(`Caching: ${replayFileName}`);
    try {
        const replayData = await parseReplay(replayFilePath);
        if (replayData.gameId === "00000000000000000000000000000000") {
            throw new Error(`invalid gameId for replay: ${replayFileName}`);
        }
        const conflictingReplay = await getReplayByGameId(replayData.gameId);
        if (conflictingReplay) {
            // when leaving a game and rejoining it, 2 demo files are created with the same gameId. below we delete the shortest replay
            if (conflictingReplay.gameDurationMs > replayData.gameDurationMs) {
                await fs.promises.rm(replayFilePath);
            } else {
                await fs.promises.rm(conflictingReplay.filePath);
                await cacheDb
                    .insertInto("replay")
                    .values(replayData)
                    .onConflict((oc) => oc.doUpdateSet(replayData))
                    .execute();
            }
        } else {
            await cacheDb.insertInto("replay").values(replayData).execute();
        }
        console.debug(`Cached replay: ${replayFileName}`);
        ipcMain.emit("replays:replayCached", replayData);
    } catch (err) {
        console.error(`Error caching replay: ${replayFileName}`, err);
        await cacheDb
            .insertInto("replayError")
            .onConflict((oc) => oc.doNothing())
            .values({ fileName: replayFileName })
            .execute();
    }
}

export interface ReplayQueryOptions {
    offset?: number;
    limit?: number;
    endedNormally?: boolean | null;
    sortField?: keyof Replay | null;
    sortOrder?: "asc" | "desc";
}
async function getReplays({ offset = 0, limit = -1, endedNormally = true, sortField = null, sortOrder = "asc" }: ReplayQueryOptions) {
    let query = cacheDb.selectFrom("replay").selectAll();
    if (endedNormally !== null) {
        query = query.where("gameEndedNormally", "=", endedNormally);
    }
    if (sortField !== null) {
        query = query.orderBy(sortField, sortOrder);
    }
    return await query.offset(offset).limit(limit).execute();
}

async function getReplayById(replayId: number) {
    return cacheDb.selectFrom("replay").selectAll().where("replayId", "=", replayId).executeTakeFirst();
}

async function getReplayByGameId(gameId: string) {
    return cacheDb.selectFrom("replay").selectAll().where("gameId", "=", gameId).executeTakeFirst();
}

async function getTotalReplayCount() {
    const { num_replays } = await cacheDb.selectFrom("replay").select(cacheDb.fn.count<number>("replayId").as("num_replays")).executeTakeFirstOrThrow();
    return num_replays;
}

async function deleteReplay(replayId: number) {
    try {
        const { filePath } = await cacheDb.deleteFrom("replay").where("replayId", "=", replayId).returning("filePath").executeTakeFirstOrThrow();
        await fs.promises.rm(filePath);
    } catch (err) {
        console.error("Error deleting replay", err);
    }
}

function registerIpcHandlers() {
    ipcMain.handle("replays:getReplays", (_, args: ReplayQueryOptions) => getReplays(args));
    ipcMain.handle("replays:refreshCache", () => refreshCache());
    ipcMain.handle("replays:delete", (_, replayId: number) => deleteReplay(replayId));
    ipcMain.handle("replays:getReplayById", (_, replayId: number) => getReplayById(replayId));
    ipcMain.handle("replays:getReplayByGameId", (_, gameId: string) => getReplayByGameId(gameId));
    ipcMain.handle("replays:getTotalReplayCount", () => getTotalReplayCount());
}

export const replaysService = {
    init,
    registerIpcHandlers,
    refreshCache,
};
