import * as fs from "fs";
import * as path from "path";

import { MapData } from "@main/cache/model/map-data";
import { cacheDb } from "@main/cache/cache-db";
import { logger } from "@main/utils/logger";
import { Signal } from "$/jaz-ts-utils/signal";
import { removeFromArray } from "$/jaz-ts-utils/object";
import { delay } from "$/jaz-ts-utils/delay";
import { PrDownloaderAPI } from "@main/content/pr-downloader";
import { MapImages } from "@main/content/maps/map-model";
import { CONTENT_PATH } from "@main/config/app";
import { asyncParseMap } from "@main/content/maps/parse-map";
import { DownloadInfo } from "@main/content/downloads";

const log = logger("map-content.ts");

/**
 * @todo replace queue method with syncMapCache function once prd returns map file name
 */
export class MapContentAPI extends PrDownloaderAPI<MapData> {
    public readonly onMapCached: Signal<MapData> = new Signal();

    protected readonly mapsDir = path.join(CONTENT_PATH, "maps");
    protected readonly mapImagesDir = path.join(CONTENT_PATH, "map-images");
    protected readonly mapCacheQueue: Set<string> = new Set();
    protected cachingMaps = false;

    public override async init() {
        await fs.promises.mkdir(this.mapsDir, { recursive: true });
        await fs.promises.mkdir(this.mapImagesDir, { recursive: true });
        const maps = await cacheDb.selectFrom("map").selectAll().execute();
        this.installedVersions.push(...maps);
        await this.queueMapsToCache();
        this.cacheMaps();
        return super.init();
    }

    public isVersionInstalled(id: string): boolean {
        return this.installedVersions.some((map) => map.scriptName === id);
    }

    public getMapByScriptName(scriptName: string) {
        return this.installedVersions.find((map) => map.scriptName === scriptName);
    }

    public async downloadMaps(scriptNames: string[]) {
        return Promise.all(scriptNames.map((scriptName) => this.downloadMap(scriptName)));
    }

    public async downloadMap(scriptName: string) {
        if (this.installedVersions.some((map) => map.scriptName === scriptName)) {
            console.warn(`Map ${scriptName} already installed`);
            return;
        }
        if (this.currentDownloads.some((download) => download.name === scriptName)) {
            await new Promise<void>((resolve) => {
                this.onDownloadComplete.addOnce((mapData) => {
                    if (mapData.name === scriptName) {
                        resolve();
                    }
                });
            });
        } else {
            const downloadInfo = await this.downloadContent("map", scriptName);
            downloadInfo.caching = true;
            this.onDownloadProgress.dispatch(downloadInfo);
        }
        await this.queueMapsToCache();
    }

    public getMapImages(mapData: MapData | undefined) {
        if (!mapData) {
            return {
                textureImagePath: "/src/renderer/assets/images/default-minimap.png",
                heightImagePath: "/src/renderer/assets/images/default-minimap.png",
                metalImagePath: "/src/renderer/assets/images/default-minimap.png",
                typeImagePath: "/src/renderer/assets/images/default-minimap.png",
            };
        }
        const fileNameWithoutExt = path.parse(mapData.fileName).name;
        return {
            textureImagePath: path.join(this.mapImagesDir, `${fileNameWithoutExt}-texture.jpg`),
            heightImagePath: path.join(this.mapImagesDir, `${fileNameWithoutExt}-height.jpg`),
            metalImagePath: path.join(this.mapImagesDir, `${fileNameWithoutExt}-metal.jpg`),
            typeImagePath: path.join(this.mapImagesDir, `${fileNameWithoutExt}-type.jpg`),
        } as MapImages;
    }

    public async attemptCacheErrorMaps() {
        await cacheDb.deleteFrom("mapError").execute();
        await this.queueMapsToCache();
    }

    protected async queueMapsToCache() {
        let mapFiles = await fs.promises.readdir(this.mapsDir);
        mapFiles = mapFiles.filter((mapFile) => mapFile.endsWith("sd7"));
        const cachedMapFiles = await cacheDb.selectFrom("map").select(["fileName"]).execute();
        const cachedMapFileNames = cachedMapFiles.map((file) => file.fileName);
        const erroredMapFiles = await cacheDb.selectFrom("mapError").select(["fileName"]).execute();
        const erroredMapFileNames = erroredMapFiles.map((file) => file.fileName);
        const mapFilesToCache = mapFiles.filter((file) => !cachedMapFileNames.includes(file) && !erroredMapFileNames.includes(file));
        const mapFilesToUncache = cachedMapFileNames.filter((fileName) => !mapFiles.includes(fileName));
        for (const mapFileToCache of mapFilesToCache) {
            this.mapCacheQueue.add(mapFileToCache);
        }
        for (const mapFileToUncache of mapFilesToUncache) {
            await this.uncacheMap(mapFileToUncache);
        }
    }

