<template>
    <div class="user">
        <div class="slot empty">
            <div class="plus"></div>
        </div>
        <div class="username">smile</div>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.user {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 8px;
    align-items: center;
    .slot {
        width: 40px;
        height: 40px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(255, 255, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .username {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.5);
    }
}
</style>
