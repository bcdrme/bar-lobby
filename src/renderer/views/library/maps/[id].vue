<route lang="json5">
{ props: true, meta: { title: "Map Details", hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div v-if="map" class="gap-md page">
        <h1>{{ map.friendlyName }}</h1>

        <div class="container">
            <div class="map-preview-container">
                <MapPreview class="map-preview" :map="map" />
            </div>

            <div class="details">
                <div class="detail-text"><b>Description:</b> {{ map.description }}</div>
                <div v-if="map.mapInfo?.author" class="detail-text"><b>Author:</b> {{ map.mapInfo.author }}</div>
                <div class="detail-text"><b>Size:</b> {{ map.width }} x {{ map.height }}</div>
                <div class="detail-text"><b>Wind:</b> {{ map.minWind }} - {{ map.maxWind }}</div>
                <div class="detail-text"><b>Tidal:</b> {{ map.tidalStrength }}</div>
                <div class="detail-text"><b>Gravity:</b> {{ map.gravity }}</div>
                <div class="detail-text"><b>Depth:</b> {{ map.minDepth }} - {{ map.maxDepth }}</div>
                <div class="detail-text"><b>Hardness:</b> {{ map.mapHardness }}</div>
                <div v-if="map.startPositions" class="detail-text"><b>Start Positions:</b> {{ map.startPositions.length }}</div>

                <Button class="green inline" @click="play">Play</Button>
            </div>
        </div>
    </div>
    <div v-else class="flex-col gap-md">
        <div>
            Map <strong>{{ id }}</strong> is not installed.
        </div>
        <Button class="green" style="align-self: flex-start" @click="downloadMap">Download</Button>
    </div>
</template>

<script lang="ts" setup>
/*
 * TODO:
 * Switch map preview between types
 * - Metal
 * - Height
 * - Type?
 * - 3D model
 * Back button to return to map list
 */

import { computed, ref, watch } from "vue";

import Button from "@renderer/components/controls/Button.vue";
import MapPreview from "@renderer/components/maps/MapPreview.vue";
import { mapsStore } from "@renderer/store/maps.store";
import { MapData } from "@main/cache/model/map-data";

const props = defineProps<{
    id: string;
}>();

const map = ref<MapData>();
watch(
    () => props.id,
    () => {
        map.value = mapsStore.installedMaps.find((m) => m.scriptName === props.id);
    },
    { immediate: true }
);

async function downloadMap() {
    // await api.content.maps.downloadMap(props.id);
}

async function play() {
    // const battle = defaultBattle(props.id);
    // battle.start();
    // await window.game.launchGame();
}
</script>

<style lang="scss" scoped>
.page {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
}

.container {
    display: flex;
    flex-direction: row;
    flex: 1 1 auto;
    gap: 15px;
    max-height: 100%;
}

.map-preview-container {
    aspect-ratio: 1;
}

.map-preview {
    max-height: 100%;
    height: 100%;
    max-width: 100%;
    width: 100%;
}

.details {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
</style>
