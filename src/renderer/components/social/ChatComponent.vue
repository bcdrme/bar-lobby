<template>
    <div
        class="chat-container"
        :class="{ expanded: isExpanded || battleStore.isLobbyOpened, translated: battleStore.isLobbyOpened }"
        @focusin="expandChat"
        @focusout="collapseChat"
    >
        <span class="main-unread-messages-dot" :class="{ active: hasUnreadMessages }">◼</span>
        <div ref="tabs" class="tabs">
            <div
                class="tab"
                :class="{
                    unread: chatRoom.unreadMessages > 0,
                }"
                v-for="chatRoom in chatStore.chatRooms"
                :key="chatRoom.id"
            >
                <Button
                    class="txt-secondary"
                    :class="{
                        active: chatStore.selectedChatRoom.id === chatRoom.id,
                        unread: chatRoom.unreadMessages > 0,
                    }"
                    @click="clickTab(chatRoom)"
                    @mousedown.prevent
                >
                    <span class="unread-messages-dot" :class="{ active: chatRoom.unreadMessages > 0 }">◼</span>
                    {{ chatRoom.name }}
                    <span class="close-button" v-if="chatRoom.closeable" @click="(e) => closeChatRoom(e, chatRoom)">
                        <Icon :icon="closeThick" />
                    </span>
                </Button>
            </div>
        </div>
        <div class="middle-section" :class="{ expanded: isExpanded || battleStore.isLobbyOpened }">
            <div ref="chat-messages" class="chat-messages" :class="{ expanded: isExpanded || battleStore.isLobbyOpened }">
                <div v-for="(message, index) in selectedChatRoomMessages" :key="index" :class="['chat-message', message.userId]">
                    <div
                        v-if="
                            index === selectedChatRoomMessages.length - 1 ||
                            (index + 1 < selectedChatRoomMessages.length &&
                                message.timestamp - selectedChatRoomMessages[index + 1].timestamp > SEPARATOR_LIMIT)
                        "
                        class="time-divider"
                    >
                        {{ formatHourMin(message.timestamp) }}
                    </div>
                    <div class="message-content" :class="{ me: message.userId === me.userId, 'at-me': isAtMe(message) }">
                        <span class="username" :style="{ color: chatStore.selectedChatRoom.color }">{{ message.userName }}:</span>
                        <span class="text">{{ message.text }}</span>
                        <span class="failed" v-if="message.failed">failed to deliver</span>
                    </div>
                </div>
            </div>
            <div class="chat-room-members" :class="{ expanded: isExpanded || battleStore.isLobbyOpened }">
                <button
                    class="member"
                    v-for="member in chatStore.selectedChatRoom.members"
                    :key="member"
                    @click="clickOnMember(member)"
                    @mousedown.prevent
                >
                    {{ member }}
                </button>
            </div>
        </div>
        <div class="chat-input">
            <div class="target" :style="{ color: chatStore.selectedChatRoom.color }">To ({{ chatStore.selectedChatRoom.name }}):</div>
            <input ref="textBox" v-model="newMessage" @keydown.enter="sendMessage" placeholder="Type here to chat. Use '/' for commands." />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { Icon } from "@iconify/vue/dist/iconify.js";
import Button from "@renderer/components/controls/Button.vue";
import { battleStore } from "@renderer/store/battle.store";
import { chatActions, ChatMessage, ChatRoom, chatStore } from "@renderer/store/chat.store";
import { me } from "@renderer/store/me.store";
import { onKeyDown, useMagicKeys, watchOnce } from "@vueuse/core";
import { computed, ref, useTemplateRef, watch } from "vue";
import closeThick from "@iconify-icons/mdi/close-thick";
import { useTimestampFormatter } from "@renderer/composables/useTimestampFormatter";

const { formatHourMin } = useTimestampFormatter();
const SEPARATOR_LIMIT = 1000 * 60 * 5; // 5 minutes

const keys = useMagicKeys();
const shiftEnter = keys["Shift+Enter"];

