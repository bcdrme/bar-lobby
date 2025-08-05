<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div
        v-if="getDMRooms().length > 0"
        class="chat-container"
        :class="{
            expanded: expandedChats.includes('dm-window') || battleStore.isLobbyOpened,
        }"
        @focusin="expandChat('dm-window')"
        @focusout="collapseChat('dm-window')"
    >
        <div class="middle-section" :class="{ expanded: expandedChats.includes('dm-window') || battleStore.isLobbyOpened }">
            <div class="dm-layout">
                <!-- Thread Selector Sidebar -->
                <div class="thread-selector">
                    <div class="thread-header">DMs</div>
                    <div
                        v-for="dmRoom in getDMRooms()"
                        :key="dmRoom.id"
                        class="thread-item"
                        :class="{ active: selectedDMThread === dmRoom.id }"
                        @click="selectDMThread(dmRoom.id)"
                    >
                        <span class="thread-name">{{ dmRoom.name }}</span>
                        <span v-if="dmRoom.unreadMessages > 0" class="unread-count">{{ dmRoom.unreadMessages }}</span>
                        <button class="thread-close-btn" @click.stop="closeChatRoom(dmRoom.id)">×</button>
                    </div>
                </div>

                <!-- Chat Messages Area -->
                <div v-if="selectedDMThread" class="chat-messages-container">
                    <div ref="chat-messages" class="chat-messages">
                        <div
                            v-for="(message, index) in getChatMessages(selectedDMThread)"
                            :key="index"
                            :class="['chat-message', message.userId]"
                        >
                            <div
                                v-if="
                                    index === getChatMessages(selectedDMThread).length - 1 ||
                                    (index + 1 < getChatMessages(selectedDMThread).length &&
                                        message.timestamp - getChatMessages(selectedDMThread)[index + 1].timestamp > SEPARATOR_LIMIT)
                                "
                                class="time-divider"
                            >
                                {{ formatHourMin(message.timestamp) }}
                            </div>
                            <div class="message-content" :class="{ me: message.userId === me.userId, 'at-me': isAtMe(message) }">
                                <span class="username" :style="{ color: getDMRooms().find((r) => r.id === selectedDMThread)?.color }"
                                    >{{ message.userName }}:</span
                                >
                                <span class="text">{{ message.text }}</span>
                                <span class="failed" v-if="message.failed">failed to deliver</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="chat-input">
            <div class="input-section">
                <div class="channel-header">
                    <span class="channel-name">{{ getDMRooms().find((r) => r.id === selectedDMThread)?.name || "DMs" }}</span>
                </div>
                <input
                    v-if="selectedDMThread"
                    :ref="(el: any) => setTextBoxRef(selectedDMThread, el)"
                    v-model="chatInputs[selectedDMThread]"
                    @keydown.enter="sendMessage(selectedDMThread)"
                    :placeholder="`Message ${getDMRooms().find((r) => r.id === selectedDMThread)?.name}...`"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
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
const selectedDMThread = ref<string>(""); // Track which DM thread is selected

// Initialize chat inputs for DM rooms
const initializeDMInputs = () => {
    chatStore.chatRooms.forEach((room) => {
        if (room.type === "player" && !chatInputs[room.id]) {
            chatInputs[room.id] = "";
        }
    });
};

// Set initial DM thread selection
const initializeDMSelection = () => {
    const dmRooms = chatStore.chatRooms.filter((room) => room.type === "player");
    if (dmRooms.length > 0 && !selectedDMThread.value) {
        selectedDMThread.value = dmRooms[0].id;
    }
};

// Initialize on component mount
initializeDMInputs();
initializeDMSelection();

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

    // If we're closing the selected DM thread, select another one
    if (selectedDMThread.value === chatRoomId) {
        const remainingDMs = chatStore.chatRooms.filter((room) => room.type === "player" && room.id !== chatRoomId);
        selectedDMThread.value = remainingDMs.length > 0 ? remainingDMs[0].id : "";
    }
};

const selectDMThread = (chatRoomId: string) => {
    selectedDMThread.value = chatRoomId;
};

const getDMRooms = () => {
    return chatStore.chatRooms.filter((room) => room.type === "player");
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
    expandedChats.value = expandedChats.value.filter((id) => id !== chatRoomId);
};

watch(shiftEnter, () => {
    // Focus the first available DM chat input
    const firstDMId = getDMRooms()[0]?.id;
    if (firstDMId && textBoxRefs[firstDMId] && !expandedChats.value.includes("dm-window")) {
        textBoxRefs[firstDMId]?.focus();
    }
});

onKeyDown(
    "Escape",
    (e) => {
        if (expandedChats.value.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            // Blur all expanded chats
            expandedChats.value.forEach((chatId) => {
                textBoxRefs[chatId]?.blur();
            });
            expandedChats.value = [];
        }
    },
    { target: document }
);
</script>

<style lang="scss" scoped>
$accent-color: #22c55e;
$atMeColor: #22c55e;
$atMeBgColor: rgba(34, 197, 94, 0.15);

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
    width: 450px;
    max-width: 450px;
    z-index: 1;

    &.expanded {
        height: 350px;
        border-radius: 4px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
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
        background: $atMeBgColor;
        border-left: 2px solid $atMeColor;
        box-shadow: 0 0 5px rgba($atMeColor, 0.2);
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
        font-size: 12px;
        font-weight: 600;
        font-family: Rajdhani, sans-serif;
        color: rgba(255, 255, 255, 0.8);
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        border-color: rgba($accent-color, 0.4);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 0 1px rgba($accent-color, 0.1);
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

.dm-layout {
    display: flex;
    height: 100%;

    .thread-selector {
        width: 120px;
        background: rgba(0, 0, 0, 0.3);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;

        .thread-header {
            padding: 8px 12px;
            font-size: 11px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-family: Rajdhani, sans-serif;
        }

        .thread-item {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);

            &:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            &.active {
                background: rgba(34, 197, 94, 0.15);
                border-left: 2px solid #22c55e;
            }

            .thread-name {
                flex: 1;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.8);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-family: Rajdhani, sans-serif;
            }

            .unread-count {
                background: #22c55e;
                color: white;
                font-size: 9px;
                padding: 1px 4px;
                border-radius: 8px;
                min-width: 16px;
                text-align: center;
                margin-right: 4px;
                font-weight: 600;
            }

            .thread-close-btn {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.4);
                font-size: 12px;
                cursor: pointer;
                padding: 2px;
                opacity: 0;
                transition: opacity 0.2s ease;

                &:hover {
                    color: rgba(255, 255, 255, 0.8);
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }
            }

            &:hover .thread-close-btn {
                opacity: 1;
            }
        }
    }

    .chat-messages-container {
        flex: 1;
        display: flex;
        flex-direction: column;

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
    }
}
</style>
