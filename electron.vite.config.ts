import vue from "@vitejs/plugin-vue";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import path from "path";
import VueRouter from "unplugin-vue-router/vite";

export default defineConfig({
    main: {
        resolve: {
            alias: {
                "@main": path.join(__dirname, "src/main"),
                "@renderer": path.join(__dirname, "src/renderer"),
                "@preload": path.join(__dirname, "src/preload"),
                $: path.join(__dirname, "src/common"),
            },
        },
        build: {
            assetsDir: ".",

        },
        plugins: [externalizeDepsPlugin({ exclude: ["env-paths"] })],
    },
    renderer: {
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
            assetsDir: ".",
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
                    additionalData: `@use "@renderer/styles/_utils.scss";`,
                },
            },
        },
        plugins: [
            VueRouter({
                routesFolder: "src/renderer/views",
                dts: "src/renderer/typed-router.d.ts",
                importMode: "sync",
            }),
            vue(),
        ],
    },
    preload: {
        resolve: {
            alias: {
                "@main": path.join(__dirname, "src/main"),
                $: path.join(__dirname, "src/common"),
            },
        },
        build: {
            lib: {
                entry: path.resolve(__dirname, "src/preload/preload.ts"),
            },
        },
    },
});
