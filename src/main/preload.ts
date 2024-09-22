// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";

import Database from "better-sqlite3";
import { apiInit } from "./api/api";

export const createDb = () => {
  const db = new Database("foobar.db", {});
  db.pragma("journal_mode = WAL");

  db.prepare(
    "CREATE TABLE IF NOT EXISTS foo (id INTEGER PRIMARY KEY, name TEXT)",
  ).run();

  return "db created";
};

contextBridge.exposeInMainWorld("api", await apiInit());