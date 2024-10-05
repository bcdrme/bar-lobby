import path from "path";
import { MapParser } from "./maps/spring-map-parser";
import { StartPos } from "./maps/map-model";

export const mipmapSize = 8;

const mapParser = new MapParser({
    mipmapSize: mipmapSize,
});

export const parseMap = async (mapPath: string, mapImagesPath: string) => {
    const map = await mapParser.parseMap(mapPath);
    const fileNameWithoutExt = path.parse(mapPath).name;

    const textureJpg = await map.textureMap!.getBuffer("image/jpeg", { quality: 80 });
    await textureJpg.write(path.join(mapImagesPath, `${fileNameWithoutExt}-texture.jpg`));

    const metalJpg = await map.metalMap.getBuffer("image/jpeg", { quality: 80 });
    await metalJpg.write(path.join(mapImagesPath, `${fileNameWithoutExt}-metal.jpg`));

    const heightJpg = await map.heightMap.getBuffer("image/jpeg", { quality: 80 });
    await heightJpg.write(path.join(mapImagesPath, `${fileNameWithoutExt}-height.jpg`));

    const typeJpg = await map.typeMap.getBuffer("image/jpeg", { quality: 80 });
    await typeJpg.write(path.join(mapImagesPath, `${fileNameWithoutExt}-type.jpg`));

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
    };
};
