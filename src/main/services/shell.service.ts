import { getInfo } from "@main/utils/info";
import { ipcMain, shell } from "electron";

function openConfigDir() {
  shell.openPath(getInfo().configPath);
}

function openContentDir() {
  shell.openPath(getInfo().contentPath);
}

function openSettingsFile() {
  shell.openPath(getInfo().configPath + "/settings.json");
}

function registerIpcHandlers() {
  ipcMain.handle("shell:openConfigDir", () => openConfigDir());
  ipcMain.handle("shell:openContentDir", () => openContentDir());
  ipcMain.handle("shell:openSettingsFile", () => openSettingsFile());
}

export const shellService = {
    registerIpcHandlers,
};