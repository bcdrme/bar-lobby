<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <!-- Party Chat Container -->
    <div
        v-for="chatRoom in getPartyChatRooms()"
        :key="chatRoom.id"
        class="chat-container party-chat"
        :class="{
            expanded: expandedChats.includes(chatRoom.id) || battleStore.isLobbyOpened || chatRoom.type === 'party',
            translated: battleStore.isLobbyOpened,
        }"
        @focusin="expandChat(chatRoom.id)"
        @focusout="chatRoom.type === 'party' ? null : collapseChat(chatRoom.id)"
    >
        <div
            class="middle-section"
            :class="{ expanded: expandedChats.includes(chatRoom.id) || battleStore.isLobbyOpened || chatRoom.type === 'party' }"
        >
            <div
                ref="chat-messages"
                class="chat-messages"
                :class="{ expanded: expandedChats.includes(chatRoom.id) || battleStore.isLobbyOpened || chatRoom.type === 'party' }"
            >
                <div v-for="(message, index) in getChatMessages(chatRoom.id)" :key="index" :class="['chat-message', message.userId]">
                    <div
                        v-if="
                            index === getChatMessages(chatRoom.id).length - 1 ||
                            (index + 1 < getChatMessages(chatRoom.id).length &&
                                message.timestamp - getChatMessages(chatRoom.id)[index + 1].timestamp > SEPARATOR_LIMIT)
                        "
                        class="time-divider"
                    >
                        {{ formatHourMin(message.timestamp) }}
                    </div>
                    <div class="message-content" :class="{ me: message.userId === me.userId, 'at-me': isAtMe(message) }">
                        <span class="username" :style="{ color: chatRoom.color }">{{ message.userName }}:</span>
                        <span class="text">{{ message.text }}</span>
                        <span class="failed" v-if="message.failed">failed to deliver</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="chat-input">
            <div class="input-section">
                <div class="channel-header">
                    <span class="channel-name">
                        <Icon :icon="accountGroup" />
                    </span>
                    <button v-if="chatRoom.closeable" class="close-button" @click="closeChatRoom(chatRoom.id)">×</button>
                </div>
                <input
                    :ref="(el: any) => setTextBoxRef(chatRoom.id, el)"
                    v-model="chatInputs[chatRoom.id]"
                    @keydown.enter="sendMessage(chatRoom.id)"
                    :placeholder="`Say something in ${chatRoom.name}...`"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import accountGroup from "@iconify-icons/mdi/account-group";
import { battleStore } from "@renderer/store/battle.store";
import { chatActions, ChatMessage, chatStore } from "@renderer/store/chat.store";
import { me } from "@renderer/store/me.store";
import { onKeyDown, useMagicKeys } from "@vueuse/core";
import { reactive, ref, watch } from "vue";
import { useTimestampFormatter } from "@renderer/composables/useTimestampFormatter";

const { formatHourMin } = useTimestampFormatter();
const SEPARATOR_LIMIT = 1000 * 60 * 5; // 5 minutes

const keys = useMagicKeys();
const shiftEnter = keys["Shift+Enter"];

const expandedChats = ref<string[]>([]);
const chatInputs = reactive<Record<string, string>>({});
const textBoxRefs = reactive<Record<string, HTMLInputElement | null>>({});

// Initialize chat inputs for party rooms
const initializePartyInputs = () => {
    chatStore.chatRooms.forEach((room) => {
        if (room.type === "party" && !chatInputs[room.id]) {
            chatInputs[room.id] = "";
        }
    });
};

// Always expand party chat
const initializePartyExpansion = () => {
    const partyChatRoom = chatStore.chatRooms.find((room) => room.type === "party");
    if (partyChatRoom && !expandedChats.value.includes(partyChatRoom.id)) {
        expandedChats.value.push(partyChatRoom.id);
    }
};

// Initialize on component mount
initializePartyInputs();
initializePartyExpansion();

