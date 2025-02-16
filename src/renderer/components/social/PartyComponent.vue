<template>
    <div class="header">
        <div class="party-info">Party {{ (partyUsers?.length || 0) + 1 }}/5</div>
    </div>
    <div class="party-members">
        <!-- <div class="empty-slot side2">
                    <span>+</span>
                </div>
                <div class="empty-slot side">
                    <span>+</span>
                </div> -->
        <PartyMember :user="partyUsers?.at(2)" class="side2" />
        <PartyMember :user="partyUsers?.at(0)" class="side" />
        <PartyMember :user="meUser" :middle="true" class="middle" />
        <PartyMember :user="partyUsers?.at(1)" class="side" />
        <PartyMember :user="partyUsers?.at(3)" class="side2" />
        <!-- <div class="empty-slot side">
                    <span>+</span>
                </div>
                <div class="empty-slot side2">
                    <span>+</span>
                </div> -->
    </div>
</template>

<script lang="ts" setup>
import PartyMember from "@renderer/components/social/PartyMember.vue";
import { useDexieLiveQuery } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { me } from "@renderer/store/me.store";

const partyUsers = useDexieLiveQuery(() => db.users.where("partyId").notEqual(null).toArray());
const meUser = useDexieLiveQuery(() => db.users.get(me.userId));
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.party-info {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 10px 20px;
    font-size: 1.5rem;
}

.party-members {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: end;
    gap: 20px;
}

.middle {
    width: 300px;
    height: 600px;
}

.side {
    // transform: translate(0, 60px);
    height: 560px;
}

.side2 {
    // transform: translate(0, 80px);
    height: 550px;
}
</style>
