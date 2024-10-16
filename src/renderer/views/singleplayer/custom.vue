<route lang="json5">
{ meta: { title: "Custom", order: 2, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <Panel class="flex-grow">
            <div class="flex-col flex-grow">
                <BattleComponent v-if="battle" :battle="battle" :me="me" />
                <div v-else>Error: no offline battle set</div>
            </div>
        </Panel>
    </div>
</template>

<script lang="ts" setup>
import { onUnmounted } from "vue";

import BattleComponent from "@renderer/components/battle/BattleComponent.vue";
import { Battle } from "@renderer/game/battle";
import Panel from "@renderer/components/common/Panel.vue";

const battle = new Battle();
const me = api.session.offlineUser;

onUnmounted(() => {
    //TODO
    // battle store reset
});
</script>

<style lang="scss" scoped></style>
