<template>
    <div class="flex-col gap-lg flex-grow fullheight">
        <div class="flex-row gap-md">
            <SearchBox v-model="searchVal" />
            <Select v-model="sortMethod" :options="sortMethods" label="Sort By" />
        </div>

        <div class="flex-col flex-grow fullheight">
            <div class="scroll-container">
                <div class="maps">
                    <MapOverviewCard
                        v-for="(map, i) in filteredMaps"
                        :key="i"
                        :map="map"
                        :friendlyName="map.friendlyName"
                        @click="mapSelected(map)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
/**
 * TODO:
 * - Similar to online map browser
 * - Indicator whether map is installed or not
 * - Easy one click install button
 * - Demo map button that launches a simple offline game on the map
 */

import { Ref, ref, watch } from "vue";

import SearchBox from "@renderer/components/controls/SearchBox.vue";
import Select from "@renderer/components/controls/Select.vue";
import MapOverviewCard from "@renderer/components/maps/MapOverviewCard.vue";
import { MapData } from "@main/cache/model/map-data";
import { mapsStore } from "@renderer/store/maps.store";

type SortMethod = "Name" | "Size";

const sortMethods: SortMethod[] = ["Name", "Size"];
const sortMethod: Ref<SortMethod> = ref("Name");
const searchVal = ref("");
const emit = defineEmits<{
    (event: "map-selected", map: MapData): void;
}>();

const filteredMaps = ref<Array<MapData>>([]);

watch(
    () => mapsStore.installedMaps,
    () => {
        let maps: MapData[] = [];
        Object.assign(maps, mapsStore.installedMaps);
        if (searchVal.value.length > 0) {
            filteredMaps.value = maps.filter((map: MapData) => {
                map.friendlyName.toLowerCase().includes(searchVal.value.toLowerCase());
            });
        } else {
            switch (sortMethod.value) {
                case "Name":
                    maps.sort((a, b) => {
                        return a.friendlyName.localeCompare(b.friendlyName);
                    });
                    break;
                case "Size":
                    maps.sort((a, b) => {
                        return a.width * a.height - b.width * b.height;
                    });
            }
            filteredMaps.value = maps;
        }
    },
    { immediate: true, deep: true }
);

function mapSelected(map: MapData) {
    emit("map-selected", map);
}
</script>

<style lang="scss" scoped>
.maps {
    display: grid;
    grid-gap: 15px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    padding-right: 10px;
}
</style>