const getChatMessages = (chatRoomId: string) => {
    const chatRoom = chatStore.chatRooms.find((room) => room.id === chatRoomId);
    return chatRoom ? chatRoom.messages.toReversed() : [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setTextBoxRef = (chatRoomId: string, el: any) => {
    textBoxRefs[chatRoomId] = el;
};

const sendMessage = (chatRoomId: string) => {
    const message = chatInputs[chatRoomId];
    if (message?.trim() !== "") {
        // Select the chat room temporarily to send message
        const previousSelectedId = chatStore.selectedChatRoom.id;
        chatActions.selectChatRoom(chatRoomId);
        chatActions.sendMessage({
            userId: me.userId,
            userName: me.username,
            text: message,
            timestamp: Date.now(),
        });
        // Restore previous selection
        chatActions.selectChatRoom(previousSelectedId);
        chatInputs[chatRoomId] = "";
    }
};

const closeChatRoom = (chatRoomId: string) => {
    chatActions.closeChatRoom(chatRoomId);
    expandedChats.value = expandedChats.value.filter((id) => id !== chatRoomId);
    delete chatInputs[chatRoomId];
    delete textBoxRefs[chatRoomId];
};

const getPartyChatRooms = () => {
    return chatStore.chatRooms.filter((room) => room.type === "party");
};

const atMeRegex = new RegExp(`(\\@${me.username})([ ]|$)`, "m");
const isAtMe = (message: ChatMessage) => {
    return atMeRegex.test(message.text);
};

const expandChat = (chatRoomId: string) => {
    if (!expandedChats.value.includes(chatRoomId)) {
        expandedChats.value.push(chatRoomId);
    }
};

const collapseChat = (chatRoomId: string) => {
    // Don't allow party chat to be collapsed
    const chatRoom = chatStore.chatRooms.find((room) => room.id === chatRoomId);
    if (chatRoom?.type === "party") {
        return;
    }
    expandedChats.value = expandedChats.value.filter((id) => id !== chatRoomId);
};

watch(shiftEnter, () => {
    // Focus the party chat input
    const partyChatId = getPartyChatRooms()[0]?.id;
    if (partyChatId && textBoxRefs[partyChatId] && !expandedChats.value.includes(partyChatId)) {
        textBoxRefs[partyChatId]?.focus();
    }
});

onKeyDown(
    "Escape",
    (e) => {
        if (expandedChats.value.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            // Blur all expanded chats (except party chat which stays expanded)
            expandedChats.value.forEach((chatId) => {
                const chatRoom = chatStore.chatRooms.find((room) => room.id === chatId);
                if (chatRoom?.type !== "party") {
                    textBoxRefs[chatId]?.blur();
                }
            });
            // Remove non-party chats from expanded list
            expandedChats.value = expandedChats.value.filter((chatId) => {
                const chatRoom = chatStore.chatRooms.find((room) => room.id === chatId);
                return chatRoom?.type === "party";
            });
        }
    },
    { target: document }
);
</script>

<style lang="scss" scoped>
$party-color: #f97316;
$party-at-me-color: #f97316;
$party-at-me-bg-color: rgba(249, 115, 22, 0.15);

.time-divider {
    display: flex;
    align-items: center;
    text-align: center;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.4);
    margin: 4px 0;
    font-family: Rajdhani, sans-serif;
    font-weight: 500;
}

.time-divider::before,
.time-divider::after {
    content: "";
    flex-grow: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 0 6px;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 45px;
    transition: all 0.3s ease-in-out;
    width: 300px;
    max-width: 300px;
    z-index: 1;

    &.expanded {
        height: 320px;
        border-radius: 4px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
    }

    // Party chat orange theme
    &.party-chat {
        // Party chat is always expanded and prominent
        height: 320px !important;

        .middle-section {
            display: flex !important; // Always show party chat messages
            flex-grow: 1;
            flex-direction: column;
            background: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.85));
            backdrop-filter: blur(8px) brightness(0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: none;
            border-radius: 4px 4px 0 0;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.4);
            position: relative;
        }

        .chat-messages {
            display: flex !important; // Always show messages for party chat
        }

        .middle-section.expanded {
            border-color: rgba($party-color, 0.3);
            box-shadow:
                -1px 0 0 rgba(0, 0, 0, 0.6),
                1px 0 0 rgba(0, 0, 0, 0.6),
                0 -1px 0 rgba(0, 0, 0, 0.6),
                inset 0 0 50px rgba($party-color, 0.1),
                inset 0 3px 8px rgba(255, 255, 255, 0.05),
                3px -3px 10px rgba(0, 0, 0, 0.9),
                0 0 20px rgba($party-color, 0.2);
        }

        .chat-input {
            border-color: rgba($party-color, 0.3);
            box-shadow:
                -1px 0 0 rgba(0, 0, 0, 0.6),
                1px 0 0 rgba(0, 0, 0, 0.6),
                0 1px 0 rgba(0, 0, 0, 0.6),
                inset 0 0 50px rgba($party-color, 0.1),
                inset 0 -3px 8px rgba(255, 255, 255, 0.05),
                3px 3px 10px rgba(0, 0, 0, 0.9),
                0 0 20px rgba($party-color, 0.2);
        }

        .channel-name {
            color: $party-color !important;
            text-shadow: 0 0 10px rgba($party-color, 0.5);
        }

        .message-content {
            &.at-me {
                background: $party-at-me-bg-color;
                border-left-color: $party-at-me-color;
                box-shadow: 0 0 10px rgba($party-at-me-color, 0.2);
            }
        }

        .input-section input:focus {
            border-color: rgba($party-color, 0.4);
            box-shadow: 0 0 0 2px rgba($party-color, 0.1);
        }
    }
}

