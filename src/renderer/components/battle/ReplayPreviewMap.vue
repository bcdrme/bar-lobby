<template>
    <div v-if="map" class="map">
        <img :src="mapTextureUrl" />
        <div class="boxes">
            <div v-for="team in teams" :key="team.allyTeamId" v-startBox="team.startBox" class="box" />
        </div>
        <div class="start-positions">
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
        </div>
    </div>
</template>

<script setup lang="ts">
import { Replay } from "@main/content/replays/replay";
import defaultMiniMap from "/src/renderer/assets/images/default-minimap.png?url";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import { db } from "@renderer/store/db";
import { computed, defineComponent, ref, watch, watchEffect } from "vue";
import vStartBox from "@renderer/directives/vStartBox";
import vStartPos from "@renderer/directives/vStartPos";
import vSetPlayerColor from "@renderer/directives/vSetPlayerColor";

const props = defineProps<{
    replay: Replay;
}>();

const teams = ref(props.replay.teams);

watch(
    () => props.replay,
    () => {
        teams.value = props.replay.teams;
    }
);

defineComponent({
    directives: {
        startBox: vStartBox,
        startPos: vStartPos,
        setPlayerColor: vSetPlayerColor,
    },
});

const map = useDexieLiveQueryWithDeps([() => props.replay.mapScriptName], () => db.maps.get(props.replay.mapScriptName));
// const mapWidthElmos = computed(() => (map.value.width ? map.value.width * 512 : null));
// const mapHeightElmos = computed(() => (map.value.height ? map.value.height * 512 : null));

const mapWidthElmos = ref<number>();
const mapHeightElmos = ref<number>();

const cache = useImageBlobUrlCache();
const mapTextureUrl = computed(() =>
    map.value?.images?.texture ? cache.get(map.value.fileName, map.value.images.texture) : defaultMiniMap
);

watchEffect(() => {
    if (!map.value?.images?.texture) return;
    createImageBitmap(map.value?.images?.texture)
        .then((imgBitmap) => {
            mapWidthElmos.value = map.value.width * 512;
            mapHeightElmos.value = map.value.height * 512;
            imgBitmap.close();
        })
        .catch();
});
</script>

<style lang="scss" scoped>
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
        // image-rendering: pixelated;
    }
}
.boxes {
    position: absolute;
    width: 100%;
    height: 100%;
}
.box {
    position: absolute;
    background: rgba(194, 10, 10, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
    &:nth-child(1) {
        background: rgba(23, 202, 32, 0.3);
    }
}
.start-positions {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
}
.start-pos {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 14px;
    border: 1px solid hsl(0deg 0% 0% / 53%);
    box-shadow: 1px 1px rgb(0 0 0 / 43%);
    transform: translateX(-6px) translateY(-6px);
    &-tooltip {
        display: flex;
        align-items: center;
        position: absolute;
        transform: translateX(-50%);
        left: 6px;
        bottom: 13px;
        font-size: 12px;
        width: max-content;
        .left &,
        .right & {
            bottom: -2px;
            transform: none;
        }
        .left & {
            left: 16px;
        }
        .right & {
            right: 16px;
            left: initial;
        }
        img {
            height: 16px;
            width: 16px;
        }
    }
}
</style>
