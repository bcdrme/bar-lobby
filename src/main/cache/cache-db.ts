import Database from "better-sqlite3";
import { Kysely, Migration, Migrator, SqliteDialect } from "kysely";
import path from "path";

import { MapDataTable } from "./model/map-data";
import { ReplayTable } from "./model/replay";
import { GameVersionTable } from "./model/game-version";
import { EngineVersionTable } from "./model/engine-version";
import { logger } from "@main/utils/logger";
import { SerializePlugin } from "kysely-plugin-serialize";
import fs from "fs";
import { CONTENT_PATH } from "@main/config/app";

const log = logger("cache-db.ts");

interface CacheDatabase {
    map: MapDataTable;
    mapError: { fileName: string };
    replay: ReplayTable;
    replayError: { fileName: string };
    gameVersion: GameVersionTable;
    engineVersion: EngineVersionTable;
}

const dbPath = path.join(CONTENT_PATH, "cache.db");
fs.mkdir(path.dirname(dbPath), { recursive: true }, (err) => {
    if (err) {
        log.error(err);
    }
});

const dialect = new SqliteDialect({
    database: new Database(dbPath, { verbose: (message) => log.debug(message) }),
});

const db = new Kysely<CacheDatabase>({
    dialect,
    plugins: [new SerializePlugin()],
});

const migrator = new Migrator({
    db,
    provider: {
        getMigrations: async () => {
            return migrations();
        },
    },
});

async function migrateToLatest() {
    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
        if (it.status === "Success") {
            log.info(`migration "${it.migrationName}" was executed successfully`);
        } else if (it.status === "Error") {
            log.error(`failed to execute migration "${it.migrationName}"`);
        }
    });

    if (error) {
        log.error("failed to run `migrateToLatest`");
        log.error(error);
    }
}

// TODO is this necessary?
function migrations(): Record<string, Migration> {
    log.info("Running migrations");
    return {
        // yyyy-mm-dd
        "2023-04-10": {
            async up(db) {
                await db.schema
                    .alterTable("map")
                    .addColumn("lastLaunched", "datetime", (col) => col.notNull())
                    .execute();
            },
        },
        "2023-04-15": {
            async up(db) {
                await db.schema.dropTable("game_versions").ifExists().execute();
                await db.deleteFrom("engineVersion").execute();
                await db.deleteFrom("gameVersion").execute();

                await db.schema
                    .alterTable("engineVersion")
                    .addColumn("ais", "json", (col) => col.notNull())
                    .execute();
                await db.schema
                    .alterTable("gameVersion")
                    .addColumn("ais", "json", (col) => col.notNull())
                    .execute();
            },
        },
        "2023-06-20": {
            async up(db) {
                await db.schema
                    .alterTable("replay")
                    .addColumn("filePath", "varchar", (col) => col.notNull())
                    .execute();
            },
        },
    };
}

async function init() {
    log.info(`Initializing cache database at ${dbPath}`);

    await db.schema
        .createTable("map")
        .ifNotExists()
        .addColumn("mapId", "integer", (col) => col.primaryKey().autoIncrement())
        .addColumn("scriptName", "varchar", (col) => col.notNull().unique())
        .addColumn("fileName", "varchar", (col) => col.notNull().unique())
        .addColumn("friendlyName", "varchar", (col) => col.notNull())
        .addColumn("description", "varchar")
        .addColumn("mapHardness", "double precision", (col) => col.notNull())
        .addColumn("gravity", "double precision", (col) => col.notNull())
        .addColumn("tidalStrength", "double precision", (col) => col.notNull())
        .addColumn("maxMetal", "double precision", (col) => col.notNull())
        .addColumn("extractorRadius", "double precision", (col) => col.notNull())
        .addColumn("minWind", "double precision", (col) => col.notNull())
        .addColumn("maxWind", "double precision", (col) => col.notNull())
        .addColumn("startPositions", "json")
        .addColumn("width", "double precision", (col) => col.notNull())
        .addColumn("height", "double precision", (col) => col.notNull())
        .addColumn("minDepth", "double precision", (col) => col.notNull())
        .addColumn("maxDepth", "double precision", (col) => col.notNull())
        .addColumn("mapInfo", "json")
        .addColumn("images", "json")
        .execute();

    await db.schema
        .createTable("mapError")
        .ifNotExists()
        .addColumn("fileName", "varchar", (col) => col.primaryKey())
        .execute();

    await db.schema
        .createTable("gameVersion")
        .ifNotExists()
        .addColumn("id", "varchar", (col) => col.primaryKey())
        .addColumn("md5", "varchar")
        .addColumn("lastLaunched", "datetime", (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("engineVersion")
        .ifNotExists()
        .addColumn("id", "varchar", (col) => col.primaryKey())
        .addColumn("lastLaunched", "datetime", (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("replay")
        .ifNotExists()
        .addColumn("replayId", "integer", (col) => col.primaryKey().autoIncrement())
        .addColumn("gameId", "varchar", (col) => col.notNull().unique())
        .addColumn("fileName", "varchar", (col) => col.notNull().unique())
        .addColumn("engineVersion", "varchar", (col) => col.notNull())
        .addColumn("gameVersion", "varchar", (col) => col.notNull())
        .addColumn("mapScriptName", "varchar", (col) => col.notNull())
        .addColumn("startTime", "datetime", (col) => col.notNull())
        .addColumn("gameDurationMs", "integer", (col) => col.notNull())
        .addColumn("gameEndedNormally", "boolean", (col) => col.notNull())
        .addColumn("chatlog", "json", (col) => col)
        .addColumn("hasBots", "boolean", (col) => col.notNull())
        .addColumn("preset", "varchar", (col) => col.notNull())
        .addColumn("winningTeamId", "integer", (col) => col)
        .addColumn("teams", "json", (col) => col.notNull())
        .addColumn("contenders", "json", (col) => col.notNull())
        .addColumn("spectators", "json", (col) => col.notNull())
        .addColumn("script", "text", (col) => col.notNull())
        .addColumn("battleSettings", "json", (col) => col.notNull())
        .addColumn("gameSettings", "json", (col) => col.notNull())
        .addColumn("mapSettings", "json", (col) => col.notNull())
        .addColumn("hostSettings", "json", (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("replayError")
        .ifNotExists()
        .addColumn("fileName", "varchar", (col) => col.primaryKey())
        .execute();

    // await this.serializePlugin.setSchema(this); //might be needed already for migration
    await migrateToLatest();
    // await this.serializePlugin.setSchema(this); //again in case migration changed the database
}

export { db as cacheDb, init as initCacheDb };
