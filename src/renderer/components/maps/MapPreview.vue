<template>
    <div class="map-container">
        <div class="map" :style="`background-image: url('${image}')`"></div>
    </div>
</template>

<script setup lang="ts">
import { MapData } from "@main/content/maps/map-data";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import { computed } from "vue";

const props = defineProps<{
    map: MapData;
}>();

const { get } = useImageBlobUrlCache();
const image = computed(() => get(props.map.scriptName, props.map.images.texture));
</script>

<style lang="scss" scoped>
.map-container {
    height: 100%;
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.3);
}

.map {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    height: 100%;
    width: 100%;
}
</style>
