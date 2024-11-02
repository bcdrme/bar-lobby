import { MapData } from "@main/content/maps/map-data";
import { mapContentAPI } from "@main/content/maps/map-content";
import { ipcMain } from "electron";
import { OnlineMap } from "@main/content/maps/online-map";
import { fetchMapImages } from "@main/content/maps/map-image";

function init() {
    mapContentAPI.init();
}

async function fetchAllMaps() {
    const maps = await fetch("https://maps-metadata.beyondallreason.dev/latest/map_list.validated.json");
    const mapsAsObject = await maps.json();
    const mapsAsArray = Object.values(mapsAsObject) as OnlineMap[];
    return mapsAsArray.map((map: OnlineMap) => {
        // transform the map object to a MapData object
        return {
            scriptName: map.springName,
            fileName: map.springName,
            friendlyName: map.displayName,
            description: map.description,
            author: map.author,
            width: 8,
            height: 8,
            startPositions: map.startPos,
            startBoxes: Object.values(map.startboxesSet),
            onlineImages: {
                textureURL: map.photo?.at(0)?.downloadURL,
            },
            isInstalled: mapContentAPI.isVersionInstalled(map.springName),
        } as MapData;
    });
}

function registerIpcHandlers(mainWindow: Electron.BrowserWindow) {
    ipcMain.handle("maps:downloadMap", (_, scriptName: string) => mapContentAPI.downloadMap(scriptName));
    ipcMain.handle("maps:downloadMaps", (_, scriptNames: string[]) => mapContentAPI.downloadMaps(scriptNames));
    ipcMain.handle("maps:getInstalledVersions", () => mapContentAPI.installedVersions);
    ipcMain.handle("maps:isVersionInstalled", (_, id: string) => mapContentAPI.isVersionInstalled(id));
    ipcMain.handle("maps:attemptCacheErrorMaps", () => mapContentAPI.attemptCacheErrorMaps());

    ipcMain.handle("maps:online:fetchAllMaps", () => fetchAllMaps());
    ipcMain.handle("maps:online:fetchMapImages", (_, imageSource: string) => fetchMapImages(imageSource));

    // Events
    mapContentAPI.onMapAdded.add((filename: string) => {
        mainWindow.webContents.send("maps:mapAdded", filename);
    });
    mapContentAPI.onMapDeleted.add((filename: string) => {
        mainWindow.webContents.send("maps:mapDeleted", filename);
    });
}

const mapsService = {
    init,
    registerIpcHandlers,
};

export default mapsService;
