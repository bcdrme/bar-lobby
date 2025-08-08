<template>
    <div class="base-indicator">
        <span class="icon">
            <slot name="icon" />
        </span>
        <div class="text">
            <span class="main-text">
                <slot name="main-text" />
            </span>
            <span class="onclick-text">
                <slot name="onclick-text" />
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.base-indicator {
    position: fixed;
    bottom: 8px;
    left: 96px;
    display: flex;
    align-items: center;
    cursor: pointer;
    // transition: all 0.2s ease;
    // &:hover {
    //     transform: scale(1.03);
    // }
}

.text {
    display: flex;
    flex-direction: column;
    text-transform: uppercase;
    font-family: Rajdhani;
    padding: 16px;
    position: relative;
    overflow: hidden;

    // Snappy shine effect on text only
    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%);
        transition: left 0.3s ease;
        pointer-events: none;
        z-index: 1;
    }

    .base-indicator:hover & {
        &::before {
            left: 100%;
        }

        transform: scale(0.99);
        animation: glitchin 0.3s infinite ease;

        .main-text {
            filter: drop-shadow(0 0 8px #ff4444) blur(0.4px);
            text-shadow: 0 0 3px #ff4444;
            color: #ff6b6b;
        }

        .onclick-text {
            filter: drop-shadow(0 0 8px #ff4444) blur(0.4px);
            text-shadow: 0 0 3px #ff4444;
            color: #ffffff;
        }
    }
}

@keyframes glitchin {
    0% {
        transform: none;
        filter: none;
    }
    6% {
        transform: skewX(3deg) skewY(1deg) translate(-1px, 0.5px) scale(1.005);
        filter: blur(0.2px) brightness(1.08);
    }
    8% {
        transform: skewX(-2deg) skewY(-1deg) translate(1px, -0.5px) scale(0.995);
        filter: blur(0.3px) brightness(0.97);
    }
    10% {
        transform: none;
        filter: none;
    }
    18% {
        transform: skewX(2deg) skewY(0.5deg) translate(-0.5px, 1px) scale(1.01);
        filter: blur(0.1px) brightness(1.04);
    }
    20% {
        transform: none;
        filter: none;
    }
    32% {
        transform: translate(-1px, 1px) scale(1.005);
        filter: contrast(1.05) brightness(1.03);
    }
    34% {
        transform: skewX(-3deg) skewY(1deg) translate(1px, -1px) scale(0.99);
        filter: blur(0.2px) brightness(1.07);
    }
    36% {
        transform: none;
        filter: none;
    }
    60% {
        transform: skewX(1deg) skewY(-0.5deg) translate(0.5px, -0.5px) scale(1.005);
        filter: blur(0.1px) brightness(1.03);
    }
    62% {
        transform: none;
        filter: none;
    }
    80% {
        transform: skewX(-2deg) skewY(1deg) translate(-1px, 1px) scale(1.005);
        filter: blur(0.15px) brightness(1.05);
    }
    82% {
        transform: none;
        filter: none;
    }
    100% {
        transform: none;
        filter: none;
    }
}

.main-text {
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 1.5rem;
    filter: drop-shadow(0 0 8px #47bd5b) blur(0.4px);
    text-shadow: 0 0 3px #47bd5b;
}

.onclick-text {
    font-size: 1rem;
    line-height: 1rem;
    font-weight: 500;
    color: #61a76b;
    filter: drop-shadow(0 0 6px #47bd5b) blur(0.3px);
    text-shadow: 0 0 3px #47bd5b;
    letter-spacing: 3px;
}
</style>
