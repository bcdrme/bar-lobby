<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <button class="main-button" :class="variant" @click="$emit('click')">
        <slot />
    </button>
</template>

<script lang="ts" setup>
interface Props {
    variant?: "primary" | "neutral" | "orange";
}

withDefaults(defineProps<Props>(), {
    variant: "primary",
});
</script>

<style lang="scss" scoped>
// Color variables for different button variants
$primary-color: #34c65a;
$primary-color-dark: #1f7d3d;
$primary-border: #289951;
$primary-border-hover: #2ead5d;
$primary-glow: rgba(34, 197, 94, 0.4);
$primary-glow-hover: rgba(34, 197, 94, 0.6);

$neutral-color: #6b7280;
$neutral-color-dark: #374151;
$neutral-border: #4b5563;
$neutral-border-hover: #6b7280;
$neutral-glow: rgba(107, 114, 128, 0.4);
$neutral-glow-hover: rgba(107, 114, 128, 0.6);

$orange-color: #f97316;
$orange-color-dark: #c2410c;
$orange-border: #ea580c;
$orange-border-hover: #f97316;
$orange-glow: rgba(249, 115, 22, 0.4);
$orange-glow-hover: rgba(249, 115, 22, 0.6);

.main-button {
    height: 48px;
    font-family: Rajdhani;
    font-weight: bold;
    font-size: 1.3rem;
    line-height: 1rem;
    padding: 0 32px;
    color: #fff;
    border-radius: 1px;
    border: 3px solid;
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

    // Primary variant (default green)
    &.primary {
        background: radial-gradient(circle at 50% 50%, $primary-color, $primary-color-dark);
        border-color: $primary-border;
        box-shadow:
            inset 1px -1px 2px #1111118e,
            inset -1px 1px 2px #1111118e,
            0 0 15px $primary-glow;

        &:hover:not(:disabled) {
            box-shadow:
                inset 1px -1px 2px #1111118e,
                inset -1px 1px 2px #1111118e,
                0 0 25px $primary-glow-hover;
            border-color: $primary-border-hover;
        }
    }

    // Neutral variant (gray)
    &.neutral {
        background: radial-gradient(circle at 50% 50%, $neutral-color, $neutral-color-dark);
        border-color: $neutral-border;
        box-shadow:
            inset 1px -1px 2px #1111118e,
            inset -1px 1px 2px #1111118e,
            0 0 15px $neutral-glow;

        &:hover:not(:disabled) {
            box-shadow:
                inset 1px -1px 2px #1111118e,
                inset -1px 1px 2px #1111118e,
                0 0 25px $neutral-glow-hover;
            border-color: $neutral-border-hover;
        }
    }

    // Orange variant
    &.orange {
        background: radial-gradient(circle at 50% 50%, $orange-color, $orange-color-dark);
        border-color: $orange-border;
        box-shadow:
            inset 1px -1px 2px #1111118e,
            inset -1px 1px 2px #1111118e,
            0 0 15px $orange-glow;

        &:hover:not(:disabled) {
            box-shadow:
                inset 1px -1px 2px #1111118e,
                inset -1px 1px 2px #1111118e,
                0 0 25px $orange-glow-hover;
            border-color: $orange-border-hover;
        }
    }

    &:hover::before {
        box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
    }

    &:disabled {
        filter: brightness(0.5);
    }
}
</style>
