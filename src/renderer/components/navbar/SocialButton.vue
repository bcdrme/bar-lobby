<template>
    <Button class="friends" :class="{ active: usersStore.isFriendListOpen }" @click="usersActions.toggleFriendList()">
        <div class="flex-row flex-center gap-sm">
            <Icon :icon="accountMultiple" :height="20" />
            <div>Friends</div>
        </div>
    </Button>
    <Button class="icon" v-tooltip.bottom="'Find User'">
        <div class="flex-row flex-center gap-sm">
            <Icon :icon="magnify" :height="20" />
        </div>
    </Button>
    <Button class="icon" v-tooltip.bottom="'Add Friend'">
        <div class="flex-row flex-center gap-sm">
            <Icon :icon="accountPlus" :height="20" />
        </div>
    </Button>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import accountMultiple from "@iconify-icons/mdi/account-multiple";
import accountPlus from "@iconify-icons/mdi/account-plus";
import magnify from "@iconify-icons/mdi/magnify";
import Button from "@renderer/components/controls/Button.vue";
import { usersActions, usersStore } from "@renderer/store/users.store";
</script>

<style lang="scss" scoped>
.friends {
    text-transform: unset;
    width: 220px;
}

.icon {
    width: 40px;
}

.button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    flex-grow: 0;
    :deep(> button) {
        padding: 0 20px;
    }
    &:hover,
    &.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.05);
        box-shadow:
            inset 0 2px 10px rgba(0, 0, 0, 0.5),
            0 1px 0 rgba(255, 255, 255, 0.2);
    }
}
</style>
