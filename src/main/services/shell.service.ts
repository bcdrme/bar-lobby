import { CONFIG_PATH, CONTENT_PATH } from "@main/config/app";

import { ipcMain, shell } from "electron";
import path from "path";

function openConfigDir() {
    shell.openPath(CONFIG_PATH);
}

function openContentDir() {
    shell.openPath(CONTENT_PATH);
}

function openSettingsFile() {
    shell.openPath(path.join(CONFIG_PATH, "settings.json"));
}

function registerIpcHandlers() {
    ipcMain.handle("shell:openConfigDir", () => openConfigDir());
    ipcMain.handle("shell:openContentDir", () => openContentDir());
    ipcMain.handle("shell:openSettingsFile", () => openSettingsFile());
}

export const shellService = {
    registerIpcHandlers,
};
