import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import * as fs from "fs";
import { Signal } from "$/jaz-ts-utils";
import * as path from "path";

import { cacheDb } from "@main/cache/cache-db";
import { engineContentAPI } from "@main/content/engine-content";
import { gameContentAPI } from "@main/content/game-content";
import { mapContentAPI } from "@main/content/map-content";
import { replaysDir, replaysService } from "@main/services/replays.service";
import { getInfo } from "@main/utils/info";
import { AbstractBattle } from "./battle/abstract-battle";
import { Replay } from "@main/cache/model/replay";
import { StartScriptConverter } from "@main/utils/start-script-converter";
import { defaultEngineVersion } from "@main/content/config/default-versions";
import { isReplay } from "@main/utils/type-checkers";

export class GameAPI {
    public onGameLaunched = new Signal();
    public onGameClosed: Signal<number | null> = new Signal();
    public readonly scriptName = "script.txt";

    protected gameProcess: ChildProcess | null = null;
    protected scriptConverter = new StartScriptConverter();

    public async launch(battle: AbstractBattle): Promise<void>;
    public async launch(replay: Replay): Promise<void>;
    public async launch(script: string): Promise<void>;
    public async launch(arg: AbstractBattle | Replay | string): Promise<void> {
        let engineVersion: string;
        let gameVersion: string;
        let mapName: string;
        let script: string | undefined;

        if (arg instanceof AbstractBattle) {
            engineVersion = arg.battleOptions.engineVersion;
            gameVersion = arg.battleOptions.gameVersion;
            mapName = arg.battleOptions.map;
            script = this.scriptConverter.generateScriptStr(arg);
        } else if (typeof arg === "string") {
            engineVersion = defaultEngineVersion;
            gameVersion = arg.match(/gametype\s*=\s*(.*);/)?.[1]!;
            mapName = arg.match(/mapname\s*=\s*(.*);/)?.[1]!;
            if (!gameVersion) {
                throw new Error("Could not parse game version from script");
            }
            if (!mapName) {
                throw new Error("Could not map name from script");
            }
            script = arg;
        } else {
            engineVersion = arg.engineVersion;
            gameVersion = arg.gameVersion;
            mapName = arg.mapScriptName;
        }

        await this.fetchMissingContent(engineVersion, gameVersion, mapName);

        const enginePath = path.join(getInfo().contentPath, "engine", engineVersion).replaceAll("\\", "/");

        let launchArg = "";
        if (script) {
            const scriptPath = (launchArg = path.join(getInfo().contentPath, this.scriptName));
            await fs.promises.writeFile(scriptPath, script);
        } else if (isReplay(arg)) {
            launchArg = arg.filePath ? arg.filePath : path.join(replaysDir, arg.fileName);
        }

        const args = ["--write-dir", getInfo().contentPath, "--isolation", launchArg];

        const binaryName = process.platform === "win32" ? "spring.exe" : "./spring";
        this.gameProcess = spawn(binaryName, args, {
            cwd: enginePath,
            stdio: "ignore",
            detached: true,
        });

        this.gameProcess.addListener("spawn", () => {
            this.onGameLaunched.dispatch();
            this.updateLastLaunched(engineVersion, gameVersion, mapName);
            // TODO send event to renderer "game started"
            // api.audio.muteMusic();
        });

        this.gameProcess.addListener("close", (exitCode) => {
            this.gameProcess = null;
            this.onGameClosed.dispatch(exitCode);
            replaysService.refreshCache();
            // TODO send event to renderer "game closed"
            // api.audio.unmuteMusic();
        });
    }

    public isGameRunning() {
        return this.gameProcess !== null;
    }

    protected async fetchMissingContent(engineVersion: string, gameVersion: string, mapScriptName: string) {
        const isEngineInstalled = engineContentAPI.isVersionInstalled(engineVersion);
        const isGameInstalled = gameContentAPI.isVersionInstalled(gameVersion);
        const isMapInstalled = mapContentAPI.isVersionInstalled(mapScriptName);
        if (!isEngineInstalled || !isGameInstalled || !isMapInstalled) {
            api.notifications.alert({
                text: "Downloading missing content - the game will auto-launch when downloads complete",
            });
            return Promise.all([engineContentAPI.downloadEngine(engineVersion), gameContentAPI.downloadGame(gameVersion), mapContentAPI.downloadMap(mapScriptName)]);
        }
        return;
    }

    protected async updateLastLaunched(engineVersion: string, gameVersion: string, mapScriptName: string) {
        try {
            await cacheDb
                .updateTable("engineVersion")
                .set({
                    lastLaunched: new Date(),
                })
                .where("id", "=", engineVersion)
                .execute();
        } catch (err) {
            console.error(`Error updating lastLaunched field for engine: ${engineVersion}`, err);
        }

        try {
            await cacheDb
                .updateTable("gameVersion")
                .set({
                    lastLaunched: new Date(),
                })
                .where("id", "=", gameVersion)
                .execute();
        } catch (err) {
            console.error(`Error updating lastLaunched field for game: ${gameVersion}`, err);
        }

        try {
            await cacheDb
                .updateTable("map")
                .set({
                    lastLaunched: new Date(),
                })
                .where("scriptName", "=", mapScriptName)
                .execute();
        } catch (err) {
            console.error(`Error updating lastLaunched field for map: ${mapScriptName}`, err);
        }
    }
}
