import { StartPos } from "@main/content/maps/map-model";
import { MapParser } from "@main/content/maps/spring-map-parser";
import { logger } from "@main/utils/logger";
import path from "path";
import fs from "fs";
import { MapData } from "@main/cache/model/map-data";
import { Worker } from "worker_threads";
import { MIPMAP_SIZE } from "@main/config/map-parsing";

const log = logger("parse-map.ts");

const mapParser = new MapParser({
    mipmapSize: MIPMAP_SIZE,
});

export const parseMap = async (mapPath: string, mapImagesPath: string) => {
    const map = await mapParser.parseMap(mapPath);
    const fileNameWithoutExt = path.parse(mapPath).name;

    const textureJpg = await map.textureMap!.getBuffer("image/jpeg", { quality: 80 });
    const textureMapPath = path.join(mapImagesPath, `${fileNameWithoutExt}-texture.jpg`);
    await fs.promises.writeFile(textureMapPath, textureJpg);
    log.debug(`Wrote texture jpg for ${fileNameWithoutExt} to ${mapImagesPath}`);

    const metalJpg = await map.metalMap.getBuffer("image/jpeg", { quality: 80 });
    const metalMapPath = path.join(mapImagesPath, `${fileNameWithoutExt}-metal.jpg`);
    await fs.promises.writeFile(metalMapPath, metalJpg);
    log.debug(`Wrote metal jpg for ${fileNameWithoutExt} to ${mapImagesPath}`);

    const heightJpg = await map.heightMap.getBuffer("image/jpeg", { quality: 80 });
    const heightMapPath = path.join(mapImagesPath, `${fileNameWithoutExt}-height.jpg`);
    await fs.promises.writeFile(heightMapPath, heightJpg);
    log.debug(`Wrote height jpg for ${fileNameWithoutExt} to ${mapImagesPath}`);

    const typeJpg = await map.typeMap.getBuffer("image/jpeg", { quality: 80 });
    const typeMapPath = path.join(mapImagesPath, `${fileNameWithoutExt}-type.jpg`);
    await fs.promises.writeFile(typeMapPath, typeJpg);
    log.debug(`Wrote type jpg for ${fileNameWithoutExt} to ${mapImagesPath}`);

    return {
        fileName: path.parse(mapPath).base,
        scriptName: map.scriptName.trim(),
        friendlyName: (map.mapInfo?.name || map.scriptName).trim().replace(/[_-]/g, " "),
        description: map.mapInfo?.description || map.smd?.description || null,
        mapHardness: map.mapInfo?.maphardness ?? map.smd?.mapHardness!,
        gravity: map.mapInfo?.gravity ?? map.smd?.gravity!,
        tidalStrength: map.mapInfo?.tidalStrength ?? map.smd?.tidalStrength!,
        maxMetal: map.mapInfo?.maxMetal ?? map.smd?.maxMetal!,
        extractorRadius: map.mapInfo?.extractorRadius ?? map.smd?.extractorRadius!,
        minWind: map.mapInfo?.atmosphere?.minWind ?? map.smd?.minWind!,
        maxWind: map.mapInfo?.atmosphere?.maxWind ?? map.smd?.maxWind!,
        startPositions: (map.mapInfo?.teams?.map((obj) => obj!.startPos) ?? map.smd?.startPositions) as Array<StartPos>,
        width: map.smf!.mapWidthUnits * 2,
        height: map.smf!.mapHeightUnits * 2,
        minDepth: map.minHeight,
        maxDepth: map.maxHeight,
        mapInfo: map.mapInfo || null,
        images: {
            textureMapPath,
            metalMapPath,
            heightMapPath,
            typeMapPath,
        },
    } as MapData;
};

export function asyncParseMap(mapPath: string, mapImagePath: string) {
    return new Promise<MapData>((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, "parse-map-worker.js"), {
            workerData: { mapPath, mapImagePath },
        });
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}
