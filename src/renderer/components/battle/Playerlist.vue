<template>
    <AddBotModal
        v-model="botListOpen"
        :engineVersion="battleStore.battleOptions.engineVersion"
        :gameVersion="battleStore.battleOptions.gameVersion"
        :teamId="botModalTeamId"
        title="Add Bot"
        @bot-selected="onBotSelected"
    />
    <div class="scroll-container padding-right-sm">
        <div class="playerlist" :class="{ dragging: draggedParticipant !== null }">
            <TeamComponent
                v-for="(team, teamId) in battleMetadataStore.teams"
                :key="teamId"
                :teamId="teamId"
                @add-bot-clicked="openBotList"
                @on-join-clicked="joinTeam"
                @on-drag-start="dragStart"
                @on-drag-end="dragEnd"
                @on-drag-enter="dragEnter"
                @on-drop="onDrop"
            />
        </div>
        <hr class="margin-top-sm margin-bottom-sm" />
        <TeamComponent
            :key="-1"
            class="spectators"
            :teamId="-1"
            @add-bot-clicked="openBotList"
            @on-join-clicked="joinTeam"
            @on-drag-start="dragStart"
            @on-drag-end="dragEnd"
            @on-drag-enter="dragEnter"
            @on-drop="onDrop"
        />
    </div>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";

import AddBotModal from "@renderer/components/battle/AddBotModal.vue";
import TeamComponent from "@renderer/components/battle/TeamComponent.vue";
import { User } from "@main/model/user";
import { EngineAI } from "@main/content/engine/engine-version";
import { GameAI } from "@main/content/game/game-version";
import { Bot, Faction } from "@main/game/battle/battle-types";
import { battleMetadataStore, battleStore } from "@renderer/store/battle.store";
import { me } from "@renderer/store/me.store";

const botListOpen = ref(false);
const botModalTeamId = ref(0);

function openBotList(teamId: number) {
    botModalTeamId.value = teamId;
    botListOpen.value = true;
}

function onBotSelected(bot: EngineAI | GameAI, teamId: number) {
    botListOpen.value = false;
    addBot(bot, teamId);
}

function addBot(ai: EngineAI | GameAI, teamId: number) {
    battleStore.bots.push({
        name: ai.name,
        aiShortName: "shortName" in ai ? ai.shortName : ai.name,
        ownerUserId: me.userId,
        aiOptions: {},
        battleStatus: {
            participantId: battleMetadataStore.participants.length + 1,
            faction: Faction.Armada,
            teamId,
        },
    });
}

function joinTeam(teamId: number) {
    const playerIsSpectator = battleStore.spectators.includes(me);
    if (playerIsSpectator && teamId >= 0) {
        me.battleStatus.teamId = teamId;
        battleStore.spectators.splice(battleStore.spectators.indexOf(me), 1);
        battleStore.users.push(me);
    } else if (!playerIsSpectator && teamId < 0) {
        me.battleStatus.teamId = -1;
        battleStore.spectators.push(me);
        battleStore.users.splice(battleStore.users.indexOf(me), 1);
    } else if (!playerIsSpectator && teamId >= 0) {
        me.battleStatus.teamId = teamId;
    }
}

let draggedParticipant: Ref<User | Bot | null> = ref(null);
let draggedEl: Element | null = null;

function dragEnter(event: DragEvent, teamId: number) {
    if (!draggedParticipant.value) {
        return;
    }

    const target = event.target as HTMLElement;
    const groupEl = target.closest("[data-type=group]");
    if (draggedEl && groupEl) {
        document.querySelectorAll("[data-type=group]").forEach((el) => {
            el.classList.remove("highlight");
            el.classList.remove("highlight-error");
        });
    }

    const isBot = "aiShortName" in draggedParticipant.value;
    const isSpectator = draggedParticipant.value.battleStatus.teamId < 0;
    const memberTeamId = draggedParticipant.value.battleStatus?.teamId;

    const invalidMove = (isBot && teamId < 0) || (isSpectator && teamId < 0) || (memberTeamId === teamId && !isSpectator);

    if (groupEl) {
        invalidMove ? groupEl.classList.add("highlight-error") : groupEl.classList.add("highlight");
    }
}

function dragStart(event: DragEvent, participant: User | Bot) {
    draggedParticipant.value = participant;
    draggedEl = event.target as Element;
    const participantEl = draggedEl?.querySelector("[data-type=participant]");
    if (participantEl) {
        participantEl.classList.add("dragging");
    }
}

function dragEnd() {
    const participantEl = draggedEl?.querySelector("[data-type=participant]");
    if (participantEl) {
        participantEl.classList.remove("dragging");
    }
    draggedParticipant.value = null;
    draggedEl = null;

    document.querySelectorAll("[data-type=group]").forEach((el) => {
        el.classList.remove("highlight");
        el.classList.remove("highlight-error");
    });
}

function onDrop(event: DragEvent, teamId: number) {
    const target = event.target as Element;
    if (!draggedParticipant.value || target.getAttribute("data-type") !== "group") {
        return;
    }
    draggedParticipant.value.battleStatus.teamId = teamId;
}
</script>

<style lang="scss" scoped>
.playerlist {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    gap: 10px;
    &.dragging .group > * {
        pointer-events: none;
    }
    @media (max-width: 1919px) {
        grid-template-columns: 1fr;
    }
}
</style>
