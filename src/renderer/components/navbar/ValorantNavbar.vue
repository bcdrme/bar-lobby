<template>
    <nav class="navbar">
        <!-- Top row with play button -->
        <div class="play-container">
            <button class="side-button">
                <span>home</span>
            </button>
            <button class="side-button">
                <span>profile</span>
            </button>
            <button class="main-button">
                <span>Play</span>
            </button>
            <button class="side-button">
                <span>arcade</span>
            </button>
            <button class="side-button">
                <span>watch</span>
            </button>
        </div>

        <!-- Separator line -->
        <div class="separator"></div>

        <!-- Bottom row with menu items -->
        <div class="menu-container">
            <button
                v-for="item in menuItems"
                :key="item"
                class="menu-item"
                :class="{ active: activeItem === item }"
                @click="activeItem = item"
            >
                {{ item }}
                <div class="hover-indicator"></div>
                <div v-if="activeItem === item" class="active-indicator"></div>
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";

const menuItems = ["DUEL", "SMALL TEAM", "TEAM", "FFA", "SCAVENGERS", "RAPTORS", "CUSTOM GAME"] as const;

const activeItem = ref<(typeof menuItems)[number]>("TEAM");
</script>

<style scoped lang="scss">
$accentColor: #22c55e;

.navbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 1000px;
}

.play-container {
    margin-bottom: 1rem;
    width: 100%;
    background: linear-gradient(to left, transparent, rgba(0, 0, 0, 0.357), transparent);
    display: flex;
    justify-content: center;
}

.main-button {
    opacity: 0.8;
    align-self: center;
    width: 240px;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 38px;
    color: #fff;
    border: none;
    // box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    filter: saturate(0.1);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.main-button:hover {
    opacity: 1;
}

.main-button::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%) scale(0);
    border-radius: 50%;
    transition: transform 0.4s ease;
}

.main-button:hover::before {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.side-button {
    opacity: 0.8;
    width: 120px;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 20px;
    color: #fff;
    border: none;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    filter: saturate(0.2);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.side-button:hover {
    opacity: 1;
    box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
}

.side-button::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%) scale(0);
    border-radius: 50%;
    transition: transform 0.4s ease;
}

.side-button:hover::before {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.separator {
    width: 100%;
    height: 1px;
    background-color: rgba(white, 0.1);
    margin-bottom: 0.5rem;
}

.menu-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
}

.menu-item {
    position: relative;
    background: none;
    border: none;
    color: #999;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.05em;
    padding: 0.25rem 0;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: white;

        .hover-indicator {
            transform: scaleX(1);
        }
    }

    &.active {
        color: white;

        .hover-indicator {
            background-color: $accentColor;
        }
    }
}

.hover-indicator {
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: white;
    transform: scaleX(0);
    transition: transform 0.2s;
    transform-origin: center;
}

.active-indicator {
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid $accentColor;
}
</style>
