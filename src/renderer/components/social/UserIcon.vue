<template>
    <div class="user-icon" :style="{ backgroundColor: user.status === 'offline' ? '' : backgroundColor }">
        {{ firstLetter }}
    </div>
</template>

<script setup lang="ts">
import { User } from "@main/model/user";
import { computed } from "vue";

const props = defineProps<{
    user: User;
}>();

const firstLetter = computed(() => {
    return props.user?.displayName?.charAt(0)?.toUpperCase() || "?";
});

const backgroundColor = computed(() => {
    const displayName = props.user?.displayName || "";
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
        const char = displayName.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const hue = Math.abs(hash) % 360;
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash) % 15); // 45-60%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
});
</script>

<style scoped>
.user-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
