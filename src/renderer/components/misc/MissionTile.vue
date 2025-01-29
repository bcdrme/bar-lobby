<template>
    <div class="mission-tile">
        <div class="title">
            {{ scenario.title }}
        </div>
        <div class="infos"></div>
        <svg class="line">
            <polyline :points="points"></polyline>
            <circle :cx="scenario.x" :cy="scenario.y" r="4" fill="#22c55e" outline="#22c55e"></circle>
        </svg>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
    scenario: {
        title: string;
        imagepath: string;
        x: number;
        y: number;
    };
    side: "left" | "right" | "bottom";
}>();

const origin = computed(() => {
    switch (props.side) {
        case "left":
            return "-4,50 -14,50";
        case "right":
            return "304,50 314,50";
        case "bottom":
            return "150,154 150,164 ";
        default:
            return "0 0";
    }
});

const points = computed(() => `${origin.value} ${props.scenario.x},${props.scenario.y}`);

// const backgroundImageCss = ref(`url('${props.scenario.imagepath)}')`);
</script>

<style lang="scss" scoped>
.line {
    position: fixed;
    overflow: visible;
    pointer-events: none;
    z-index: -1;
}

polyline {
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke: #22c55e;
}

circle {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke: #22c55e;
    animation: pulse 1s infinite ease-in-out;
}

@keyframes pulse {
    0%,
    100% {
        r: 10;
        stroke-width: 1;
    }
    50% {
        r: 6;
        stroke-width: 3;
    }
}

.mission-tile {
    height: 200px;
    width: 300px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    border: 4px solid rgba(0, 0, 0, 0.2);
    outline: 1px solid rgba(255, 255, 255, 0.1);
    outline-offset: -1px;
    overflow: hidden;
    transition: 0.1s all;
    will-change: outline;
    &:before {
        @extend .fullsize;
        background-image: url("/src/renderer/assets/images/modes/scavengers.webp");
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        transform: scale(1.1);
        transition: 0.1s all;
        filter: saturate(0) brightness(0.8) contrast(1);
        will-change: transform, filter;
    }
    &:after {
        @extend .fullsize;
        z-index: 1;
        background: linear-gradient(rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.9));
        outline: 1px solid rgba(255, 255, 255, 0.15);
        outline-offset: -1px;
        transition: 0.1s all;
    }
    &:hover,
    &.selected {
        &:before {
            transform: scale(1);
            filter: saturate(1) brightness(1.1) contrast(1.1);
        }
        outline: 1px solid #22c55e;
        box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
    }
}
.title {
    font-size: 24px;
    text-align: left;
    font-weight: 500;
    z-index: 2;
    padding: 10px;
    padding-bottom: 6px;
    width: 100%;
    transition: 0.1s all;
}
</style>
