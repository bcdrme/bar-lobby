<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Scenarios", order: 1, transition: { name: "slide-left" } } }
</route>

<template>
    <MainScreenLayout>
        <template #title>
            {{ t("lobby.singleplayer.scenarios.title") }}
        </template>
        <template #subtitle>
            {{ t("lobby.singleplayer.scenarios.description") }}
        </template>
        <template #content>
            <div class="main-section-container">
                <div class="scenarios-wrapper">
                    <div class="scenarios-navigation">
                        <div class="scenarios" :key="currentPage">
                            <ScenarioTile
                                v-for="scenario in paginatedScenarios"
                                :key="scenario.title"
                                :scenario="scenario"
                                :class="{ selected: selectedScenario.scenarioid === scenario.scenarioid }"
                                @click="selectedScenario = scenario"
                            />
                        </div>
                        <button class="page-arrow side-arrow next" @click="nextPage" v-if="totalPages > 1">›</button>
                    </div>
                    <div class="page-dots-container" v-if="totalPages > 1">
                        <div class="page-dots">
                            <div
                                v-for="(_, index) in totalPages"
                                :key="index"
                                class="page-dot"
                                :class="{ active: currentPage === index }"
                                @click="goToPage(index)"
                            ></div>
                        </div>
                    </div>
                </div>
                <Panel class="scenarios-main-panel" noPadding>
                    <div class="scenario-preview">
                        <h4>{{ selectedScenario.title }}</h4>
                        <div>
                            <Markdown :source="selectedScenario.summary" />
                        </div>
                        <div>
                            <Markdown :source="selectedScenario.briefing" />
                        </div>
                        <div class="gridform">
                            <div>{{ t("lobby.singleplayer.scenarios.victoryCondition") }}</div>
                            <div>{{ selectedScenario.victorycondition }}</div>
                            <div>{{ t("lobby.singleplayer.scenarios.loseCondition") }}</div>
                            <div>{{ selectedScenario.losscondition }}</div>
                        </div>
                    </div>
                </Panel>
            </div>
        </template>
        <template #actions>
            <!-- <DownloadContentButton
                    v-if="map"
                    :map="map"
                    class="green"
                    :disabled="gameStore.status !== GameStatus.CLOSED"
                    @click="launch"
                    >{{ t("lobby.singleplayer.scenarios.launch") }}</DownloadContentButton
                >
                <Button v-else class="green" disabled>{{ t("lobby.singleplayer.scenarios.launch") }}</Button> -->
            <!-- <MainButton>Accept</MainButton>
            <MainButton variant="neutral">Cancel</MainButton>
            <MainButton variant="orange">Join Party</MainButton> -->
            <MainButton class="launch-button">
                <template #default>
                    {{ t("lobby.singleplayer.scenarios.launch") }}
                </template>
            </MainButton>
            <div class="faction-select">
                <Select
                    v-model="selectedFaction"
                    :label="t('lobby.singleplayer.scenarios.faction')"
                    :options="factions"
                    :style="{ height: '48px' }"
                />
            </div>
            <div class="difficulty-select">
                <Select
                    v-model="selectedDifficulty"
                    :label="t('lobby.singleplayer.scenarios.difficulty')"
                    :options="difficulties"
                    optionLabel="name"
                    :style="{ height: '48px' }"
                />
            </div>
        </template>
    </MainScreenLayout>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import Button from "@renderer/components/controls/Button.vue";
import Select from "@renderer/components/controls/Select.vue";
import ScenarioTile from "@renderer/components/misc/ScenarioTile.vue";
import { Scenario } from "@main/content/game/scenario";
import { LATEST_GAME_VERSION } from "@main/config/default-versions";
import Panel from "@renderer/components/common/Panel.vue";
import { db } from "@renderer/store/db";
import { MapDownloadData } from "@main/content/maps/map-data";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import Markdown from "@renderer/components/misc/Markdown.vue";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import { GameStatus, gameStore } from "@renderer/store/game.store";

