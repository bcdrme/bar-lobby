import * as fs from "fs";
import * as path from "path";

import { MapData } from "@main/content/maps/map-data";
import { logger } from "@main/utils/logger";
import { Signal } from "$/jaz-ts-utils/signal";
import { delay } from "$/jaz-ts-utils/delay";
import { PrDownloaderAPI } from "@main/content/pr-downloader";
import { CONTENT_PATH } from "@main/config/app";
import { asyncParseMap } from "@main/content/maps/parse-map";
import chokidar from "chokidar";

const log = logger("map-content.ts");

/**
 * @todo replace queue method with syncMapCache function once prd returns map file name
 */
export class MapContentAPI extends PrDownloaderAPI<MapData> {
    public readonly onMapCachingStarted: Signal<string> = new Signal();
    public readonly onMapCached: Signal<MapData> = new Signal();
    public readonly onMapDeleted: Signal<string> = new Signal();

    protected readonly mapsDir = path.join(CONTENT_PATH, "maps");
    protected readonly mapCacheQueue: Set<string> = new Set();
    protected cachingMaps = false;

    public override async init() {
        await fs.promises.mkdir(this.mapsDir, { recursive: true });
        this.startCacheMapConsumer();
        this.startWatchingMapFolder();
        return super.init();
    }

    protected startWatchingMapFolder() {
        //using chokidar to watch for changes in the maps folder
        chokidar
            .watch(this.mapsDir, {
                ignoreInitial: true, //ignore the initial scan
                awaitWriteFinish: true, //wait for the file to be fully written before emitting the event
            })
            .on("add", (filepath) => {
                if (!filepath.endsWith("sd7")) {
                    return;
                }
                log.debug(`Chokidar -=- Map added: ${filepath}`);
                const filename = path.basename(filepath);
                this.queueMapsToCache([filename]);
            })
            .on("unlink", (filepath) => {
                if (!filepath.endsWith("sd7")) {
                    return;
                }
                log.debug(`Chokidar -=- Map removed: ${filepath}`);
                this.onMapDeleted.dispatch(path.basename(filepath));
            });
    }

    public isVersionInstalled(id: string): boolean {
        throw new Error("Method not implemented.");
    }

    public getMapByScriptName(scriptName: string) {
        throw new Error("Method not implemented.");
    }

    public async downloadMaps(scriptNames: string[]) {
        return Promise.all(scriptNames.map((scriptName) => this.downloadMap(scriptName)));
    }

    public async downloadMap(scriptName: string) {
        if (this.currentDownloads.some((download) => download.name === scriptName)) {
            return await new Promise<void>((resolve) => {
                this.onDownloadComplete.addOnce((mapData) => {
                    if (mapData.name === scriptName) {
                        resolve();
                    }
                });
            });
        }
        const downloadInfo = await this.downloadContent("map", scriptName);
        this.onDownloadComplete.dispatch(downloadInfo);
    }

    public async attemptCacheErrorMaps() {
        throw new Error("Method not implemented.");
    }

    //Method to sync the cache with the maps folder, if the folder doesnt have the map, download it. If the folder has a map that is not in the cache, cache it.
    public async sync(maps: { scriptName: string; fileName: string }[]) {
        const existingFiles = await this.scanFolderForMaps();
        const mapsToDownload = maps.filter((map) => !existingFiles.includes(map.fileName));
        mapsToDownload.forEach((map) => this.onMapDeleted.dispatch(map.fileName));
        this.downloadMaps(mapsToDownload.map((map) => map.scriptName));
        const mapFileNames = maps.map((map) => map.fileName);
        const mapsToCache = existingFiles.filter((map) => !mapFileNames.includes(map));
        this.queueMapsToCache(mapsToCache);
    }

    public async scanFolderForMaps() {
        let mapFiles = await fs.promises.readdir(this.mapsDir);
        mapFiles = mapFiles.filter((mapFile) => mapFile.endsWith("sd7"));
        return mapFiles;
    }

    protected async queueMapsToCache(filenames?: string[]) {
        let mapFiles = filenames;
        if (!filenames) {
            mapFiles = await this.scanFolderForMaps();
        }
        for (const mapFileToCache of mapFiles) {
            this.mapCacheQueue.add(mapFileToCache);
            this.onMapCachingStarted.dispatch(mapFileToCache);
        }
    }

    public async uninstallVersion(version: MapData) {
        const mapFile = path.join(this.mapsDir, version.fileName);
        await fs.promises.rm(mapFile, { force: true, recursive: true });
        log.debug(`Map removed: ${version.scriptName}`);
    }

    protected async startCacheMapConsumer() {
        if (this.cachingMaps) {
            log.warn("Don't call cacheMaps more than once");
            return;
        }
        this.cachingMaps = true;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const [mapToCache] = this.mapCacheQueue;
            if (mapToCache) {
                await this.cacheMap(mapToCache);
            } else {
                await delay(500);
            }
        }
    }

    protected async cacheMap(mapFileName: string) {
        try {
            log.debug(`Caching: ${mapFileName}`);
            console.time(`Cached: ${mapFileName}`);
            const mapPath = path.join(this.mapsDir, mapFileName);
            log.debug(`Parsing map asynchronously: ${mapFileName}`);
            const mapData = await asyncParseMap(mapPath);
            log.debug(`Parsed map: ${mapFileName}`);
            this.onMapCached.dispatch(mapData);
            console.timeEnd(`Cached: ${mapFileName}`);
        } catch (err) {
            log.error(`Error parsing map: ${mapFileName}`, err);
            log.error(err);
            //TODO emit error signal
        }
        this.mapCacheQueue.delete(mapFileName);
    }

    protected mapCached(mapName: string) {
        return new Promise<MapData>((resolve) => {
            this.onMapCached.addOnce((map) => {
                if (map.scriptName === mapName) {
                    resolve(map);
                }
            });
        });
    }
}

export const mapContentAPI = new MapContentAPI();
