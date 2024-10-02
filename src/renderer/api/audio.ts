import { Settings } from "@main/services/settings.service";
import type { HowlOptions } from "howler";
import { Howl } from "howler";

class Sound extends Howl {
    public key: string;
    public isMusic: boolean;
    
    constructor(key: string, isMusic: boolean, options: HowlOptions) {
        super(options);
        this.key = key;
        this.isMusic = isMusic;
    }
}

class AudioAPI {
    public sounds: Map<string, Sound> = new Map();

    private settings: Settings;

    public async init() {
        if (this.sounds.size) {
            return this;
        }
        this.settings = await window.settings.getSettings();
        const audioFiles = import.meta.glob("@renderer/assets/audio/**/*", { as: "url" });
        for (const filePath in audioFiles) {
            const isMusic = filePath.includes("music");
            const name = filePath.split("/").pop();
            const src = filePath.split("assets/")[1];
            const volume = isMusic ? this.settings.musicVolume / 100 : this.settings.sfxVolume / 100;
            const sound = new Sound(name, isMusic, { src, volume, preload: false, html5: true });
            sound.on("play", () => {
                this.sounds.forEach((_sound) => {
                    if (sound !== _sound && isMusic) {
                        _sound.stop();
                    }
                });
            });
            this.sounds.set(name, sound);
        }

        // TODO find a way to watch settings changes, thinking about dropping that for more specialized ipc calls
        // e.g. ipcRenderer.invoke("settings:setMusicVolume") and ipcRenderer.invoke("settings:setSfxVolume")
        
        // watch(
        //     () => api.settings.model.sfxVolume,
        //     () => {
        //         this.sounds.forEach((sound) => {
        //             if (!sound.isMusic) {
        //                 sound.volume(api.settings.model.sfxVolume / 100);
        //             }
        //         });
        //     }
        // );

        // watch(
        //     () => api.settings.model.musicVolume,
        //     () => {
        //         this.sounds.forEach((sound) => {
        //             if (sound.isMusic) {
        //                 sound.volume(api.settings.model.musicVolume / 100);
        //             }
        //         });
        //     }
        // );

        return this;
    }

    public load() {
        this.sounds.forEach((sound) => {
            sound.load();
        });
    }

    public getAllSounds(): Sound[] {
        return Array.from(this.sounds.values());
    }

    public play(key: string) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play();
            return sound;
        } else {
            console.error(`Could not find sound: ${key}`);
            return;
        }
    }

    public muteMusic(fadeTime = 4000) {
        const musicSounds = this.getAllSounds().filter((sound) => sound.isMusic);
        for (const sound of musicSounds) {
            sound.fade(sound.volume(), 0, fadeTime);
        }
    }

    public unmuteMusic(fadeTime = 4000) {
        const musicSounds = this.getAllSounds().filter((sound) => sound.isMusic);
        for (const sound of musicSounds) {
            sound.fade(0, this.settings.musicVolume / 100, fadeTime);
        }
    }
}

export const audioApi = new AudioAPI();