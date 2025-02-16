<route lang="json5">
{
    meta: {
        title: "Overview 2",
        order: 1,
        empty: true,
        transition: { name: "slide-left" },
    },
}
</route>

<template>
    <div class="overview-container">
        <div class="header">
            <img class="logo" src="/src/renderer/assets/images/BARLogoFull.png" />
        </div>
        <div class="columns">
            <div class="left-column">
                <div class="main-menu">
                    <button class="menu-item highlight" @click="router.push('/multiplayer/party')">Play</button>
                    <button class="menu-item" @click="router.push('/multiplayer/party')">Profile</button>
                    <button class="menu-item" @click="router.push('/multiplayer/party')">Campaign</button>
                    <button class="menu-item" @click="router.push('/multiplayer/party')">Arcade</button>
                    <button class="menu-item" @click="router.push('/multiplayer/party')">Library</button>
                </div>
            </div>
            <div class="center-column"></div>
            <div class="floating-news">
                <!-- <DevlogFeed /> -->
                <NewsFeed />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import DevlogFeed from "@renderer/components/misc/DevlogFeed.vue";
import NewsFeed from "@renderer/components/misc/NewsFeed.vue";
import { router } from "@renderer/router";
import { battleStore } from "@renderer/store/battle.store";
import { watch } from "vue";

watch(
    () => battleStore.isSelectingGameMode,
    (newValue) => {
        battleStore.isLobbyOpened = !newValue;
    }
);
</script>

<style lang="scss" scoped>
.overview-container {
    display: flex;
    flex-direction: column;
    align-self: center;
    width: 100%;
    height: 100%;
}

.header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.logo {
    filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8));
    align-self: center;
    width: 140px;
    margin-top: 20px;
    margin-left: 20px;
}

.main-menu {
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: left;
    justify-content: center;
    margin-left: 120px;
    flex-grow: 1;
}

.menu-item {
    // align-self: center;
    // width: 500px;
    text-transform: uppercase;
    font-family: Rajdhani;
    font-weight: bold;
    font-size: 64px;
    // padding: 20px 40px;
    color: #e6e6e6;
    // background: linear-gradient(90deg, #22c55e, #16a34a);
    // border: none;
    // border-radius: 2px;
    // box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    // text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    // transition:
    //     transform 0.3s ease,
    //     box-shadow 0.3s ease;
    &.highlight {
        color: #22c55e;
        font-size: 96px;
    }
}

.menu-item:hover {
    transform: scale(1.1) translateX(12px);
}

.menu-item::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%) scale(0);
    border-radius: 50%;
    transition: transform 0.4s ease;
}

.menu-item:hover::before {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.columns {
    display: flex;
    gap: 16px;
    height: 100%;
}

.floating-news {
    position: fixed;
    right: 120px;
    bottom: 80px;
}

.center-column {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
}
</style>
