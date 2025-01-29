<route lang="json5">
{
    meta: {
        title: "A.T.L.A.S.",
        order: 0,
        onlineOnly: true,
        transition: { name: "slide-left" },
    },
}
</route>

<template>
    <div class="atlas-view">
        <div class="atlas-container">
            <div class="view-title">
                <h1>A.T.L.A.S.</h1>
                <div>99 commanders in battle</div>
                <div>1 commander awaiting orders</div>
            </div>

            <Panel class="mission-panel"></Panel>

            <MissionTile
                side="bottom"
                class="mission-1 selected"
                :scenario="{ title: 'Threat level 3', imagepath: '/src/renderer/assets/images/modes/scavengers.webp', x: 80, y: 250 }"
            />

            <MissionTile
                side="left"
                class="mission-2"
                :scenario="{ title: 'Threat level 1', imagepath: '/src/renderer/assets/images/modes/scavengers.webp', x: -100, y: 200 }"
            />

            <MissionTile
                side="bottom"
                class="mission-3"
                :scenario="{ title: 'Threat level 1', imagepath: '/src/renderer/assets/images/modes/scavengers.webp', x: 310, y: 200 }"
            />

            <button class="quick-play-button searching">Deploy now</button>
        </div>
        <div class="atlas-background">
            <Galaxy />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Galaxy from "@renderer/components/3d/Galaxy.vue";
import Panel from "@renderer/components/common/Panel.vue";
import MissionTile from "@renderer/components/misc/MissionTile.vue";
</script>

<style lang="scss" scoped>
.atlas-view {
    padding-top: 50px;
    padding-left: 200px;
}

.mission-panel {
    width: 300px;
    height: 600px;
}

.mission-1 {
    position: fixed;
    top: 15%;
    right: 40%;
}

.mission-2 {
    position: fixed;
    top: 30%;
    right: 10%;
}

.mission-3 {
    position: fixed;
    bottom: 30%;
    right: 60%;
}

.atlas-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #000000ba, #000000fd);
    transition: all 1s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: -1;
    // animation: pulse 1s infinite ease-in-out;
}

.atlas-container {
    display: flex;
    flex-direction: column;
    align-self: center;
    gap: 20px;
    height: 100%;
    width: 1000px;
    overflow: visible;
}

.quick-play-button {
    position: fixed;
    right: 15%;
    bottom: 20%;
    width: 300px;
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
    overflow: hidden;
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.searching {
    animation: pulse 3s infinite ease-in-out;
}

.quick-play-button:hover {
    box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
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
</style>
