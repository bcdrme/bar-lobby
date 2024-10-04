import { unpack } from "7zip-min";

export function extract7z(archivePath: string, outputPath: string) {
    return new Promise<void>((resolve, reject) => {
        unpack(archivePath, outputPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
