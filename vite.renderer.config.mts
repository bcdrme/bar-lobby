import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import VueRouter from "unplugin-vue-router/vite";

// https://vitejs.dev/config
export default defineConfig({
    publicDir: "assets",
    resolve: {
        alias: {
            "@main": path.join(__dirname, "src/main"),
            "@renderer": path.join(__dirname, "src/renderer"),
            "@preload": path.join(__dirname, "src/preload"),
            $: path.join(__dirname, "src/common"),
        },
    },
    build: {
        assetsDir: "./src/renderer/assets",
        sourcemap: true,
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext",
        },
    },
    css: {
        modules: false,
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
                additionalData: `@use "@renderer/styles/_utils.scss";`,
            },
        },
    },
    plugins: [
        VueRouter({
            routesFolder: "src/renderer/views",
            dts: "src/renderer/typed-router.d.ts",
        }),
        vue(),
    ],
});
