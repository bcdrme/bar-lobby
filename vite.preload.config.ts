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
    rollupOptions: {
      external: ["better-sqlite3"],
    },
    sourcemap: true,
  },
});