    public async uninstallVersion(version: MapData) {
        const mapFile = path.join(this.mapsDir, version.fileName);
        await fs.promises.rm(mapFile, { force: true, recursive: true });
        await this.uncacheMap(version.fileName);
        removeFromArray(this.installedVersions, version);
        log.debug(`Map removed: ${version.scriptName}`);
    }

    protected async uncacheMap(fileName: string) {
        const fileNameWithoutExt = path.parse(fileName).name;
        await fs.promises.rm(path.join(this.mapImagesDir, `${fileNameWithoutExt}-texture.jpg`), { force: true });
        await fs.promises.rm(path.join(this.mapImagesDir, `${fileNameWithoutExt}-height.jpg`), { force: true });
        await fs.promises.rm(path.join(this.mapImagesDir, `${fileNameWithoutExt}-metal.jpg`), { force: true });
        await fs.promises.rm(path.join(this.mapImagesDir, `${fileNameWithoutExt}-type.jpg`), { force: true });
        await cacheDb.deleteFrom("map").where("fileName", "=", fileName).execute();
        const index = this.installedVersions.findIndex((map) => map.fileName === fileName);
        if (index) {
            this.installedVersions.splice(index, 1);
        }
    }

    protected async cacheMaps() {
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
            const fileName = path.parse(mapFileName).name;
            const existingCachedMap = await cacheDb.selectFrom("map").select("mapId").where("fileName", "=", fileName).executeTakeFirst();
            if (existingCachedMap || this.installedVersions.some((map) => map.fileName === mapFileName)) {
                log.debug(`${fileName} already cached`);
                this.mapCacheQueue.delete(mapFileName);
                return;
            }
            log.debug(`Caching: ${mapFileName}`);
            console.time(`Cached: ${mapFileName}`);
            const mapPath = path.join(this.mapsDir, mapFileName);

            log.debug(`Trying to parse map asynchronously: ${mapFileName}`);
            const parsedMap = await asyncParseMap(mapPath, this.mapImagesDir);
            log.debug(`Parsed map: ${mapFileName}`);
            const mapData = await cacheDb
                .insertInto("map")
                .values({
                    ...parsedMap,
                    lastLaunched: new Date(),
                })
                .onConflict((oc) => {
                    const { scriptName, fileName, ...nonUniqueValues } = parsedMap;
                    return oc.doUpdateSet(nonUniqueValues);
                })
                .returningAll()
                .executeTakeFirst();
            this.installedVersions.push(mapData);
            const cachedMapDownloadInfo = this.currentDownloads.find((download) => download.name === mapData.scriptName);
            this.onDownloadComplete.dispatch(cachedMapDownloadInfo);
            this.onMapCached.dispatch(mapData);
            console.timeEnd(`Cached: ${mapFileName}`);
        } catch (err) {
            log.error(`Error parsing map: ${mapFileName}`, err);
            log.error(err);
            await cacheDb
                .insertInto("mapError")
                .onConflict((oc) => oc.doNothing())
                .values({ fileName: mapFileName })
                .execute();
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

    // currently unused, waiting for prd to return map file name so we know which file to cache
    /** Remove maps from cache that aren't in the filesystem and add maps to cache that are */
    protected async syncMapCache() {
        let mapFiles = await fs.promises.readdir(this.mapsDir);
        mapFiles = mapFiles.filter((mapFile) => mapFile.endsWith("sd7"));
        const cachedMapFiles = await cacheDb.selectFrom("map").select(["fileName"]).execute();
        const cachedMapFileNames = cachedMapFiles.map((file) => file.fileName);
        const erroredMapFiles = await cacheDb.selectFrom("mapError").select(["fileName"]).execute();
        const erroredMapFileNames = erroredMapFiles.map((file) => file.fileName);
        const mapFilesToCache = mapFiles.filter((file) => !cachedMapFileNames.includes(file) && !erroredMapFileNames.includes(file));
        const mapFilesToUncache = cachedMapFileNames.filter((fileName) => !mapFiles.includes(fileName));
        for (const mapFileToUncache of mapFilesToUncache) {
            await this.uncacheMap(mapFileToUncache);
        }
        for (const mapFileToCache of mapFilesToCache) {
            await this.cacheMap(mapFileToCache);
        }
    }
}

export const mapContentAPI = new MapContentAPI();
