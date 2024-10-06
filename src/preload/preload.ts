import { contextBridge, ipcRenderer } from "electron";

import { Replay } from "@main/cache/model/replay";
import { Settings } from "@main/services/settings.service";
import { Info } from "@main/utils/info";
import { Account } from "@main/services/account.service";
import { ReplayQueryOptions } from "@main/services/replays.service";
import { EngineVersion } from "@main/cache/model/engine-version";
import { GameVersion } from "@main/cache/model/game-version";
import { MapData } from "@main/cache/model/map-data";
import { LuaOptionSection } from "@main/content/game/lua-options";
import { Scenario } from "@main/content/game/scenario";
import { MapImages } from "@main/content/maps/map-model";

console.log("preload.ts loaded");

const infoApi = {
    getInfo: (): Promise<Info> => ipcRenderer.invoke("info:get"),
};
export type InfoApi = typeof infoApi;
contextBridge.exposeInMainWorld("info", infoApi);

const mainWindowApi = {
    setFullscreen: (flag: boolean): Promise<void> => ipcRenderer.invoke("mainWindow:setFullscreen", flag),
    toggleFullscreen: (): Promise<void> => ipcRenderer.invoke("mainWindow:toggleFullscreen"),
    flashFrame: (flag: boolean): Promise<void> => ipcRenderer.invoke("mainWindow:flashFrame", flag),
};
export type MainWindowApi = typeof mainWindowApi;
contextBridge.exposeInMainWorld("mainWindow", mainWindowApi);

const shellApi = {
    openConfigDir: (): Promise<void> => ipcRenderer.invoke("shell:openConfigDir"),
    openContentDir: (): Promise<void> => ipcRenderer.invoke("shell:openContentDir"),
    openSettingsFile: (): Promise<void> => ipcRenderer.invoke("shell:openSettingsFile"),
};
export type ShellApi = typeof shellApi;
contextBridge.exposeInMainWorld("shell", shellApi);

const replaysApi = {
    getReplays: (args: ReplayQueryOptions): Promise<Replay[]> => ipcRenderer.invoke("replays:getReplays", args),
    refreshCache: (): Promise<void> => ipcRenderer.invoke("replays:refreshCache"),
    getTotalReplayCount: (): Promise<number> => ipcRenderer.invoke("replays:getTotalReplayCount"),
    deleteReplay: (replayId: number): Promise<void> => ipcRenderer.invoke("replays:delete", replayId),
    getReplayById: (replayId: number): Promise<number> => ipcRenderer.invoke("replays:getReplayById", replayId),
    getReplayByGameId: (gameId: string): Promise<string> => ipcRenderer.invoke("replays:getReplayByGameId", gameId),

    // Events
    //TODO replace any with proper type, check replayparser
    onReplayCached: (listener: (newReplay) => void) => ipcRenderer.on("replays:replayCached", listener),
};
export type ReplaysApi = typeof replaysApi;
contextBridge.exposeInMainWorld("replays", replaysApi);

const settingsApi = {
    getSettings: (): Promise<Settings> => ipcRenderer.invoke("settings:get"),
    updateSettings: (settings: Partial<Settings>): Promise<void> => ipcRenderer.invoke("settings:update", settings),
    toggleFullscreen: (): Promise<void> => ipcRenderer.invoke("settings:toggleFullscreen"),
};
export type SettingsApi = typeof settingsApi;
contextBridge.exposeInMainWorld("settings", settingsApi);

const accountApi = {
    getAccount: (): Promise<Account> => ipcRenderer.invoke("account:get"),
    updateAccount: (data: Partial<Account>): Promise<void> => ipcRenderer.invoke("account:update", data),
};
export type AccountApi = typeof accountApi;
contextBridge.exposeInMainWorld("account", accountApi);

const engineApi = {
    downloadEngine: (version: string): Promise<void> => ipcRenderer.invoke("engine:downloadEngine", version),
    getInstalledVersions: (): Promise<EngineVersion[]> => ipcRenderer.invoke("engine:getInstalledVersions"),
    isVersionInstalled: (id: string): Promise<boolean> => ipcRenderer.invoke("engine:isVersionInstalled", id),
    uninstallVersion: (version: EngineVersion): Promise<void> => ipcRenderer.invoke("engine:uninstallVersion", version),
};
export type EngineApi = typeof engineApi;
contextBridge.exposeInMainWorld("engine", engineApi);

const gameApi = {
    // Content
    downloadGame: (version: string): Promise<void> => ipcRenderer.invoke("game:downloadGame", version),
    getGameOptions: (version: string): Promise<LuaOptionSection[]> => ipcRenderer.invoke("game:getOptions", version),
    getScenarios: (): Promise<Scenario[]> => ipcRenderer.invoke("game:getScenarios"),
    getInstalledVersions: (): Promise<GameVersion[]> => ipcRenderer.invoke("game:getInstalledVersions"),
    isVersionInstalled: (version: string): Promise<boolean> => ipcRenderer.invoke("game:isVersionInstalled", version),
    uninstallVersion: (version: GameVersion): Promise<void> => ipcRenderer.invoke("game:uninstallVersion", version),

    // Game
    launchGame: (script: string): Promise<void> => ipcRenderer.invoke("game:launchGame", script),

    // Events
    onGameLaunched: (listener: () => void) => ipcRenderer.on("game:launched", listener),
    onGameClosed: (listener: () => void) => ipcRenderer.on("game:closed", listener),
};
export type GameApi = typeof gameApi;
contextBridge.exposeInMainWorld("game", gameApi);

const mapsApi = {
    downloadMap: (version: string): Promise<void> => ipcRenderer.invoke("maps:downloadMap", version),
    downloadMaps: (scriptNames: string[]): Promise<void> => ipcRenderer.invoke("maps:downloadMaps", scriptNames),
    getInstalledVersions: (): Promise<MapData[]> => ipcRenderer.invoke("maps:getInstalledVersions"),
    getMapByScriptName: (scriptName: string): Promise<MapData> => ipcRenderer.invoke("maps:getMapByScriptName", scriptName),
    getMapImages: (mapData: MapData | undefined): Promise<MapImages> => ipcRenderer.invoke("maps:getMapImages", mapData),
    isVersionInstalled: (id: string): Promise<boolean> => ipcRenderer.invoke("maps:isVersionInstalled", id),
};
export type MapsApi = typeof mapsApi;
contextBridge.exposeInMainWorld("maps", mapsApi);
