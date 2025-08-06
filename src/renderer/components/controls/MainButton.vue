<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <button class="main-button" @click="$emit('click')">
        <slot />
    </button>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.main-button {
    height: 48px;
    font-family: Rajdhani;
    font-weight: bold;
    font-size: 1.3rem;
    line-height: 1rem;
    padding: 0 32px;
    color: #fff;
    background: radial-gradient(circle at 50% 50%, #34c65a, #1f7d3d);
    border-radius: 1px;
    border: 3px solid #289951;
    box-shadow:
        inset 1px -1px 2px #1111118e,
        inset -1px 1px 2px #1111118e,
        0 0 15px rgba(34, 197, 94, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    cursor: pointer;
    text-transform: uppercase;
    position: relative;
    transition:
        transform 0.1s ease-out,
        box-shadow 0.1s ease-out,
        border-color 0.1s ease-out;
}

.main-button:hover:not(:disabled) {
    box-shadow:
        inset 1px -1px 2px #1111118e,
        inset -1px 1px 2px #1111118e,
        0 0 25px rgba(34, 197, 94, 0.6);
    border: 3px solid #2ead5d;
}

.main-button:hover::before {
    box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
}

.main-button:disabled {
    filter: brightness(0.5);
}
</style>