import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();

import { enginesStore } from "@renderer/store/engine.store";
import MainButton from "@renderer/components/controls/MainButton.vue";
import MainScreenLayout from "@renderer/components/layout/MainScreenLayout.vue";

const gameVersion = gameStore?.selectedGameVersion?.gameVersion;
const loadedScenarios = gameVersion ? await window.game.getScenarios(gameVersion) : [];
const scenarios = ref<Scenario[]>(loadedScenarios);
const selectedScenario = ref<Scenario>(scenarios.value[0]);

// Pagination logic
const SCENARIOS_PER_PAGE = 4;
const currentPage = ref(0);
const slideDirection = ref("slide-right");

const totalPages = computed(() => Math.ceil(scenarios.value.length / SCENARIOS_PER_PAGE));

const paginatedScenarios = computed(() => {
    const start = currentPage.value * SCENARIOS_PER_PAGE;
    const end = start + SCENARIOS_PER_PAGE;
    return scenarios.value.slice(start, end);
});

const nextPage = () => {
    slideDirection.value = "slide-left";
    // Loop to first page if at the end
    if (currentPage.value >= totalPages.value - 1) {
        currentPage.value = 0;
    } else {
        currentPage.value++;
    }
    // Select first scenario of new page if current selection is not visible
    if (!paginatedScenarios.value.some((s) => s.scenarioid === selectedScenario.value?.scenarioid)) {
        selectedScenario.value = paginatedScenarios.value[0];
    }
};

const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages.value) {
        // Determine slide direction based on page movement
        slideDirection.value = pageIndex > currentPage.value ? "slide-left" : "slide-right";
        currentPage.value = pageIndex;
        // Select first scenario of new page if current selection is not visible
        if (!paginatedScenarios.value.some((s) => s.scenarioid === selectedScenario.value?.scenarioid)) {
            selectedScenario.value = paginatedScenarios.value[0];
        }
    }
};

const map = useDexieLiveQueryWithDeps([selectedScenario], async () => {
    let selected = selectedScenario.value;
    if (!selected) return;

    const [live, nonLive] = await Promise.all([db.maps.get(selected.mapfilename), db.nonLiveMaps.get(selected.mapfilename)]);

    let map = live ?? nonLive;

    if (!map) {
        map = {
            springName: selected.mapfilename,
            isDownloading: false,
            isInstalled: false,
        } satisfies MapDownloadData;
    }

    return map;
});

const difficulties = computed(() => selectedScenario.value.difficulties);
const selectedDifficulty = ref(difficulties.value.find((dif) => dif.name === selectedScenario.value.defaultdifficulty));

const factions = computed(() => selectedScenario.value.allowedsides);
const selectedFaction = ref(factions.value[0]);

watch(
    () => gameStore.selectedGameVersion?.gameVersion,
    async (selectedVersion) => {
        const loadedScenarios = selectedVersion ? await window.game.getScenarios(selectedVersion) : [];
        scenarios.value = loadedScenarios;
        currentPage.value = 0; // Reset to first page
        selectedScenario.value = scenarios.value[0];
    }
);

watch(selectedScenario, (newScenario) => {
    selectedDifficulty.value = difficulties.value.find((dif) => dif.name === newScenario.defaultdifficulty);
    selectedFaction.value = factions.value[0] ?? "Armada";

    // Ensure the selected scenario is on the current page
    const scenarioIndex = scenarios.value.findIndex((s) => s.scenarioid === newScenario.scenarioid);
    if (scenarioIndex !== -1) {
        const requiredPage = Math.floor(scenarioIndex / SCENARIOS_PER_PAGE);
        if (currentPage.value !== requiredPage) {
            currentPage.value = requiredPage;
        }
    }
});

