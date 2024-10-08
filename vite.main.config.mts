import { defineConfig } from "vite";

import path from "path";
import { worker } from "globals";

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: {
            "@main": path.join(__dirname, "src/main"),
            "@renderer": path.join(__dirname, "src/renderer"),
            "@preload": path.join(__dirname, "src/preload"),
            $: path.join(__dirname, "src/common"),
        },
    },
    build: {
        rollupOptions: {
            external: ["better-sqlite3", "7zip-min"],
            input: {
                index: path.resolve(__dirname, "src/main/index.ts"),
                "parse-map-worker": path.resolve(__dirname, "src/main/content/maps/parse-map-worker.ts"),
            },
        },
        sourcemap: true,
    },
});
