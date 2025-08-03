<template>
    <div class="user" @contextmenu="onRightClick">
        <div class="slot empty"><UserIcon :user="props.user" /></div>
        <div class="flag"><Flag :countryCode="props.user.countryCode" /></div>
        <div class="username">{{ props.user.username }}</div>
        <!-- <div class="status">{{ props.user.status }}</div> -->
        <ContextMenu ref="menu" :model="actions" />
    </div>
</template>

<script lang="ts" setup>
import { User } from "@main/model/user";
import Flag from "@renderer/components/misc/Flag.vue";
import UserIcon from "@renderer/components/social/UserIcon.vue";
import { ref, computed } from "vue";
import ContextMenu from "@renderer/components/common/ContextMenu.vue";

const props = defineProps<{
    user: User;
}>();

const menu = ref<InstanceType<typeof ContextMenu>>();

const actions = computed(() => {
    const baseActions = [
        { label: "Invite to your party", command: inviteToParty },
        { label: "Join party", command: joinParty },
        { label: "Remove from party", command: removeFromParty },
    ];

    // Add friend/unfriend option based on current friendship status
    if (props.user.isFriend) {
        baseActions.push({ label: "Remove from friendlist", command: removeFromFriendlist });
    } else {
        baseActions.push({ label: "Invite as friend", command: inviteAsFriend });
    }

    baseActions.push({ label: "Block", command: blockUser });

    return baseActions;
});

function onRightClick(event: MouseEvent) {
    if (menu.value) {
        menu.value.show(event);
    }
}

async function inviteToParty() {
    // TODO: Implement party invitation logic
    console.log(`Inviting ${props.user.username} to party`);
}

async function joinParty() {
    // TODO: Implement join party logic
    console.log(`Joining ${props.user.username}'s party`);
}

async function removeFromParty() {
    // TODO: Implement remove from party logic
    console.log(`Removing ${props.user.username} from party`);
}

async function inviteAsFriend() {
    // TODO: Implement add friend logic
    console.log(`Sending friend request to ${props.user.username}`);
}

async function removeFromFriendlist() {
    // TODO: Implement remove friend logic
    console.log(`Removing ${props.user.username} from friendlist`);
}

async function blockUser() {
    // TODO: Implement block user logic
    console.log(`Blocking ${props.user.username}`);
}
</script>

<style lang="scss" scoped>
.user {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 10px;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease-out;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        .slot {
            border-color: rgba(255, 255, 255, 0.4);
            background-color: rgba(255, 255, 255, 0.5);
        }
        .username {
            color: rgba(255, 255, 255, 1);
        }
    }

    .slot {
        width: 40px;
        height: 40px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(255, 255, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    .username {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.5);
        transition: all 0.2s ease;
    }
}
</style>
