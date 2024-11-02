<template>
    <div class="map-container">
        <div v-if="map" class="map" :style="aspectRatioDrivenStyle">
            <img :src="mapTextureUrl" />
            <div v-if="boxes" class="boxes">
                <div v-for="(box, i) in boxes" :key="`box${i}`" v-startBox="box" class="box highlight" />
            </div>
        </div>
        <!-- <div class="start-positions">
            <div
                v-for="(player, index) in replay.contenders.filter((p) => p.startPos)"
                :key="index"
                v-startPos="[player.startPos, mapWidthElmos, mapHeightElmos]"
                v-setPlayerColor="player.rgbColor"
                class="start-pos"
            >
                <div class="start-pos-tooltip">
                    <img v-if="player.faction === 'Armada'" src="/src/renderer/assets/images/factions/armada_faction.png" />
                    <img v-else-if="player.faction === 'Cortex'" src="/src/renderer/assets/images/factions/cortex_faction.png" />
                    <img v-else src="/src/renderer/assets/images/factions/unknown_faction.png" />
                    <span>{{ player.name }}</span>
                </div>
            </div>
        </div> -->
    </div>
</template>

<script setup lang="ts">
import { MapData } from "@main/content/maps/map-data";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import vStartBox from "@renderer/directives/vStartBox";
import vStartPos from "@renderer/directives/vStartPos";
import { fetchMapImages } from "@renderer/store/maps.store";
import { computed, defineComponent, ref, watch, watchEffect } from "vue";

defineComponent({
    directives: {
        startBox: vStartBox,
        startPos: vStartPos,
    },
});

const props = defineProps<{
    map: MapData;
    startBoxesIndex?: number;
    showStartPositions?: boolean;
}>();

const { get } = useImageBlobUrlCache();
const mapTextureUrl = computed(() => {
    if (!props.map?.images) {
        return;
    }
    return get(props.map?.scriptName, props.map?.images.texture);
});
watchEffect(() => {
    if (!props.map?.scriptName) {
        return;
    }
    if (!props.map?.images?.texture) {
        fetchMapImages(props.map);
    }
});

const startBoxes = ref(props.map?.startBoxes);
const startPositions = ref(props.map?.startPositions);
watch(
    () => props.map,
    () => {
        startBoxes.value = props.map?.startBoxes;
        startPositions.value = props.map?.startPositions;
    }
);

const boxes = computed(() => {
    return startBoxes.value.at(props.startBoxesIndex)?.startboxes.map((box) => {
        const { x: x1, y: y1 } = box.poly.at(0);
        const { x: x2, y: y2 } = box.poly.at(1);
        return {
            top: y1 / 200,
            bottom: y2 / 200,
            left: x1 / 200,
            right: x2 / 200,
        };
    });
});

const aspectRatioDrivenStyle = computed(() => {
    if (!props.map?.width || !props.map?.height) {
        return;
    }
    return props.map.width / props.map.height > 1 ? "height: auto;" : "height: 100%;";
});
</script>

<style lang="scss" scoped>
.map-container {
    aspect-ratio: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.3);
}

.map {
    position: relative;
    object-fit: contain;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    img {
        max-height: 100%;
        width: 100%;
    }
}

.boxes {
    position: absolute;
    width: 100%;
    height: 100%;
}

.box {
    position: absolute;
    box-sizing: border-box;
    // &:nth-child(1) {
    //     background: rgba(23, 202, 32, 0.3);
    // }
}

@keyframes subtleGlow {
    0%,
    100% {
        box-shadow:
            0 0 8px rgba(200, 200, 200, 0.4),
            0 0 15px rgba(200, 200, 200, 0.3);
        background-color: rgba(200, 200, 200, 0.1);
    }
    50% {
        box-shadow:
            0 0 15px rgba(200, 200, 200, 0.5),
            0 0 25px rgba(200, 200, 200, 0.4);
        background-color: rgba(200, 200, 200, 0.15);
    }
}

.highlight {
    border: 2px dashed rgba(255, 255, 255, 1); /* More defined gray border */
    animation: subtleGlow 1.5s infinite ease-in-out; /* Slightly shorter for a bit more activity */
    transition: all 0.2s ease;
}
</style>
