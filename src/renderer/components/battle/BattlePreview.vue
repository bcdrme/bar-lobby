<template>
    <div class="flex-col gap-md fullheight">
        <MapOverviewCard v-if="map" :map="map" :friendlyName="mapName" />
        <div class="teams scroll-container">
            <div v-if="isFFA">
                <div class="team-title">Players</div>
                <div class="contenders">
                    <template v-if="isBattle(battle)">
                        <template v-for="(contender, i) in battle.contenders" :key="`contender${i}`">
                            <BattlePreviewParticipant :contender="contender" />
                        </template>
                    </template>
                    <template v-else-if="isReplay(battle)">
                        <template v-for="(contender, i) in battle.contenders" :key="`contender${i}`">
                            <BattlePreviewParticipant :contender="contender" />
                            <Icon
                                v-if="isReplay(battle) && battle.winningTeamId === contender.allyTeamId && showSpoilers"
                                class="trophy"
                                :icon="trophyVariant"
                                height="18"
                            />
                        </template>
                    </template>
                </div>
            </div>
            <div v-for="[teamId, contenders] in teams" v-else :key="`team${teamId}`">
                <div class="team-title">
                    <div>Team {{ teamId + 1 }}</div>
                    <Icon
                        v-if="isReplay(battle) && battle.winningTeamId === teamId && showSpoilers"
                        class="trophy"
                        :icon="trophyVariant"
                        height="18"
                    />
                </div>
                <div class="contenders">
                    <BattlePreviewParticipant
                        v-for="(contender, contenderIndex) in contenders"
                        :key="`contender${contenderIndex}`"
                        :contender="contender"
                    />
                </div>
            </div>
            <div v-if="isReplay(battle) ? battle.spectators.length : battle.spectators.length">
                <div class="team-title">Spectators</div>
                <div class="contenders">
                    <BattlePreviewParticipant
                        v-for="(spectator, spectatorIndex) in isReplay(battle) ? battle.spectators : battle.spectators"
                        :key="`spectator${spectatorIndex}`"
                        :contender="spectator"
                    />
                </div>
            </div>
        </div>
        <div class="flex-row flex-bottom gap-md">
            <slot name="actions" :battle="battle"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import trophyVariant from "@iconify-icons/mdi/trophy-variant";
import { computed, ComputedRef } from "vue";

import BattlePreviewParticipant from "@renderer/components/battle/BattlePreviewParticipant.vue";
import MapOverviewCard from "@renderer/components/maps/MapOverviewCard.vue";
import { Replay } from "@main/content/replays/replay";
import { StartBox, StartPosType } from "@main/game/battle/battle-types";
import { Battle, isBattle } from "@renderer/game/abstract-battle";
import { db } from "@renderer/store/db";
import { computedAsync } from "@vueuse/core";

const props = defineProps<{
    battle: Battle | Replay;
    showSpoilers?: boolean;
}>();

const isReplay = (battle: Battle | Replay) => {
    return true;
};

const map = computedAsync(async () => {
    const allMaps = await db.maps.toArray();
    return allMaps.at(0);
    // return props.battle instanceof Battle
    //     ? await window.maps.getMapByScriptName(props.battle.battleOptions.map)
    //     : await window.maps.getMapByScriptName(props.battle.mapScriptName);
});

const mapName = computed(() => {
    return "";
    // return props.battle instanceof Battle ? props.battle.battleOptions.map : props.battle.mapScriptName;
});

const gameVersion = computed(
    () => ""
    //(props.battle instanceof Battle ? props.battle.battleOptions.gameVersion : props.battle.gameVersion)
);

const engineVersion = computed(
    () => ""
    // props.battle instanceof Battle ? props.battle.battleOptions.engineVersion : props.battle.engineVersion
);

const isFFA = computed(() => {
    return false;
    // if (props.battle instanceof Battle) {
    //     // TODO: get preset from spads/server
    //     return false;
    // } else {
    //     return props.battle.preset === "ffa";
    // }
});

const teams = computed(() => {
    return [];
    // if (isBattle(props.battle)) {
    //     const teams = groupBy(props.battle.contenders.value, (contender) =>
    //         isUser(contender) ? contender.battleStatus.teamId : contender.teamId
    //     );
    //     const sortedTeams = new Map([...teams.entries()].sort());
    //     return sortedTeams;
    // } else {
    //     const teams = groupBy(props.battle.contenders, (contender) => contender.allyTeamId);
    //     const sortedTeams = new Map([...teams.entries()].sort());
    //     return sortedTeams;
    //     // const orderedTeams = new Map<number, (User | Bot)[]>();
    //     // for (const contender of props.battle.contenders) {
    //     //     if (!orderedTeams[contender.allyTeamId]) {
    //     //         orderedTeams[contender.allyTeamId] = [];
    //     //     }
    //     //     orderedTeams[contender.allyTeamId].push(contender);
    //     // }
    //     // return orderedTeams;
    // }
});

const startPosType: ComputedRef<StartPosType> = computed(() => {
    if (isBattle(props.battle)) {
        return props.battle.battleOptions.startPosType;
    } else {
        return parseInt(props.battle.battleSettings.startpostype);
    }
});

const startBoxes = computed(() => {
    if (startPosType.value !== StartPosType.Boxes) {
        return undefined;
    }
    const startBoxes: Record<number, StartBox | undefined> = {};
    // teams.value.forEach((team) => {
    //     if (team.startBox) {
    //         startBoxes[team.allyTeamId] = {
    //             xPercent: team.startBox.left,
    //             yPercent: team.startBox.top,
    //             widthPercent: team.startBox.right - team.startBox.left,
    //             heightPercent: team.startBox.bottom - team.startBox.top,
    //         };
    //     }
    // });
    return startBoxes;
});

const startPositions = computed(() => {
    // const contenders = isBattle(props.battle) ? props.battle.contenders.value : props.battle.contenders;
    // return contenders.map((contender) => {
    //     if (!contender.startPos) {
    //         return;
    //     }
    //     return {
    //         position: contender.startPos,
    //         rgbColor: contender.rgbColor,
    //     };
    // });
});
</script>

<style lang="scss" scoped>
.teams {
    gap: 5px;
}
.team-title {
    display: flex;
    flex-direction: row;
    gap: 10px;
    font-weight: 500;
    margin-bottom: 3px;
}
.contenders {
    display: flex;
    flex-direction: row;
    gap: 4px;
    flex-wrap: wrap;
}
.inline-icon {
    margin-top: 2px;
}
.trophy {
    color: #ffbc00;
    display: flex;
    align-self: center;
    margin-bottom: 1px;
}
.check {
    color: rgb(94, 230, 16);
}
.cross {
    color: rgb(223, 35, 35);
}
</style>
