<template>
    <div class="user">
        <div class="slot empty">
            <div class="plus">+</div>
        </div>
        <div class="hint">Invite any user to party by right-clicking their name.</div>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.user {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 10px;
    align-items: center;
    .slot {
        width: 40px;
        height: 40px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
    }
    .hint {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.3);
        font-style: italic;
    }
}
</style>
