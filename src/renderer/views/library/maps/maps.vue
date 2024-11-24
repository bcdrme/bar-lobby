<route lang="json5">
{ meta: { title: "Maps", order: 1, transition: { name: "slide-left" }, offine: true } }
</route>

<template>
    <div class="view">
        <div class="maps-container">
            <div class="view-title">
                <h1>Maps</h1>
            </div>
            <div class="layout">
                <Panel class="map-filters">
                    <Button></Button>
                    <Button></Button>
                    <Button></Button>
                    <Button></Button>
                    <Button></Button>
                    <Button></Button>
                    <Checkbox></Checkbox>
                    <Checkbox></Checkbox>
                    <Checkbox></Checkbox>
                </Panel>
                <Panel class="flex-grow">
                    <div class="flex-col fullheight">
                        <MapListComponent @map-selected="onMapSelected" />
                    </div>
                </Panel>
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
 * - Searchable
 * - Sortable
 * - Filterable
 * - Paginated
 */

import { MapData } from "@main/content/maps/map-data";
import Panel from "@renderer/components/common/Panel.vue";
import Button from "@renderer/components/controls/Button.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import MapListComponent from "@renderer/components/maps/MapListComponent.vue";
import { useRouter } from "vue-router";

const router = useRouter();

async function onMapSelected(map: MapData) {
    await router.push(`/library/maps/${map.springName}`);
}
</script>

<style lang="scss" scoped>
.maps-container {
    display: flex;
    flex-direction: column;
    align-self: center;
    width: 1600px;
    height: 100%;
    padding-left: 40px;
}

.layout {
    display: flex;
    flex-direction: row;
    gap: 20px;
    height: 100%;
}

.map-filters {
    width: 300px;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 20px;
}
</style>
