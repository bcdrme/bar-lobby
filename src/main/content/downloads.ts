export type DownloadInfo = {
    type: "engine" | "game" | "map";
    name: string;
    currentBytes: number;
    totalBytes: number;
    caching: boolean;
};

export type SpringFilesMapMeta = {
    category: string;
    filename: string;
    keywords: string;
    md5: string;
    mirrors: string[];
    name: string;
    path: string;
    sdp: string;
    size: number;
    springname: string;
    tags: string[];
    timestamp: string;
    version: string;
};
