"use strict";
const electron = require("electron");
const Database = require("better-sqlite3");
const createDb = () => {
  const db = new Database("foobar.db", {});
  db.pragma("journal_mode = WAL");
  db.prepare(
    "CREATE TABLE IF NOT EXISTS foo (id INTEGER PRIMARY KEY, name TEXT)"
  ).run();
  return "db created";
};
electron.contextBridge.exposeInMainWorld("myAPI", {
  desktop: true,
  doAThing: () => {
    const result = createDb();
    console.log("result", result);
  }
});
