import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: {
            "@": path.join(__dirname, "src/main"),
            $: path.join(__dirname, "src/common"),
        },
    },
    build: {
        assetsDir: ".",
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("env-paths")) {
                        return "env-paths";
                    }
                    return;
                },
            },
        },
    },
});
