<template>
    <Modal title="settings">
        <div class="gridform">
            <div>Fullscreen</div>
            <Checkbox v-model="settings.fullscreen" />

            <div>Display</div>
            <Select v-model="settings.displayIndex" :options="displayOptions" optionLabel="label" optionValue="value" />

            <div>Skip Intro</div>
            <Checkbox v-model="settings.skipIntro" />

            <div>Sfx Volume</div>
            <Range v-model="settings.sfxVolume" :min="0" :max="100" :step="1" />

            <div>Music Volume</div>
            <Range v-model="settings.musicVolume" :min="0" :max="100" :step="1" />

            <div>Dev Mode</div>
            <Checkbox v-model="settings.devMode" />
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, toRaw, watch, watchEffect } from "vue";

import Modal from "@renderer/components/common/Modal.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import Range from "@renderer/components/controls/Range.vue";
import Select from "@renderer/components/controls/Select.vue";
import { asyncComputed } from "@vueuse/core";
import { Settings } from "@main/services/settings.service";

const settings = ref<Settings>();

onMounted(async () => {
    settings.value = await window.settings.getSettings();
});

watch(settings, () => window.settings.updateSettings(toRaw(settings.value)), {
    deep: true,
    immediate: true,
});

watchEffect(() => {
    if (settings.value) window.mainWindow.setFullscreen(settings.value.fullscreen);
});

const displayOptions: Ref<Array<{ label: string; value: number }>> = asyncComputed(async () => {
    const info = await window.info.getInfo();
    return Array(info.hardware.numOfDisplays)
        .fill(0)
        .map((_, i) => {
            return { label: `Display ${i + 1}`, value: i };
        });
});
</script>

<style lang="scss" scoped></style>
