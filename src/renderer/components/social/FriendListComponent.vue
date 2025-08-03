<template>
    <div class="friends-drawer">
        <div class="header">Social</div>
        <div class="me">
            {{ me.username }}
        </div>
        <div class="invites">
            <h2>Invites</h2>
            <div v-if="usersStore.invites.length === 0">No invites</div>
            <div v-else>
                <FriendComponent v-for="user in usersStore.invites" :key="user.userId" :user="user" />
            </div>
        </div>
        <div>
            <Accordion :active-index="0">
                <AccordionTab>
                    <template #header>
                        <h2>Online</h2>
                    </template>
                    <p>
                        <FriendComponent v-for="friend in onlineFriends" :key="friend.userId" :user="friend" />
                    </p>
                </AccordionTab>
                <AccordionTab header="Offline">
                    <p>
                        <FriendComponent v-for="friend in offlineFriends" :key="friend.userId" :user="friend" />
                    </p>
                </AccordionTab>
                <AccordionTab header="Recent Players">
                    <p>
                        <FriendComponent v-for="user in recentPlayers" :key="user.userId" :user="user" />
                    </p>
                </AccordionTab>
            </Accordion>
        </div>
    </div>
</template>

<script lang="ts" setup>
import FriendComponent from "@renderer/components/social/FriendComponent.vue";
import { useDexieLiveQuery } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { me } from "@renderer/store/me.store";
import { usersStore } from "@renderer/store/users.store";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";

const onlineFriends = useDexieLiveQuery(() => {
    return db.users
        .where({
            status: ["lobby", "menu", "playing"],
            isFriend: 1,
            isMe: 0,
        })
        .toArray();
});

const offlineFriends = useDexieLiveQuery(() => {
    return db.users
        .where({
            status: "offline",
            isFriend: 1,
            isMe: 0,
        })
        .toArray();
});

const recentPlayers = useDexieLiveQuery(() => {
    return db.users
        .where({
            isFriend: 0,
            isMe: 0,
        })
        .limit(20)
        .reverse()
        .sortBy("lastSeen");
});
</script>

<style lang="scss" scoped>
.friends-drawer {
    z-index: 1;
    position: absolute;
    top: 50px;
    right: 0;
    height: 100%;
    width: 300px;
    padding-top: 96px;
    transition: all 0.4s ease-out;
    background-color: grey;
}

.backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-color: rgba(22, 22, 22, 0.6);
    backdrop-filter: blur(5px) saturate(20%);
    z-index: 1;
    transition: all 0.4s ease-in-out;
}
</style>
