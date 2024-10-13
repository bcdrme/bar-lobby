import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import * as fs from "fs";
import { Signal } from "$/jaz-ts-utils/signal";
import * as path from "path";

import { engineContentAPI } from "@main/content/engine/engine-content";
import { mapContentAPI } from "@main/content/maps/map-content";

import { Replay } from "@main/content/replays/replay";
import { startScriptConverter } from "@main/utils/start-script-converter";
import { defaultEngineVersion } from "@main/config/default-versions";
import { logger } from "@main/utils/logger";
import { gameContentAPI } from "@main/content/game/game-content";
import { CONTENT_PATH } from "@main/config/app";
import { Battle, isBattle } from "@renderer/game/abstract-battle";

const log = logger("main/game/game.ts");

export class GameAPI {
    public onGameLaunched = new Signal();
    public onGameClosed: Signal<number | null> = new Signal();
    public readonly scriptName = "script.txt";

    protected gameProcess: ChildProcess | null = null;

    public async launch(battle: Battle): Promise<void>;
    public async launch(replay: Replay): Promise<void>;
    public async launch(script: string): Promise<void>;
    public async launch(arg: Battle | Replay | string): Promise<void> {
        try {
            let engineVersion: string;
            let gameVersion: string;
            let mapName: string;
            let script: string | undefined;

            if (isBattle(arg)) {
                engineVersion = arg.battleOptions.engineVersion;
                gameVersion = arg.battleOptions.gameVersion;
                mapName = arg.battleOptions.map;
                script = startScriptConverter.generateScriptStr(arg);
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

            log.info(`Launching game with engine: ${engineVersion}, game: ${gameVersion}, map: ${mapName}`);
            await this.fetchMissingContent(engineVersion, gameVersion, mapName);

            const enginePath = path.join(CONTENT_PATH, "engine", engineVersion).replaceAll("\\", "/");

            let launchArg = "";
            if (script) {
                const scriptPath = (launchArg = path.join(CONTENT_PATH, this.scriptName));
                await fs.promises.writeFile(scriptPath, script);
            }
            // else if (isReplay(arg)) {
            //     launchArg = arg.filePath ? arg.filePath : path.join(REPLAYS_PATH, arg.fileName);
            // }

            const args = ["--write-dir", CONTENT_PATH, "--isolation", launchArg];

            const binaryName = process.platform === "win32" ? "spring.exe" : "./spring";
            log.debug(`Running binary: ${path.join(enginePath, binaryName)}, args: ${args}`);
            this.gameProcess = spawn(binaryName, args, {
                cwd: enginePath,
                stdio: "ignore",
                detached: true,
            });

            this.gameProcess.addListener("error", (err) => {
                log.error(err);
            });

            this.gameProcess.addListener("exit", (code) => {
                if (code !== 0) {
                    log.error(`Game process exited with code: ${code}`);
                } else {
                    log.debug(`Game process exited with code: ${code}`);
                }
            });

            this.gameProcess.addListener("spawn", () => {
                this.onGameLaunched.dispatch();
                // this.updateLastLaunched(engineVersion, gameVersion, mapName);
            });

            this.gameProcess.addListener("close", (exitCode) => {
                this.gameProcess = null;
                this.onGameClosed.dispatch(exitCode);
            });
            log.debug(`Game process PID: ${this.gameProcess.pid}`);
        } catch (err) {
            log.error(err);
        }
    }

    public isGameRunning() {
        return this.gameProcess !== null;
    }

    protected async fetchMissingContent(engineVersion: string, gameVersion: string, mapScriptName: string) {
        const isEngineInstalled = engineContentAPI.isVersionInstalled(engineVersion);
        const isGameInstalled = gameContentAPI.isVersionInstalled(gameVersion);
        const isMapInstalled = mapContentAPI.isVersionInstalled(mapScriptName);
        if (!isEngineInstalled || !isGameInstalled || !isMapInstalled) {
            //TODO replace with an event
            // api.notifications.alert({
            //     text: "Downloading missing content - the game will auto-launch when downloads complete",
            // });
            return Promise.all([engineContentAPI.downloadEngine(engineVersion), gameContentAPI.downloadGame(gameVersion), mapContentAPI.downloadMap(mapScriptName)]);
        }
        return;
    }
}

export const gameAPI = new GameAPI();