const tabsRef = useTemplateRef<HTMLDivElement>("tabs");
watchOnce(tabsRef, () => {
    let velocity = 0;

    tabsRef.value.addEventListener("wheel", (e) => {
        e.preventDefault();
        velocity += e.deltaY * 0.8;
        requestAnimationFrame(updateScroll);
        tabsRef.value.scrollLeft += e.deltaY * 2;
    });

    function updateScroll() {
        if (Math.abs(velocity)) {
            tabsRef.value.scrollLeft += velocity;
            velocity *= 0.5;
            requestAnimationFrame(updateScroll);
        }
    }
});

const chatMessagesRef = useTemplateRef<HTMLDivElement>("chat-messages");

const newMessage = ref("");
const isExpanded = ref(false);
const textBox = useTemplateRef<HTMLInputElement>("textBox");

const selectedChatRoomMessages = computed(() => chatStore.selectedChatRoom.messages.toReversed());
const hasUnreadMessages = computed(() => chatStore.chatRooms.some((room) => room.unreadMessages > 0));

const clickOnMember = (member: string) => {
    newMessage.value += `@${member} `;
    textBox.value?.focus();
};

const sendMessage = () => {
    if (newMessage.value.trim() !== "") {
        chatActions.sendMessage({
            userId: me.userId,
            userName: me.username,
            text: newMessage.value,
            timestamp: Date.now(),
        });
        chatMessagesRef.value.scrollTo({
            behavior: "instant",
            top: 0,
        });
        newMessage.value = "";
    }
};

const atMeRegex = new RegExp(`(\\@${me.username})([ ]|$)`, "m");
const isAtMe = (message: ChatMessage) => {
    return atMeRegex.test(message.text);
};

const expandChat = () => {
    isExpanded.value = true;
};

const collapseChat = () => {
    isExpanded.value = false;
    chatMessagesRef.value.scrollTo({
        behavior: "instant",
        top: 0,
    });
};

const clickTab = (chatRoom: ChatRoom) => {
    chatActions.selectChatRoom(chatRoom.id);
    textBox.value?.focus();
    chatMessagesRef.value.scrollTo({
        behavior: "instant",
        top: 0,
    });
};

const closeChatRoom = (e: Event, chatRoom: ChatRoom) => {
    e.stopPropagation();
    chatActions.closeChatRoom(chatRoom.id);
    textBox.value?.focus();
};

watch(shiftEnter, () => {
    if (!isExpanded.value) {
        textBox.value?.focus();
    }
});

onKeyDown(
    "Escape",
    (e) => {
        if (isExpanded.value) {
            e.preventDefault();
            e.stopPropagation();
            textBox.value?.blur();
            isExpanded.value = false;
        }
    },
    { target: document }
);
</script>

<style lang="scss" scoped>
$unreadColor: #46ea2b;
$chatColor: rgba(27, 27, 27, 0.8);

.time-divider {
    display: flex;
    align-items: center;
    text-align: center;
    font-size: 10px;
    color: #999;
}

.time-divider::before,
.time-divider::after {
    content: "";
    flex-grow: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 0 10px;
}

.main-unread-messages-dot {
    position: absolute;
    left: -18px;
    bottom: 4px;
    display: none;
    font-size: 12px;
    color: $unreadColor;
    text-shadow: 0 0 12px $unreadColor;
    &.active {
        display: inline;
    }
}

.unread-messages-dot {
    position: absolute;
    left: 6px;
    display: none;
    font-size: 12px;
    color: $unreadColor;
    text-shadow: 0 0 12px $unreadColor;
    &.active {
        display: inline;
    }
}

