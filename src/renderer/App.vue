<template>
    <div v-if="settings != null" id="wrapper" class="wrapper fullsize" @click.left="leftClick" @click.right="rightClick">
        <transition mode="in-out" name="intro">
            <IntroVideo v-if="!settings.skipIntro && videoVisible" @complete="onIntroEnd" />
        </transition>
        <DebugSidebar v-if="settings.devMode" />
        <StickyBattle />
        <Background :blur="blurBg" />
        <Notifications />
        <PromptContainer />
        <div class="lobby-version">
            {{ lobbyVersion }}
        </div>
        <div v-if="empty" class="splash-options">
            <div class="option" @click="settingsOpen = true">
                <Icon :icon="cog" height="21" />
            </div>
            <div class="option" @click="exitOpen = true">
                <Icon :icon="closeThick" height="21" />
            </div>
        </div>
        <transition mode="out-in" name="fade">
            <Suspense>
                <Preloader v-if="state === 'preloader'" @complete="onPreloadDone" />
                <InitialSetup v-else-if="state === 'initial-setup'" @complete="onInitialSetupDone" />
                <div v-else class="fullsize">
                    <NavBar :class="{ hidden: empty }" />
                    <div :class="`view view--${router.currentRoute.value.name?.toString()}`">
                        <Panel :empty="empty" class="flex-grow">
                            <Breadcrumbs :class="{ hidden: empty }" />
                            <router-view v-slot="{ Component, route }">
                                <transition name="slide-left">
                                    <template v-if="Component">
                                        <suspense timeout="0">
                                            <component :is="Component" :key="route.path" />
                                            <template #fallback>
                                                <Loader />
                                            </template>
                                        </suspense>
                                    </template>
                                </transition>
                            </router-view>
                        </Panel>
                    </div>
                </div>
            </Suspense>
        </transition>
        <Settings v-model="settingsOpen" />
        <Error />
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import closeThick from "@iconify-icons/mdi/close-thick";
import cog from "@iconify-icons/mdi/cog";
import { computed, provide, Ref } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import StickyBattle from "@renderer/components/battle/StickyBattle.vue";
import Loader from "@renderer/components/common/Loader.vue";
import Panel from "@renderer/components/common/Panel.vue";
import Background from "@renderer/components/misc/Background.vue";
import DebugSidebar from "@renderer/components/misc/DebugSidebar.vue";
import Error from "@renderer/components/misc/Error.vue";
import InitialSetup from "@renderer/components/misc/InitialSetup.vue";
import IntroVideo from "@renderer/components/misc/IntroVideo.vue";
import Preloader from "@renderer/components/misc/Preloader.vue";
import Breadcrumbs from "@renderer/components/navbar/Breadcrumbs.vue";
import NavBar from "@renderer/components/navbar/NavBar.vue";
import Settings from "@renderer/components/navbar/Settings.vue";
import Notifications from "@renderer/components/notifications/Notifications.vue";
import PromptContainer from "@renderer/components/prompts/PromptContainer.vue";

import { playRandomMusic } from "@renderer/utils/play-random-music";
import { asyncComputed, computedAsync } from "@vueuse/core";
import { defaultEngineVersion, defaultGameVersion } from "@main/config/default-versions";
import { defaultMaps } from "@main/config/default-maps";

window.game.onGameLaunched(() => {
    console.log("Game launched");
});

window.game.onGameClosed(() => {
    console.log("Game closed");
});

const router = useRouter();
const settings = computedAsync(async () => {
    return await window.settings.getSettings();
}, null);
const videoVisible = ref(true);
const state: Ref<"preloader" | "initial-setup" | "default"> = ref("preloader");
const empty = ref(false);
const blurBg = ref(true);
const lobbyVersion = asyncComputed(async () => (await window.info.getInfo()).lobby.version);
const viewOverflowY = computed(() => (router.currentRoute.value.meta.overflowY ? router.currentRoute.value.meta.overflowY : "auto"));

const settingsOpen = ref(false);
const exitOpen = ref(false);

provide("settingsOpen", settingsOpen);
provide("exitOpen", exitOpen);

const toggleMessages: Ref<((open?: boolean, userId?: number) => void) | undefined> = ref();
provide("toggleMessages", toggleMessages);

const toggleFriends: Ref<((open?: boolean) => void) | undefined> = ref();
provide("toggleFriends", toggleFriends);

const toggleDownloads: Ref<((open?: boolean) => void) | undefined> = ref();
provide("toggleDownloads", toggleDownloads);

playRandomMusic();

router.afterEach(async (to, from) => {
    empty.value = to?.meta?.empty ?? false;
    blurBg.value = to?.meta?.blurBg ?? blurBg.value;
});

function onIntroEnd() {
    videoVisible.value = false;
}

async function onPreloadDone() {
    console.time("onPreloadDone");
    state.value = "initial-setup";
    // TODO: should also check to see if game and maps are installed (need to fix bug where interrupted game dl reports as successful install)
    const installedEngines = await window.engine.getInstalledVersions();
    if (installedEngines.length === 0) {
        state.value = "initial-setup";
    } else {
        window.engine.downloadEngine(defaultEngineVersion);
        window.game.downloadGame(defaultGameVersion);
        window.maps.downloadMaps(defaultMaps);
        state.value = "default";
    }
    console.timeEnd("onPreloadDone");
}

function onInitialSetupDone() {
    state.value = "default";
}

function leftClick() {
    return api.utils.onLeftClick.dispatch();
}

function rightClick() {
    return api.utils.onRightClick.dispatch();
}
</script>

<style lang="scss" scoped>
.wrapper {
    overflow: hidden;
}
.view {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 10px;
    overflow: hidden;
}
:deep(.view > .panel) {
    overflow-y: v-bind(viewOverflowY);
}
.lobby-version {
    position: absolute;
    left: 3px;
    bottom: 1px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
}
.splash-options {
    position: fixed;
    display: flex;
    flex-direction: row;
    gap: 5px;
    right: 0;
    top: 0;
    padding: 10px;
    z-index: 5;
    .option {
        opacity: 0.8;
        &:hover {
            opacity: 1;
        }
    }
}
</style>
