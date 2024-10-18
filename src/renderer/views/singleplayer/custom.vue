<route lang="json5">
{ meta: { title: "Custom", order: 2, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <Panel class="flex-grow">
            <div class="flex-col flex-grow">
                <BattleComponent />
            </div>
        </Panel>
    </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onUnmounted } from "vue";

import BattleComponent from "@renderer/components/battle/BattleComponent.vue";
import Panel from "@renderer/components/common/Panel.vue";
import { resetToDefaultBattle } from "@renderer/store/battle.store";
import { me } from "@renderer/store/me.store";
import { Faction } from "@main/game/battle/battle-types";

onBeforeMount(() => {
    me.battleStatus = {
        teamId: 0,
        ready: false,
        sync: {
            engine: 0,
            game: 0,
            map: 0,
        },
        inBattle: false,
        faction: Faction.Cortex,
        away: false,
        participantId: 0,
        battleId: 0,
    };
});

// do we really do this?
onUnmounted(() => {
    resetToDefaultBattle();
});
</script>

<style lang="scss" scoped></style>
