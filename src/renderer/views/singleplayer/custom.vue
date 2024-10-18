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
import { onUnmounted } from "vue";

import BattleComponent from "@renderer/components/battle/BattleComponent.vue";
import Panel from "@renderer/components/common/Panel.vue";
import { resetToDefaultBattle } from "@renderer/store/battle.store";

// do we really do this?
onUnmounted(() => {
    resetToDefaultBattle();
});
</script>

<style lang="scss" scoped></style>