async function launch() {
    const scenarioOptions = {
        ...selectedScenario.value.scenariooptions,
        version: selectedScenario.value.version,
        difficulty: selectedDifficulty.value,
    };
    const scenarioOptionsStr = btoa(JSON.stringify(scenarioOptions));

    let restrictionsStr = "";
    let restrictionCount = 0;
    for (const [unitId, limit] of Object.entries(selectedScenario.value.unitlimits)) {
        restrictionsStr += `unit${restrictionCount}=${unitId};\nlimit${restrictionCount}=${limit};\n`;
        restrictionCount++;
    }

    const script = selectedScenario.value.startscript
        .replaceAll("__SCENARIOOPTIONS__", scenarioOptionsStr)
        //TODO replace with online name when implemented
        .replaceAll("__PLAYERNAME__", "Player")
        .replaceAll("__BARVERSION__", LATEST_GAME_VERSION)
        .replaceAll("__MAPNAME__", selectedScenario.value.mapfilename)
        .replaceAll("__PLAYERSIDE__", selectedFaction.value)
        .replaceAll("__ENEMYHANDICAP__", selectedDifficulty.value?.enemyhandicap?.toString() ?? "0")
        .replaceAll("__PLAYERHANDICAP__", selectedDifficulty.value?.playerhandicap?.toString() ?? "0")
        .replaceAll("__RESTRICTEDUNITS__", restrictionsStr)
        .replaceAll("__NUMRESTRICTIONS__", restrictionCount.toString());

    if (!enginesStore.selectedEngineVersion) {
        throw new Error("No engine version selected");
    }
    await window.game.launchScript(script, LATEST_GAME_VERSION, enginesStore.selectedEngineVersion.id);
}
</script>

<style lang="scss" scoped>
.main-section-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 16px; // Reduced gap
    // overflow: visible;
    justify-content: space-evenly;
}

.scenarios-wrapper {
    display: flex;
    flex-direction: column;
}

.scenarios-navigation {
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
}

.scenarios-container-animated {
    flex: 1;
    overflow: hidden;
    position: relative;
}

.scenarios-main-panel {
    width: 1352px;
    padding: 8px;
    height: 300px;
}

.scenarios {
    overflow: visible;
    width: 100%;
    display: grid;
    grid-gap: 12px; // Reduced gap
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); // Smaller tiles
}

.page-arrow {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9));
    backdrop-filter: blur(10px) brightness(0.7) saturate(2);
    border: 2px solid #22c55e;
    color: #22c55e;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
        0 0 15px rgba(34, 197, 94, 0.3),
        inset 0 0 20px rgba(255, 255, 255, 0.05);
    text-shadow: 0 0 10px rgba(34, 197, 94, 0.8);

    &:hover:not(:disabled) {
        background: linear-gradient(rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.3));
        border-color: #16a34a;
        color: #ffffff;
        box-shadow:
            0 0 25px rgba(34, 197, 94, 0.6),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        border-color: rgba(34, 197, 94, 0.3);
        color: rgba(34, 197, 94, 0.3);
        box-shadow: none;
    }

    &.side-arrow {
        position: relative;
        z-index: 10;
        flex-shrink: 0;
    }
}

.page-dots-container {
    display: flex;
    justify-content: center;
    padding: 12px 0; // Reduced padding
}

.page-dots {
    display: flex;
    gap: 10px; // Reduced gap
    align-items: center;

    .page-dot {
        width: 10px; // Smaller dots
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(34, 197, 94, 0.4);
            border-color: rgba(34, 197, 94, 0.6);
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }

        &.active {
            background: #22c55e;
            border-color: #16a34a;
            box-shadow:
                0 0 12px rgba(34, 197, 94, 0.8),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            transform: scale(1.15); // Slightly smaller scaling
        }
    }
}

.scenario-preview {
    width: 100%;
    height: 100%;
    background-color: black;
}

.launch-button {
    width: 300px;
}

.faction-select {
    width: 300px;
}

.difficulty-select {
    width: 300px;
}
</style>