.close-button {
    position: absolute;
    z-index: 1;
    right: 4px;
    padding: 3px;
    cursor: pointer;
    line-height: 0;
    font-size: 8px;
    border-radius: 200px;
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.middle-section {
    display: flex;
    flex-grow: 1;
    flex-direction: row;
    height: 1px;
    &.expanded {
        background-color: $chatColor;
    }
}

.chat-container {
    position: absolute;
    left: 0;
    // left: 25px;
    // transform: translateX(-50%);
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 170px;
    transition: all 0.4s ease-in-out;
    width: 50%;
    max-width: 600px;
    z-index: 1;
    // outline: 2px solid rgba(0, 0, 0, 0);
    &.expanded {
        mask-image: none;
        height: 400px;
        // box-shadow: 0 0 8px 1px rgba(0, 0, 0, 0.7);
        border-top-right-radius: 4px;
        backdrop-filter: blur(10px);
        outline: 1px solid rgb(0, 0, 0);
    }
    &.translated {
        left: 900px;
        transform: translate(40px, 0);
    }
}

.chat-container.expanded:after {
    @extend .fullsize;
    left: 0;
    top: 0;
    opacity: 0.3;
    mix-blend-mode: overlay; // doesn't support transition
    z-index: -1;
    // outline: 1px solid black;
}

// tabs are fading out when chat is collapsed
.chat-container:not(.expanded) .tabs {
    opacity: 0;
}

.tabs {
    position: absolute;
    top: -42px;
    transition: all 0.4s ease-in-out;
    flex-direction: row;
    width: 100%;
    display: flex;
    overflow-x: hidden;
    .tab {
        text-wrap: none;
        padding-top: 8px;
        margin-right: 2px;
        &.unread {
            z-index: 1;
        }
        clip-path: polygon(calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%, 0 0);
    }
    .button {
        font-size: 10px;
        text-wrap-mode: nowrap;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        border-bottom: 1px solid #000000;
        flex-grow: 0;
        :deep(> button) {
            padding: 0 18px;
        }
        &:hover,
        &.active {
            border-bottom: 1px solid $chatColor;
            color: #fff;
            background-color: $chatColor;
            // box-shadow: 0 0 16px rgba(0, 0, 0, 0.7);
        }
        &.unread {
            border-bottom: 1px solid $unreadColor;
            box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
        }
    }
}

.chat-room-members {
    display: none;
    flex-direction: column;
    width: 150px;
    gap: 2px;
    padding: 8px;
    font-size: 13px;
    color: #ffffff83;
    overflow-x: hidden;
    overflow-y: scroll;
    text-wrap-mode: nowrap;
    text-overflow: ellipsis;
    .member {
        padding: 0 4px;
        overflow: clip;
        text-overflow: ellipsis;
        &:hover {
            background-color: #e3e3e30d;
        }
    }
    &.expanded {
        display: flex;
    }
    &::-webkit-scrollbar {
        width: 1px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        &:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    }
}

.chat-messages {
    mask-image: linear-gradient(to top, #000 0 70%, transparent);
    flex-grow: 1;
    padding: 8px;
    display: flex;
    flex-direction: column-reverse;
    gap: 2px;
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100%;
    &::-webkit-scrollbar {
        width: 1px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        &:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    }
}

.chat-messages.expanded {
    mask-image: none;
    // background: linear-gradient($chatColor, #0f0f0f, #000000);
}

.chat-message {
    font-size: 12px;
    color: #dadada;
    font-family: "Poppins";
    font-style: normal;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: #dadada;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.65);
}

.message-content {
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: baseline;
    padding: 2px 8px;
    &.me {
        background: linear-gradient(to right, #ffffff0f, #ffffff00, #ffffff00);
    }
    &.at-me {
        background-color: #ffffff0f;
        outline: 2px groove #21c85f;
        background: linear-gradient(to right, #21c85e6d, #ffffff00, #ffffff00);
    }
    &.text {
        word-break: break-all;
    }
}

.username {
    font-weight: bold;
}

.failed {
    color: rgb(255 66 66);
    font-size: 9px;
    text-shadow: none;
}

.timestamp {
    font-size: 0.8em;
    color: #999;
}

.chat-input {
    display: flex;
    align-items: baseline;
    background-color: #000000;
}

.chat-input .target {
    padding: 4px 8px;
    font-weight: bold;
    font-size: 13px;
}

.chat-input input {
    flex-grow: 1;
    padding: 0px 8px;
    color: #e0e0e0;
    font-size: 13px;
}

.chat-input button:hover {
    background-color: #555;
}
</style>
