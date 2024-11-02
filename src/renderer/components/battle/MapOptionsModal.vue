<template>
    <Modal ref="modal" :title="title" class="map-list-modal">
        <div class="container">
            <div class="map-preview-container">
                <MapPreview :map="map" :start-boxes-index="battleStore.battleOptions.startBoxesIndex" />
            </div>
            <div class="options flex-col gap-md">
                <div>
                    <h4>Boxes presets</h4>
                    <div class="box-buttons">
                        <Button
                            v-for="(boxSet, i) in map.startBoxes"
                            :key="i"
                            @click="
                                () => {
                                    delete battleStore.battleOptions.startBoxes;
                                    delete battleStore.battleOptions.fixedPositionsIndex;
                                    battleStore.battleOptions.startPosType = StartPosType.Boxes;
                                    battleStore.battleOptions.startBoxesIndex = i;
                                }
                            "
                            :disabled="battleStore.battleOptions.startBoxesIndex === i"
                        >
                            <span>{{ i + 1 }}</span>
                        </Button>
                    </div>
                </div>
                <div>
                    <h4>Fixed positions</h4>
                    <div class="box-buttons">
                        <Button
                            v-for="(teamSet, i) in map.startPositions.team"
                            :key="`team${i}`"
                            @click="
                                () => {
                                    delete battleStore.battleOptions.startBoxes;
                                    delete battleStore.battleOptions.startBoxesIndex;
                                    battleStore.battleOptions.startPosType = StartPosType.Fixed;
                                    battleStore.battleOptions.fixedPositionsIndex = i;
                                }
                            "
                            :disabled="battleStore.battleOptions.startPosType === StartPosType.Fixed"
                            ><span>{{ i + 1 }}</span></Button
                        >
                    </div>
                </div>
                <div>
                    <h4>FFA</h4>
                    <div class="box-buttons">
                        <Button>
                            <span>Random</span>
                        </Button>
                    </div>
                </div>
                <div class="flex-col gap-sm">
                    <h4>Custom</h4>
                    <div class="box-buttons">
                        <Button>
                            <img src="/src/renderer/assets/images/icons/east-vs-west.png" />
                        </Button>
                        <Button>
                            <img src="/src/renderer/assets/images/icons/north-vs-south.png" />
                        </Button>
                        <Button>
                            <img src="/src/renderer/assets/images/icons/northeast-vs-southwest.png" />
                        </Button>
                        <Button>
                            <img src="/src/renderer/assets/images/icons/northwest-vs-southeast.png" />
                        </Button>
                    </div>
                    <div class="box-buttons">
                        <Range v-model="customBoxRange" :min="5" :max="100" :step="5" />
                    </div>
                </div>
                <div class="actions">
                    <Button class="green fullwidth" @click="close">Close</Button>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import { Ref, ref, watch } from "vue";

import Modal from "@renderer/components/common/Modal.vue";
import Button from "@renderer/components/controls/Button.vue";
import { MapData } from "@main/content/maps/map-data";
import MapPreview from "@renderer/components/maps/MapBattlePreview.vue";
import Range from "@renderer/components/controls/Range.vue";
import { battleStore } from "@renderer/store/battle.store";
import { StartPosType } from "@main/game/battle/battle-types";

const modal: Ref<null | InstanceType<typeof Modal>> = ref(null);

const props = defineProps<{
    title: string;
    map: MapData;
}>();

const customBoxRange = ref(25);

watch(
    () => props.map,
    () => {
        delete battleStore.battleOptions.startBoxes;
        battleStore.battleOptions.startPosType = StartPosType.Boxes;
        battleStore.battleOptions.startBoxesIndex = 0;
        customBoxRange.value = 25;
    }
);

function close() {
    modal.value?.close();
}
</script>

<style lang="scss" scoped>
.container {
    height: 100%;
    position: relative;
    display: flex;
    gap: 10px;
}

.map-preview-container {
    aspect-ratio: 1;
}

.box-buttons {
    display: flex;
    flex-direction: row;
    gap: 5px;
    :deep(button) {
        padding: 5px;
        &:hover {
            img {
                opacity: 1;
            }
            span {
                opacity: 1;
            }
        }
    }
    img {
        max-width: 50px;
        image-rendering: pixelated;
        opacity: 0.7;
    }
    span {
        min-width: 50px;
        opacity: 0.7;
        font-size: 2rem;
    }
}

.options {
    width: 100%;
}

.control {
    max-height: 80px;
}

.actions {
    margin-top: auto;
    width: 100%;
}
</style>
