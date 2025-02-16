<template>
    <div class="container"></div>
</template>

<script lang="ts" setup>
import { drawerStore } from "@renderer/store/drawer.store";
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
}

.custom {
    padding: 8px 16px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.ranked {
    padding: 8px 16px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.back {
    padding: 8px 16px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>
