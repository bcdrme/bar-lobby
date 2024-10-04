<template>
    <div class="fullsize flex-center">
        <Progress :percent="loadedPercent" :height="40" style="width: 70%" />
    </div>
</template>

<script lang="ts" setup>
import { randomFromArray } from "$/jaz-ts-utils";
import { computed, onMounted, ref } from "vue";

import Progress from "@renderer/components/common/Progress.vue";

const emit = defineEmits(["complete"]);

const totalFiles = ref(0);
const loadedFiles = ref(0);
const loadedPercent = computed(() => loadedFiles.value / totalFiles.value);

const backgroundImages = import.meta.glob("/src/renderer/assets/images/backgrounds/**/*", { as: "url" });
const randomBackgroundImage = randomFromArray(Object.keys(backgroundImages));
document.documentElement.style.setProperty("--background", `url(${randomBackgroundImage})`);

const fontFiles = import.meta.glob("@renderer/assets/fonts/*", { as: "url" });

totalFiles.value = Object.keys(fontFiles).length;

onMounted(async () => {
    try {
        for (const fontFile in fontFiles) {
            await loadFont(fontFile);
            loadedFiles.value++;
        }
    } catch (error) {
        console.error(`Failed to load fonts: `, error);
    }
    api.audio.load();
    emit("complete");
});

async function loadFont(url: string) {
    console.log("Loading font:", url);
    const fileName = url.split("/").pop()!.split(".")[0];
    const [family, weight, style] = fileName.split("-");
    const font = new FontFace(family, `url(${url})`, { weight, style });
    document.fonts.add(font);
    return font.load();
}
</script>

<style lang="scss" scoped></style>
