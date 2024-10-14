import axios from "axios";
import * as fs from "fs";
import * as glob from "glob-promise";
import { removeFromArray } from "$/jaz-ts-utils/object";
import * as path from "path";
import util from "util";
import zlib from "zlib";
import { GameAI, GameVersion } from "@main/content/game/game-version";
import { parseLuaTable } from "@main/utils/parse-lua-table";
import { parseLuaOptions } from "@main/utils/parse-lua-options";
import { BufferStream } from "@main/utils/buffer-stream";
import { logger } from "@main/utils/logger";
import assert from "assert";
import { contentSources } from "@main/config/content-sources";
import { defaultGameVersion } from "@main/config/default-versions";
import { DownloadInfo } from "@main/content/downloads";
import { LuaOptionSection } from "@main/content/game/lua-options";
import { Scenario } from "@main/content/game/scenario";
import { SdpFileMeta, SdpFile } from "@main/content/game/sdp";
import { PrDownloaderAPI } from "@main/content/pr-downloader";
import { CONTENT_PATH, GAME_VERSIONS_GZ_PATH } from "@main/config/app";

const log = logger("game-content.ts");
const gunzip = util.promisify(zlib.gunzip);

export class GameContentAPI extends PrDownloaderAPI<GameVersion> {
    public packageGameVersionLookupMap: { [md5: string]: string } = {};
    public gameVersionPackageLookupMap: { [gameVersion: string]: string } = {};

    public override async init() {
        await this.initLookupMaps();
        const packagesDir = path.join(CONTENT_PATH, "packages");
        if (fs.existsSync(packagesDir)) {
            const packages = await fs.promises.readdir(packagesDir);
            log.info(`Found ${packages.length} packages`);
            for (const packageFile of packages) {
                const packageMd5 = packageFile.replace(".sdp", "");
                const gameVersion = this.packageGameVersionLookupMap[packageMd5];
                if (gameVersion) {
                    this.installedVersions.push({ gameVersion, packageMd5 });
                }
            }
        }
        this.sortVersions();
        log.info(`Found ${this.installedVersions.length} installed game versions`);
        this.installedVersions.forEach((version) => {
            log.info(`-- ${version.gameVersion}`);
        });

        // TODO handle custom game files .sdd, maybe in another service
        // const gamesDir = path.join(CONTENT_PATH, "games");
        // if (fs.existsSync(gamesDir)) {
        //     const dirs = await fs.promises.readdir(gamesDir);
        //     log.info(`Found ${dirs.length} game versions`);
        //     for (const dir of dirs) {
        //         log.info(`-- Version ${dir}`);
        //         try {
        //             const modInfoLua = await fs.promises.readFile(path.join(gamesDir, dir, "modinfo.lua"));
        //             const modInfo = parseLuaTable(modInfoLua);
        //             const aiInfoLua = await fs.promises.readFile(path.join(gamesDir, dir, "luaai.lua"));
        //             const ais = await this.parseAis(aiInfoLua);
        //             this.installedVersions.push({
        //                 id: `${modInfo.game} ${modInfo.version}`,
        //                 dir,
        //                 ais,
        //             });
        //         } catch (err) {
        //             console.error(err);
        //         }
        //     }
        // }

        return this;
    }

    protected async initLookupMaps() {
        const versionsGz = await fs.promises.readFile(GAME_VERSIONS_GZ_PATH);
        const versionsStr = zlib.gunzipSync(versionsGz).toString().trim();
        const versionsParts = versionsStr.split("\n");
        for (const versionLine of versionsParts) {
            const [, packageMd5, , version] = versionLine.split(",");
            this.packageGameVersionLookupMap[packageMd5] = version;
            this.gameVersionPackageLookupMap[version] = packageMd5;
        }
    }

    public override isVersionInstalled(version: string) {
        return this.installedVersions.some((installedVersion) => installedVersion.gameVersion === version);
    }

    /**
     * Downloads the actual game files, will update to latest if no specific gameVersion is specified
     * @param gameVersion e.g. "Beyond All Reason test-16289-b154c3d"
     */
    public async downloadGame(gameVersion = `${contentSources.rapid.game}:test`) {
        // skip download if already installed
        if (this.isVersionInstalled(gameVersion)) {
            return;
        }
        log.info(`Downloading game version: ${gameVersion}`);
        return this.downloadContent("game", gameVersion).then((downloadInfo) => {
            if (downloadInfo) {
                this.downloadComplete(downloadInfo);
                removeFromArray(this.currentDownloads, downloadInfo);
                log.debug(`Downloaded ${downloadInfo.name}`);
            }
        });
    }

