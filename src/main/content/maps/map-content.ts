import * as fs from "fs";
import * as path from "path";

import { MapData } from "@main/content/maps/map-data";
import { logger } from "@main/utils/logger";
import { Signal } from "$/jaz-ts-utils/signal";
import { PrDownloaderAPI } from "@main/content/pr-downloader";
import { CONTENT_PATH } from "@main/config/app";
import chokidar from "chokidar";
import { UltraSimpleMapParser } from "$/map-parser/ultrasimple-map-parser";

const log = logger("map-content.ts");

/**
 * @todo replace queue method with syncMapCache function once prd returns map file name
 */
export class MapContentAPI extends PrDownloaderAPI<MapData> {
    public mapNameFileNameLookup: { [scriptName: string]: string } = {};
    public fileNameMapNameLookup: { [fileName: string]: string } = {};

    public readonly onMapAdded: Signal<string> = new Signal();
    public readonly onMapDeleted: Signal<string> = new Signal();

    protected readonly mapsDir = path.join(CONTENT_PATH, "maps");
    protected readonly mapCacheQueue: Set<string> = new Set();
    protected cachingMaps = false;

    public override async init() {
        await fs.promises.mkdir(this.mapsDir, { recursive: true });
        this.initLookupMaps();
        this.startWatchingMapFolder();
        return super.init();
    }

    protected async initLookupMaps() {
        const filePaths = await fs.promises.readdir(this.mapsDir);
        const sd7filePaths = filePaths.filter((path) => path.endsWith(".sd7"));
        log.debug(`Found ${sd7filePaths.length} maps`);
        for (const filePath of sd7filePaths) {
            const mapName = await this.getMapNameFromFile(filePath);
            const fileName = path.basename(filePath);
            this.mapNameFileNameLookup[mapName] = fileName;
            this.fileNameMapNameLookup[fileName] = mapName;
        }
        log.info(`Found ${Object.keys(this.mapNameFileNameLookup).length} maps`);
    }

    protected async getMapNameFromFile(file: string) {
        const ultraSimpleMapParser = new UltraSimpleMapParser();
        const parsedMap = await ultraSimpleMapParser.parseMap(path.join(this.mapsDir, file));
        return parsedMap.scriptName;
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
                // Update the lookup maps
                this.getMapNameFromFile(filename).then((mapName) => {
                    this.mapNameFileNameLookup[mapName] = filename;
                    this.fileNameMapNameLookup[filename] = mapName;
                });
                this.onMapAdded.dispatch(filename);
            })
            .on("unlink", (filepath) => {
                if (!filepath.endsWith("sd7")) {
                    return;
                }
                log.debug(`Chokidar -=- Map removed: ${filepath}`);
                this.mapNameFileNameLookup[this.fileNameMapNameLookup[path.basename(filepath)]] = undefined;
                this.fileNameMapNameLookup[path.basename(filepath)] = undefined;
                this.onMapDeleted.dispatch(path.basename(filepath));
            });
    }

    public isVersionInstalled(scriptName: string): boolean {
        return this.mapNameFileNameLookup[scriptName] !== undefined;
    }

    public async downloadMaps(scriptNames: string[]) {
        return Promise.all(scriptNames.map((scriptName) => this.downloadMap(scriptName)));
    }

    public async downloadMap(scriptName: string) {
        if (this.isVersionInstalled(scriptName)) return;
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

    public async scanFolderForMaps() {
        let mapFiles = await fs.promises.readdir(this.mapsDir);
        mapFiles = mapFiles.filter((mapFile) => mapFile.endsWith("sd7"));
        return mapFiles;
    }

    public async uninstallVersion(version: MapData) {
        const mapFile = path.join(this.mapsDir, version.fileName);
        await fs.promises.rm(mapFile, { force: true, recursive: true });
        log.debug(`Map removed: ${version.scriptName}`);
    }
}

export const mapContentAPI = new MapContentAPI();
