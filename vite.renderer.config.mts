import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import renderer from 'vite-plugin-electron-renderer'
import VueRouter from "unplugin-vue-router/vite";

// https://vitejs.dev/config
export default defineConfig({
    publicDir: "assets",
    resolve: {
        alias: {
            "@": path.join(__dirname, "src/renderer"),
            $: path.join(__dirname, "src/common"),
        },
    },
    build: {
        // assetsDir: ".",
        rollupOptions: {
            external: ["better-sqlite3"],
        },
        sourcemap: true,
    },
    // optimizeDeps: {
    //     esbuildOptions: {
    //         target: "esnext",
    //     },
    // },
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
        renderer(),
    ],
});