    public async getGameOptions(version: string): Promise<LuaOptionSection[]> {
        const gameVersion = this.installedVersions.find((installedVersion) => installedVersion.gameVersion === version);
        // TODO: cache per session
        const gameFiles = await this.getGameFiles(gameVersion.packageMd5, "modoptions.lua", true);
        const gameOptionsLua = gameFiles[0].data;
        // TODO maybe send ais as well
        return parseLuaOptions(gameOptionsLua);
    }

    public async getScenarios(): Promise<Scenario[]> {
        const { gameVersion, packageMd5 } = this.installedVersions.find((installedVersion) => installedVersion.gameVersion === defaultGameVersion);
        assert(gameVersion, "No default game version found");
        const scenarioImages = await this.getGameFiles(packageMd5, "singleplayer/scenarios/**/*.{jpg,png}", false);
        const scenarioDefinitions = await this.getGameFiles(packageMd5, "singleplayer/scenarios/**/*.lua", true);
        const cacheDir = path.join(CONTENT_PATH, "scenario-images");
        await fs.promises.mkdir(cacheDir, { recursive: true });
        for (const scenarioImage of scenarioImages) {
            const data = await fs.promises.readFile(scenarioImage.archivePath);
            const buffer = await gunzip(data);
            const fileName = path.parse(scenarioImage.fileName).base;
            await fs.promises.writeFile(path.join(cacheDir, fileName), buffer);
        }
        const scenarios: Scenario[] = [];
        for (const scenarioDefinition of scenarioDefinitions) {
            try {
                const scenario = parseLuaTable(scenarioDefinition.data) as Scenario;
                scenario.imagepath = path.join(cacheDir, scenario.imagepath).replaceAll("\\", "/");
                scenario.summary = scenario.summary.replace(/\[|\]/g, "");
                scenario.briefing = scenario.briefing.replace(/\[|\]/g, "");
                scenario.allowedsides = Array.isArray(scenario.allowedsides) && scenario.allowedsides[0] !== "" ? scenario.allowedsides : ["Armada", "Cortext", "Random"];
                scenario.startscript = scenario.startscript.slice(1, -1);
                scenarios.push(scenario);
            } catch (err) {
                console.error(`error parsing scenario lua file: ${scenarioDefinition.fileName}`, err);
            }
        }
        scenarios.sort((a, b) => a.index - b.index);
        return scenarios;
    }

    public async uninstallVersion(version: GameVersion) {
        // TODO: Uninstall game version through prd when prd supports it
        removeFromArray(this.installedVersions, version);
    }

    /**
     * @param filePatterns glob pattern for which files to retrieve
     * @example getGameFiles("Beyond All Reason test-16289-b154c3d", ["units/CorAircraft/T2/*.lua"])
     * @todo make this work for custom .sdd versions
     */
    protected async getGameFiles(packageMd5: string, filePattern: string, parseData?: false): Promise<SdpFileMeta[]>;
    protected async getGameFiles(packageMd5: string, filePattern: string, parseData?: true): Promise<SdpFile[]>;
    protected async getGameFiles(packageMd5: string, filePattern: string, parseData = false): Promise<SdpFileMeta[] | SdpFile[]> {
        // TODO this is for custom games
        // if ("dir" in version) {
        //     const sdpFiles: Array<SdpFileMeta & { data?: Buffer }> = [];
        //     const customGameDir = path.join(CONTENT_PATH, "games", version.dir);
        //     const files = await glob.promise(path.join(customGameDir, filePattern), { windowsPathsNoEscape: true });
        //     for (const file of files) {
        //         const sdpData = {
        //             archivePath: file,
        //             fileName: path.parse(file).base,
        //             crc32: "",
        //             md5: "",
        //             filesizeBytes: 0,
        //         };
        //         if (parseData) {
        //             const data = await fs.promises.readFile(file);
        //             sdpFiles.push({ ...sdpData, data });
        //         } else {
        //             sdpFiles.push(sdpData);
        //         }
        //     }
        //     return sdpFiles;
        // }
        const sdpFileName = `${packageMd5}.sdp`;
        const filePath = path.join(CONTENT_PATH, "packages", sdpFileName);
        const sdpEntries = await this.parseSdpFile(filePath, filePattern);
        const sdpFiles: Array<SdpFileMeta & { data?: Buffer }> = [];
        for (const sdpEntry of sdpEntries) {
            const poolDir = sdpEntry.md5.slice(0, 2);
            const archiveFileName = `${sdpEntry.md5.slice(2)}.gz`;
            const archiveFilePath = path.join(CONTENT_PATH, "pool", poolDir, archiveFileName);
            const archiveFile = await fs.promises.readFile(archiveFilePath);
            if (parseData) {
                const data = await gunzip(archiveFile);
                sdpFiles.push({ ...sdpEntry, data });
            } else {
                sdpFiles.push(sdpEntry);
            }
        }
        return sdpFiles;
    }

