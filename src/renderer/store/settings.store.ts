import { Settings } from "@main/services/settings.service";
import { reactive, watch } from "vue";

export const settingsStore = reactive({
    isInitialized: false,
} as {
    isInitialized: boolean;
} & Settings);

watch(
    settingsStore,
    () => {
        if (settingsStore.isInitialized) {
            window.settings.updateSettings({
                fullscreen: settingsStore.fullscreen,
                displayIndex: settingsStore.displayIndex,
                skipIntro: settingsStore.skipIntro,
                sfxVolume: settingsStore.sfxVolume,
                musicVolume: settingsStore.musicVolume,
                loginAutomatically: settingsStore.loginAutomatically,
                devMode: settingsStore.devMode,
                battlesHideInProgress: settingsStore.battlesHideInProgress,
                battlesHidePvE: settingsStore.battlesHidePvE,
                battlesHideLocked: settingsStore.battlesHideLocked,
                battlesHideEmpty: settingsStore.battlesHideEmpty,
            });
        }
    },
    { deep: true }
);

watch(
    () => settingsStore.fullscreen,
    () => window.mainWindow.setFullscreen(settingsStore.fullscreen)
);

export async function initSettingsStore() {
    const currentSettings = await window.settings.getSettings();

    settingsStore.fullscreen = currentSettings.fullscreen;
    settingsStore.displayIndex = currentSettings.displayIndex;
    settingsStore.skipIntro = currentSettings.skipIntro;
    settingsStore.sfxVolume = currentSettings.sfxVolume;
    settingsStore.musicVolume = currentSettings.musicVolume;
    settingsStore.loginAutomatically = currentSettings.loginAutomatically;
    settingsStore.devMode = currentSettings.devMode;
    settingsStore.battlesHideInProgress = currentSettings.battlesHideInProgress;
    settingsStore.battlesHidePvE = currentSettings.battlesHidePvE;
    settingsStore.battlesHideLocked = currentSettings.battlesHideLocked;
    settingsStore.battlesHideEmpty = currentSettings.battlesHideEmpty;

    settingsStore.isInitialized = true;
}
