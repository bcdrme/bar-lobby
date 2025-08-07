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
    bottom: 36px;
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

        .main-text {
            filter: drop-shadow(0 0 15px #ff4444);
            color: #ff6b6b;
        }

        .onclick-text {
            filter: drop-shadow(0 0 15px #ff4444);
            color: #ff6b6b;
        }
    }
}

.main-text {
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 1.5rem;
    filter: drop-shadow(0 0 10px #47bd5b);
    // position: relative;
    // z-index: 2;
    // transition: all 0.1s ease;
}

.onclick-text {
    font-size: 1rem;
    line-height: 1rem;
    font-weight: 500;
    filter: drop-shadow(0 0 10px #47bd5b);
    // position: relative;
    // z-index: 2;
    // transition: all 0.1s ease;
}
</style>
