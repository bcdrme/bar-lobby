import { getInfo } from "@main/utils/info"
import { ipcMain } from "electron";

function registerIpcHandlers() {
    ipcMain.handle('info:get', getInfo);
}

export const infoService = {
    registerIpcHandlers
};