.middle-section {
    display: none;

    &.expanded {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        background: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.85));
        backdrop-filter: blur(8px) brightness(0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.4);
        position: relative;
    }
}

.chat-messages {
    flex-grow: 1;
    padding: 10px;
    display: flex;
    flex-direction: column-reverse;
    gap: 3px;
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;

    &::-webkit-scrollbar {
        width: 5px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        &:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    }
}

// Party chat messages are always visible
.party-chat .chat-messages {
    display: flex !important;
    flex-direction: column-reverse !important;
}

.chat-message {
    font-size: 13px;
    color: #e8e8e8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 400;
    line-height: 1.4;
}

.message-content {
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: baseline;
    padding: 3px 8px;
    border-radius: 2px;
    transition: all 0.2s ease;

    &.me {
        background: rgba(255, 255, 255, 0.05);
        border-left: 2px solid rgba(255, 255, 255, 0.3);
    }

    &.at-me {
        background: $party-at-me-bg-color;
        border-left: 2px solid $party-at-me-color;
        box-shadow: 0 0 5px rgba($party-at-me-color, 0.2);
    }

    .text {
        word-break: break-word;
        flex: 1;
        font-size: 12px;
    }
}

.username {
    font-weight: 600;
    font-family: Rajdhani, sans-serif;
    white-space: nowrap;
    font-size: 12px;
    min-width: fit-content;
}

.failed {
    color: #ff6b6b;
    font-size: 10px;
    font-weight: 500;
    opacity: 0.8;
}

.chat-input {
    background: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.95));
    backdrop-filter: blur(8px) brightness(0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    position: relative;
    min-height: 36px;
}

.input-section {
    display: flex;
    padding: 8px 10px;
    gap: 8px;
    align-items: center;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 3px;
}

.channel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .channel-name {
        font-size: 16px; // Slightly bigger for icon
        font-weight: 600;
        font-family: Rajdhani, sans-serif;
        color: rgba(255, 255, 255, 0.8);
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: flex;
        align-items: center;
    }
}

.input-section input {
    flex-grow: 1;
    padding: 5px 8px;
    color: #e8e8e8;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

    &:focus {
        outline: none;
        border-color: rgba($party-color, 0.4);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 0 1px rgba($party-color, 0.1);
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.4);
        font-size: 12px;
    }
}

.chat-container:not(.expanded) {
    .chat-input {
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.1);

        .input-section {
            padding: 8px 12px;
        }
    }
}
</style>
