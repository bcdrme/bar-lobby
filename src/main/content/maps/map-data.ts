import { StartboxDetails, StartPosition } from "@main/content/maps/online-map";

export type MapData = {
    scriptName: string;
    fileName: string;
    friendlyName: string;
    description?: string;
    author: string;
    width: number;
    height: number;
    startPositions?: StartPosition;
    startBoxes?: StartboxDetails[];
    onlineImages?: {
        textureURL: string;
    };
    images?: {
        texture?: Blob;
        height?: Blob;
        metal?: Blob;
        type?: Blob;
    };
    isInstalled?: boolean;
    isDownloading?: boolean;
};

export function mapFileNameToFriendlyName(fileName: string) {
    const friendlyName = fileName
        .replace(/\.sd7$/, "")
        .replaceAll("_", " ")
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
        .join(" ");
    return friendlyName;
}
