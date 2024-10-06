import envPaths from "env-paths";

export const APP_NAME = "Beyond All Reason";

const paths = envPaths(APP_NAME, { suffix: "" });
export const CONTENT_PATH = paths.data;
export const CONFIG_PATH = paths.config;
