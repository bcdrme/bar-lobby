<template>
    <div class="flex-col flex-center">
        <img v-if="rank" class="rank" :src="`/src/renderer/assets/images/icons/rank/${rank}.png`" />
        <img v-else class="rank" :src="`/src/renderer/assets/images/icons/rank/${1}.png`" />
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    rank?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}>();
</script>

<style lang="scss" scoped>
.rank {
    max-width: 100%;
}
</style>
