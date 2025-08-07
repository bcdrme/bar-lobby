<template>
    <BaseIndicator>
        <template #icon>
            <span class="matchmaking-icon">
                <Icon :icon="crosshairs" width="64" />
            </span>
        </template>
        <template #main-text>
            Matchmaking - In queue<span class="animated-dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </span>
        </template>
        <template #onclick-text>Click to cancel</template>
    </BaseIndicator>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import crosshairs from "@iconify-icons/mdi/crosshairs";
import BaseIndicator from "@renderer/components/indicators/BaseIndicator.vue";
</script>

<style lang="scss" scoped>
.matchmaking-icon {
    display: inline-block;
    animation: matchmakingSpin 3s infinite ease-in-out;
    transform-origin: center;
    width: 64px;
    height: 64px;
    color: #7ee990;
    filter: drop-shadow(0 0 10px #47bd5b) blur(1px);
}

@keyframes matchmakingSpin {
    0% {
        transform: rotate(0deg) scale(1);
        opacity: 1;
    }
    25% {
        transform: rotate(90deg) scale(1.1);
        opacity: 0.8;
    }
    50% {
        transform: rotate(180deg) scale(1);
        opacity: 1;
    }
    75% {
        transform: rotate(270deg) scale(1.1);
        opacity: 0.8;
    }
    100% {
        transform: rotate(360deg) scale(1);
        opacity: 1;
    }
}

.animated-dots {
    .dot {
        animation: dotPulse 1.5s infinite;

        &:nth-child(1) {
            animation-delay: 0s;
        }

        &:nth-child(2) {
            animation-delay: 0.3s;
        }

        &:nth-child(3) {
            animation-delay: 0.6s;
        }
    }
}

@keyframes dotPulse {
    0%,
    60%,
    100% {
        opacity: 0.3;
        transform: scale(1);
    }
    30% {
        opacity: 1;
        transform: scale(1.2);
    }
}
</style>
