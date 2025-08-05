<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <!-- Direct Messages Component -->
    <DMComponent class="dm-component" />

    <!-- Party Chat Component -->
    <!-- <div class="party-chat-component">
        <PartyChatComponent />
    </div> -->
</template>

<script lang="ts" setup>
import DMComponent from "./DMComponent.vue";
import PartyChatComponent from "./PartyChatComponent.vue";
</script>

<style lang="scss" scoped>
.dm-component {
    position: absolute;
    right: 96px;
    bottom: 20px;
}

@media (min-aspect-ratio: 16/9) {
    .dm-component {
        right: 350px;
    }
}

.party-chat-component {
    position: absolute;
    left: 500px;
    bottom: 20px;
}
</style>
