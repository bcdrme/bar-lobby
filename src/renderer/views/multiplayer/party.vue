<route lang="json5">
{
    meta: {
        title: "Party",
        order: 0,
        empty: true,
        onlineOnly: true,
        transition: { name: "slide-left" },
    },
}
</route>

<template>
    <div class="party">
        <div class="back-button" @click="router.push('/home/overview2')">
            <Icon :icon="chevronLeft" />
            <span class="first">Back</span>
            <span class="first">//</span>
            <span class="second">Party</span>
        </div>

        <ValorantNavbar />

        <div class="party-background"></div>
        <div class="party-container">
            <PartyComponent />
            <div class="footer">
                <div>
                    <button class="cancel-button txt-outlined">Map pool</button>
                    <button
                        v-if="matchmakingStore.status === MatchmakingStatus.Idle"
                        class="quick-play-button txt-outlined"
                        :class="{
                            disabled: !matchmakingStore.selectedQueue,
                        }"
                        @click="matchmaking.startSearch"
                    >
                        Start
                    </button>
                    <button
                        v-else-if="matchmakingStore.status === MatchmakingStatus.Searching"
                        class="quick-play-button searching"
                        disabled
                    >
                        Searching for opponent
                    </button>
                    <button
                        v-else-if="matchmakingStore.status === MatchmakingStatus.MatchFound"
                        class="quick-play-button"
                        @click="matchmaking.acceptMatch"
                    >
                        Match found
                    </button>
                    <button v-else-if="matchmakingStore.status === MatchmakingStatus.MatchAccepted" class="quick-play-button" disabled>
                        Accepted
                    </button>
                    <button class="cancel-button txt-outlined">Leave party</button>
                </div>
                <button
                    class="cancel-button txt-outlined"
                    :class="{
                        disabled: matchmakingStore.status === MatchmakingStatus.Idle,
                    }"
                    @click="matchmaking.stopSearch"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { router } from "@renderer/router";
import { matchmaking, MatchmakingStatus, matchmakingStore } from "@renderer/store/matchmaking.store";
import chevronLeft from "@iconify-icons/mdi/chevron-left";
import { Icon } from "@iconify/vue/dist/iconify.js";
import ValorantNavbar from "@renderer/components/navbar/ValorantNavbar.vue";
import PartyComponent from "@renderer/components/social/PartyComponent.vue";
</script>

<style lang="scss" scoped>
.party {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

$back-button-font-size: 24px;
.back-button {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    svg {
        font-size: $back-button-font-size * 2;
    }
    .first {
        text-transform: uppercase;
        font-size: $back-button-font-size;
        color: #fff;
        font-weight: lighter;
    }
    .second {
        text-transform: uppercase;
        font-size: $back-button-font-size;
        color: #fff;
    }
}

.footer {
    padding-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.party-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background: radial-gradient(circle, #000000ba, #000000fd);
    backdrop-filter: blur(100px) brightness(1.8);
    transition: all 1s ease;
    z-index: -1;
    // animation: pulse 10s infinite ease-in-out;
}

@keyframes pulse {
    0%,
    100% {
        background-size: 100% 100%;
        filter: brightness(0.8);
    }
    50% {
        background-size: 110% 110%;
        filter: brightness(1);
    }
}

.party-container {
    display: flex;
    flex-direction: column;
    align-self: center;
    justify-content: center;
    gap: 20px;
    height: 100%;
    overflow: visible;
}

.join-queue {
    margin: 0 auto;
    display: block;
    margin-top: 20px;
}

.mode-select {
    display: flex;
    height: 100%;
    overflow: visible;
    gap: 50px;
}

.main-menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 40px;
    margin-bottom: 40px;
    flex-grow: 1;
}

.menu-item {
    align-self: center;
    width: 500px;
    text-transform: uppercase;
    font-family: Rajdhani;
    font-weight: bold;
    font-size: 2rem;
    padding: 20px 40px;
    color: #fff;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border: none;
    border-radius: 2px;
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.searching {
    animation: pulse 3s infinite ease-in-out;
}

.quick-play-button {
    align-self: center;
    // text-transform: uppercase;
    // font-family: Rajdhani;
    // font-weight: bold;

    /* Rectangle 4.8 */

    box-sizing: border-box;

    background: linear-gradient(180deg, #313131 18.23%, #141414 73.48%);
    /* Button Stroke */
    border: 1px solid rgba(200, 200, 200, 0.34);
    box-shadow: inset 0px 0px 3.06553px rgba(0, 0, 0, 0.43);
    border-radius: 2px;

    font-size: 2rem;
    // width: 200px;
    padding: 10px 20px;
    color: #fff;
    // background: linear-gradient(90deg, #22c55e, #16a34a);
    // border: none;
    // border-radius: 2px;
    // box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    // text-align: center;
    // cursor: pointer;
    // position: relative;
    // overflow: hidden;
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.quick-play-button:hover {
    box-shadow: 0 0 25px rgba(162, 162, 162, 0.6);
}

.quick-play-button::before {
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

.quick-play-button:hover::before {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.cancel-button {
    width: 250px;
    align-self: center;
    // text-transform: uppercase;
    // font-family: Rajdhani;
    // font-weight: bold;
    font-size: 1.5rem;
    padding: 20px 40px;
    color: #fff;
    // background: linear-gradient(90deg, #c52222, #a31616);
    border: none;
    border-radius: 2px;
    // box-shadow: 0 0 15px rgba(197, 34, 34, 0.4);
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.cancel-button:hover {
    // box-shadow: 0 0 25px rgba(197, 34, 34, 0.6);
    color: #eee;
    // transform: scale(0.99);
    text-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
}

.cancel-button::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: rgba(105, 105, 105, 0.2);
    transform: translate(-50%, -50%) scale(0);
    border-radius: 50%;
    transition: transform 0.4s ease;
}

.disabled {
    cursor: not-allowed;
    opacity: 0.1;
}
</style>
