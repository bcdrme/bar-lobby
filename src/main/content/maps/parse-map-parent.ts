import { MapData } from "@main/cache/model/map-data";
import path from "path";
import { Worker } from "worker_threads";

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
