<template>
    <Modal ref="modal" :title="title" class="map-list-modal">
        <div class="container">
            <div class="map-preview-container">
                <MapPreview :map="map" :start-boxes-index="selectedBoxSetIndex" />
            </div>
            <div class="options flex-col gap-md">
                <!-- <Options
                    :modelValue="startPosType"
                    :options="startPosOptions"
                    label="Start Pos"
                    optionLabel="label"
                    optionValue="value"
                    :unselectable="false"
                    class="fullwidth"
                    @update:model-value="onStartPosChange"
                /> -->
                <div class="box-buttons">
                    <Button
                        v-for="(boxSet, i) in startBoxSets"
                        :key="i"
                        @click="selectedBoxSetIndex = i"
                        :disabled="selectedBoxSetIndex === i"
                    >
                        <span>{{ i + 1 }}</span>
                    </Button>
                </div>
                <div class="actions">
                    <Button class="red fullwidth" @click="close"> Cancel</Button>
                    <Button class="green fullwidth" @click="save"> Save</Button>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import { Ref, ref, watch, watchEffect } from "vue";

import Modal from "@renderer/components/common/Modal.vue";
import Button from "@renderer/components/controls/Button.vue";
import Options from "@renderer/components/controls/Options.vue";
import { MapData } from "@main/content/maps/map-data";
import MapPreview from "@renderer/components/maps/MapBattlePreview.vue";

const modal: Ref<null | InstanceType<typeof Modal>> = ref(null);

const props = defineProps<{
    title: string;
    map: MapData;
}>();

const selectedBoxSetIndex = ref(0);
const startBoxSets = ref(props.map.startBoxes);
watch(
    () => props.map,
    () => {
        selectedBoxSetIndex.value = 0;
        startBoxSets.value = props.map.startBoxes;
    }
);

const emit = defineEmits(["setMapOptions", "startBoxesIndexChanged"]);

watchEffect(() => {
    emit("startBoxesIndexChanged", selectedBoxSetIndex.value);
});

function close() {
    modal.value?.close();
}

function save() {
    // emit("setMapOptions", startPosType.value, getBoxOrientation(), boxRange.value);
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
        }
    }
    span {
        width: 50px;
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
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 10px;
    margin-top: auto;
    width: 100%;
}
</style>
