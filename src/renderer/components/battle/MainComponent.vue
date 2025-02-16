<template>
    <div class="container">
        <button class="ranked" @click="drawerStore.state = 'ranked'">Ranked</button>
        <button class="custom" @click="drawerStore.state = 'custom'">Custom</button>
        <button class="back" @click="drawerStore.state = 'main'">Main</button>
    </div>
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
