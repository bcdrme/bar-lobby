<template>
    <Button v-if="map?.isInstalled" class="green flex-grow" :class="props.class" :disabled="props.disabled" @click="props.onClick">
        <slot />
    </Button>
    <Button v-else-if="map?.isDownloading" class="green flex-grow" disabled>Downloading map ...</Button>
    <Button v-else class="red flex-grow" @click="downloadMap(scriptName)">Download map</Button>
</template>

<script lang="ts" setup>
import Button from "@renderer/components/controls/Button.vue";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { downloadMap } from "@renderer/store/maps.store";
import { ButtonProps } from "primevue/button";

export interface Props extends /* @vue-ignore */ ButtonProps {
    scriptName: string;
    disabled?: boolean;
    class?: string;
    onClick?: (event: MouseEvent) => void;
}

const props = defineProps<Props>();

const map = useDexieLiveQueryWithDeps([() => props.scriptName], () => db.maps.get(props.scriptName));
</script>
