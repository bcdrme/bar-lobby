
import { contextBridge, ipcRenderer } from "electron";

import { Replay } from "@main/cache/model/replay";
import { Settings } from "@main/services/settings.service";
import { Info } from "@main/utils/info";
import { Account } from "@main/services/account.service";
import { ReplayQueryOptions } from "@main/services/replays.service";
import { EngineVersion } from "@main/cache/model/engine-version";
import { GameVersion } from "@main/cache/model/game-version";
import { MapData } from "@main/cache/model/map-data";

console.log("preload.ts loaded");

const infoApi = {
    getInfo: (): Promise<Info> => ipcRenderer.invoke("info:get"),
}
export type InfoApi = typeof infoApi;
contextBridge.exposeInMainWorld("info", infoApi);

const mainWindowApi = {
    toggleFullscreen: (): Promise<void> => ipcRenderer.invoke("mainWindow:toggleFullscreen"),
    flashFrame: (flag: boolean): Promise<void> => ipcRenderer.invoke("mainWindow:flashFrame", flag),
}
export type MainWindowApi = typeof mainWindowApi;
contextBridge.exposeInMainWorld("mainWindow", mainWindowApi);

const shellApi = {
    openConfigDir: (): Promise<void> => ipcRenderer.invoke("shell:openConfigDir"),
    openContentDir: (): Promise<void> => ipcRenderer.invoke("shell:openContentDir"),
    openSettingsFile: (): Promise<void> => ipcRenderer.invoke("shell:openSettingsFile"),
}
export type ShellApi = typeof shellApi;
contextBridge.exposeInMainWorld("shell", shellApi);

const replaysApi = {
    getReplays: (args: ReplayQueryOptions): Promise<Replay[]> => ipcRenderer.invoke("replays:getReplays", args),
    refreshCache: (): Promise<void> => ipcRenderer.invoke("replays:refreshCache"),
    getTotalReplayCount: (): Promise<number> => ipcRenderer.invoke("replays:getTotalReplayCount"),
    deleteReplay: (replayId: number): Promise<void> => ipcRenderer.invoke("replays:delete", replayId),
    getReplayById: (replayId: number): Promise<number> => ipcRenderer.invoke("replays:getReplayById", replayId),
    getReplayByGameId: (gameId: string): Promise<string> => ipcRenderer.invoke("replays:getReplayByGameId", gameId),
}
export type ReplaysApi = typeof replaysApi;
contextBridge.exposeInMainWorld("replays", replaysApi);

const settingsApi = {
    getSettings: (): Promise<Settings> => ipcRenderer.invoke("settings:get"),
    updateSettings: (settings: Partial<Settings>): Promise<void> => ipcRenderer.invoke("settings:update", settings),
    toggleFullscreen: (): Promise<void> => ipcRenderer.invoke("settings:toggleFullscreen"),
}
export type SettingsApi = typeof settingsApi;
contextBridge.exposeInMainWorld("settings", settingsApi);

const accountApi = {
    getAccount: (): Promise<Account> => ipcRenderer.invoke("account:get"),
    updateAccount: (data: Partial<Account>): Promise<void> => ipcRenderer.invoke("account:update", data),
}
export type AccountApi = typeof accountApi;
contextBridge.exposeInMainWorld("account", accountApi);

const engineApi = {
    getInstalledVersions: (): Promise<EngineVersion[]> => ipcRenderer.invoke("engine:getInstalledVersions"),
}
export type EngineApi = typeof engineApi;
contextBridge.exposeInMainWorld("engine", engineApi);

const gameApi = {
    getInstalledVersions: (): Promise<GameVersion[]> => ipcRenderer.invoke("game:getInstalledVersions"),
}
export type GameApi = typeof gameApi;
contextBridge.exposeInMainWorld("game", gameApi);

const mapApi = {
    getInstalledVersions: (): Promise<MapData[]> => ipcRenderer.invoke("map:getInstalledVersions"),
}
export type MapApi = typeof mapApi;
contextBridge.exposeInMainWorld("map", mapApi);
