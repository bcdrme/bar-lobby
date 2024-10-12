import { ipcMain } from "electron";

import fs from "fs";
import path from "path";
import { delay } from "$/jaz-ts-utils/delay";
import { isFileInUse } from "@main/utils/file";
import { Replay } from "@main/content/replays/replay";
import { CONTENT_PATH } from "@main/config/app";
import { Signal } from "$/jaz-ts-utils/signal";
import { DemoParser } from "$/sdfz-demo-parser";

const replayCacheQueue: Set<string> = new Set();
export const replaysDir = path.join(CONTENT_PATH, "demos");

export const onReplayCached: Signal<Replay> = new Signal();

// TODO similar implemetation than maps with chokidar folder watching
async function init() {
    await fs.promises.mkdir(replaysDir, { recursive: true });
    refreshCache();
    startCacheReplaysRoutine();
}

//TODO transform this into a sync function, check the map-content.ts file for reference
async function refreshCache() {
    let replayFiles = await fs.promises.readdir(replaysDir);
    replayFiles = replayFiles.filter((replayFile) => replayFile.endsWith("sdfz"));
    for (const replayFileToCache of replayFiles) {
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

const demoParser = new DemoParser();
async function parseReplay(replayPath: string) {
    const replayData = await demoParser.parseDemo(replayPath);

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
    } as Replay;
}

async function cacheReplay(replayFilePath: string) {
    const replayFileName = path.parse(replayFilePath).base;
    console.debug(`Caching: ${replayFileName}`);
    try {
        const replayData = await parseReplay(replayFilePath);
        if (replayData.gameId === "00000000000000000000000000000000") {
            throw new Error(`invalid gameId for replay: ${replayFileName}`);
        }
        //TODO handle this case
        // const conflictingReplay = await getReplayByGameId(replayData.gameId);
        // if (conflictingReplay) {
        //     // when leaving a game and rejoining it, 2 demo files are created with the same gameId. below we delete the shortest replay
        //     if (conflictingReplay.gameDurationMs > replayData.gameDurationMs) {
        //         await fs.promises.rm(replayFilePath);
        //     } else {
        //         await fs.promises.rm(conflictingReplay.filePath);
        //         // await cacheDb
        //         //     .insertInto("replay")
        //         //     .values(replayData)
        //         //     .onConflict((oc) => oc.doUpdateSet(replayData))
        //         //     .execute();
        //     }
        // } else {
        //     // await cacheDb.insertInto("replay").values(replayData).execute();
        // }
        console.debug(`Cached replay: ${replayFileName}`);
        onReplayCached.dispatch(replayData);
    } catch (err) {
        console.error(`Error caching replay: ${replayFileName}`, err);
    }
}

async function deleteReplay(filename: string) {
    try {
        await fs.promises.rm(path.join(replaysDir, filename));
    } catch (err) {
        console.error("Error deleting replay", err);
    }
}

function registerIpcHandlers(mainWindow: Electron.BrowserWindow) {
    ipcMain.handle("replays:delete", (_, fileName: string) => deleteReplay(fileName));

    // Events
    onReplayCached.add((replay) => {
        mainWindow.webContents.send("replays:replayCached", replay);
    });
}

export const replaysService = {
    init,
    registerIpcHandlers,
};
