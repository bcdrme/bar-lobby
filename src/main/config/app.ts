import envPaths from "env-paths";
import path from "path";

export const APP_NAME = "Beyond All Reason";

const paths = envPaths(APP_NAME, { suffix: "" });
export const CONTENT_PATH = paths.data;
export const CONFIG_PATH = paths.config;

export const REPLAYS_PATH = path.join(CONTENT_PATH, "demos");
export const MAPS_PATH = path.join(CONTENT_PATH, "maps");
