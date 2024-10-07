import { DownloadInfo } from "@main/content/downloads";
import { reactive } from "vue";

export const downloadsStore = reactive({
    isInitialized: false,
    downloads: [],
} as {
    isInitialized: boolean;
    downloads: DownloadInfo[];
});

export function initDownloadsStore() {
    window.downloads.onDownloadMapStart((downloadInfo) => {
        console.debug("Download started", downloadInfo);
        downloadsStore.downloads.push(downloadInfo);
    });

    window.downloads.onDownloadMapComplete((downloadInfo) => {
        console.debug("Download complete", downloadInfo);
        downloadsStore.downloads = downloadsStore.downloads.filter((download) => download.name !== downloadInfo.name);
    });

    window.downloads.onDownloadMapProgress((downloadInfo) => {
        console.debug("Download progress", downloadInfo);
        const index = downloadsStore.downloads.findIndex((download) => download.name === downloadInfo.name);
        if (index !== -1) {
            downloadsStore.downloads[index] = downloadInfo;
        }
    });

    // TODO handle download failure correctly in the UI
    window.downloads.onDownloadMapFail((downloadInfo) => {
        console.debug("Download failed", downloadInfo);
        downloadsStore.downloads = downloadsStore.downloads.filter((download) => download.name !== downloadInfo.name);
    });

    downloadsStore.isInitialized = true;
}
