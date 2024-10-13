// Sounds
export const musicFiles = import.meta.glob("./audio/music/*", { eager: true, import: "default", query: "?url" });
export const sfxFiles = import.meta.glob("./audio/sfx/*", { eager: true, import: "default", query: "?url" });

// Videos
export const introVideos = import.meta.glob("./videos/intros/*", { eager: true, import: "default", query: "?url" });

// Images
export const backgroundImages = import.meta.glob("./images/backgrounds/*", { eager: true, import: "default", query: "?url" });

// Fonts
export const fontFiles = import.meta.glob("./fonts/*", { eager: true, import: "default", query: "?url" });