    protected async parseSdpFile(sdpFilePath: string, filePattern?: string): Promise<SdpFileMeta[]> {
        const sdpFileZipped = await fs.promises.readFile(sdpFilePath);
        const sdpFile = zlib.gunzipSync(sdpFileZipped);
        const bufferStream = new BufferStream(sdpFile, true);
        const fileData: SdpFileMeta[] = [];
        let globPattern: InstanceType<typeof glob.Glob> | undefined;
        if (filePattern) {
            globPattern = new glob.Glob(filePattern, {});
        }
        while (bufferStream.readStream.readableLength > 0) {
            const fileNameLength = bufferStream.readInt(1);
            const fileName = bufferStream.readString(fileNameLength);
            const md5 = bufferStream.read(16).toString("hex");
            const crc32 = bufferStream.read(4).toString("hex");
            const filesizeBytes = bufferStream.readInt(4, true);
            const archivePath = path.join(CONTENT_PATH, "pool", md5.slice(0, 2), `${md5.slice(2)}.gz`);
            if (globPattern && globPattern.minimatch.match(fileName)) {
                fileData.push({ fileName, md5, crc32, filesizeBytes, archivePath });
            } else if (!globPattern) {
                fileData.push({ fileName, md5, crc32, filesizeBytes, archivePath });
            }
        }
        return fileData;
    }

    protected sortVersions() {
        this.installedVersions.sort((a, b) => {
            try {
                const aRev = parseInt(a.gameVersion.split("-")[1]);
                const bRev = parseInt(b.gameVersion.split("-")[1]);
                return aRev - bRev;
            } catch (err) {
                return 1;
            }
        });
    }

    protected override async downloadComplete(downloadInfo: DownloadInfo) {
        await this.addGame(downloadInfo.name);
        super.downloadComplete(downloadInfo);
    }

    protected async addGame(gameVersion: string, sort = true) {
        if (this.isVersionInstalled(gameVersion) || gameVersion === "byar:test") {
            return;
        }
        const packageMd5 = this.gameVersionPackageLookupMap[gameVersion];
        //TODO reimplement ais lookup now that its no longer in the GameVersion object
        // const luaAiFile = (await this.getGameFiles({ md5: packageMd5 }, "luaai.lua", true))[0];
        // const ais = await this.parseAis(luaAiFile.data);
        this.installedVersions.push({ gameVersion: gameVersion, packageMd5: packageMd5 });
        if (sort) {
            this.sortVersions();
        }
    }

    protected async parseAis(aiInfo: Buffer): Promise<GameAI[]> {
        const ais: GameAI[] = [];
        const aiDefinitions = parseLuaTable(aiInfo);
        for (const def of aiDefinitions) {
            ais.push({
                name: def.name,
                description: def.desc,
            });
        }
        return ais;
    }

    // protected async cleanupOldVersions() {
    //     const maxDays = 90;
    //     const oldestDate = new Date();
    //     oldestDate.setDate(oldestDate.getDate() - maxDays);
    //     const versionsToRemove = await cacheDb.selectFrom("gameVersion").where("lastLaunched", "<", oldestDate).select("id").execute();
    //     for (const version of versionsToRemove) {
    //         // TODO: needs https://github.com/beyond-all-reason/pr-downloader/issues/21
    //         // await this.uninstallVersion(version.id);
    //     }
    // }
}

export const gameContentAPI = new GameContentAPI();
