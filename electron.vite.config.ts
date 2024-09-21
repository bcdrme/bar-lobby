import vue from "@vitejs/plugin-vue";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import path from "path";
import VueRouter from "unplugin-vue-router/vite";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
    main: {
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
        plugins: [externalizeDepsPlugin({ exclude: ["env-paths"] })],
    },
    renderer: {
        publicDir: "assets",
        resolve: {
            alias: {
                "@": path.join(__dirname, "src/renderer"),
                $: path.join(__dirname, "src/common"),
            },
        },
        build: {
            assetsDir: ".",
            rollupOptions: {
                external: [],
            },
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
                    additionalData: `@use "@/styles/_utils.scss";`,
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
            renderer({
                resolve: {
                    path: {
                        type: "cjs",
                    },
                    fs: {
                        type: "cjs",
                    },
                    child_process: {
                        type: "cjs",
                    },
                    stream: {
                        type: "cjs",
                    },
                    os: {
                        type: "cjs",
                    },
                    "node-fetch": {
                        type: "esm",
                    },
                    "spring-map-parser": {
                        type: "cjs",
                    },
                    "tachyon-client": {
                        type: "esm",
                    },
                    octokit: {
                        type: "esm",
                    },
                    axios: {
                        type: "cjs",
                    },
                    "glob-promise": {
                        type: "cjs",
                    },
                },
            }),
        ],
    },
});
