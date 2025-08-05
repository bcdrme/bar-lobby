// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { reactive } from "vue";

export interface ChatRoom {
    id: string;
    name: string;
    color: string;
    type: "room" | "player" | "party";
    messages: ChatMessage[];
    members: string[];
    unreadMessages: number;
    closeable: boolean;
}

export interface ChatMessage {
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
    failed?: boolean;
}

export enum WellKnownChatRooms {
    General = "general",
    Lobby = "lobby",
}

const defaultChatRooms: ChatRoom[] = [
    {
        id: "party",
        name: "Party",
        color: "#f97316",
        type: "party",
        messages: [
            { userId: "System", userName: "System", text: "Welcome to party chat!", timestamp: Date.now() - 1000 * 30 },
            { userId: "Protar", userName: "Protar", text: "Ready to play?", timestamp: Date.now() - 1000 * 15 },
            { userId: "Charlie", userName: "Charlie", text: "Let's do this! 🎮", timestamp: Date.now() },
        ],
        members: ["Protar", "Charlie"],
        unreadMessages: 0,
        closeable: false,
    },
    {
        id: "101",
        name: "Melon",
        color: "#ff6347",
        type: "player",
        messages: [{ userId: "101", userName: "Melon", text: "Hey, wanna play a match?", timestamp: Date.now() }],
        members: [],
        unreadMessages: 1,
        closeable: true,
    },
    {
        id: "102",
        name: "Apple",
        color: "#32cd32",
        type: "player",
        messages: [
            { userId: "102", userName: "Apple", text: "Good game last time!", timestamp: Date.now() - 1000 * 60 },
            { userId: "102", userName: "Apple", text: "Up for another?", timestamp: Date.now() - 1000 * 30 },
        ],
        members: [],
        unreadMessages: 2,
        closeable: true,
    },
    {
        id: "103",
        name: "Banana",
        color: "#ffd700",
        type: "player",
        messages: [{ userId: "103", userName: "Banana", text: "Thanks for the tips!", timestamp: Date.now() - 1000 * 120 }],
        members: [],
        unreadMessages: 0,
        closeable: true,
    },
];

export const chatStore = reactive<{ chatRooms: ChatRoom[]; selectedChatRoom: ChatRoom; isInitialized?: boolean }>({
    chatRooms: defaultChatRooms,
    selectedChatRoom: defaultChatRooms.at(0)!,
    isInitialized: false,
});

export function initChatStore() {
    window.tachyon.onEvent("messaging/received", async (data) => {
        console.debug(`Received message: ${JSON.stringify(data)}`);
        const { message, source } = data;

        if (source.type !== "player") {
            throw new Error(`Unsupported source type: ${source.type}`);
        }

        const newMessage: ChatMessage = { userId: source.userId, userName: source.userId, text: message, timestamp: new Date().getTime() };
        let chatRoom = chatStore.chatRooms.find((room) => room.id === source.userId);
        if (chatRoom === undefined) {
            chatRoom = await chatActions.openDMChatRoom(source.userId);
        }
        chatRoom.messages.push(newMessage);
    });
    chatStore.isInitialized = true;
}

export const chatActions = {
    selectChatRoom(id: string) {
        const selectedChatRoom = chatStore.chatRooms.find((room) => room.id === id);

        if (selectedChatRoom) {
            chatStore.selectedChatRoom = selectedChatRoom;
            chatStore.selectedChatRoom.unreadMessages = 0;
        }
    },
    async sendMessage(message: ChatMessage) {
        let response;
        switch (chatStore.selectedChatRoom.type) {
            case "player":
                response = await window.tachyon.request("messaging/send", {
                    message: message.text,
                    target: {
                        type: "player",
                        userId: chatStore.selectedChatRoom.id,
                    },
                });
                break;
            case "party":
                response = { status: "success" }; // TODO: Implement party messaging when the protocol is ready
                // response = await window.tachyon.request("messaging/send", {
                //     message: message.text,
                //     target: {
                //         type: "party",
                //     },
                // });
                break;
            case "room":
                response = { status: "success" }; // TODO: Implement party messaging when the protocol is ready
                // response = await window.tachyon.request("messaging/send", {
                //     message: message.text,
                //     target: {
                //         type: "party", //should be room but we don't have that yet
                //     },
                // });
                break;
            default:
                throw new Error(`Unhandled chat room type: ${chatStore.selectedChatRoom.type}`);
        }
        if (response.status === "success") {
            message.failed = false;
        } else {
            message.failed = true;
        }
        chatStore.selectedChatRoom.messages.push(message);
    },
    addMessage(roomId: string, message: ChatMessage) {
        const room = chatStore.chatRooms.find((room) => room.id === roomId);
        if (room) {
            room.messages.push(message);
            if (!chatStore.selectedChatRoom) throw new Error("failed to access chat room");

            if (chatStore.selectedChatRoom.id !== roomId) {
                room.unreadMessages++;
            }
        }
    },
    closeChatRoom(id: string) {
        chatStore.chatRooms = chatStore.chatRooms.filter((room) => room.id !== id);
    },
    async openDMChatRoom(userId: string) {
        window.tachyon.request("user/subscribeUpdates", { userIds: [userId] });
        const room: ChatRoom = {
            id: userId,
            name: userId, //TODO change this with the user name we have in db maybe
            color: "#ff6347",
            type: "player",
            members: [],
            messages: [],
            unreadMessages: 1,
            closeable: true,
        };
        chatStore.chatRooms.push(room);
        return room;
    },
    openPartyChatRoom() {
        // Check if party chat already exists
        const existingPartyChat = chatStore.chatRooms.find((room) => room.type === "party");
        if (existingPartyChat) {
            return existingPartyChat;
        }

        const partyRoom: ChatRoom = {
            id: "party",
            name: "Party",
            color: "#f97316",
            type: "party",
            members: [],
            messages: [
                {
                    userId: "System",
                    userName: "System",
                    text: "Welcome to party chat! Use this to coordinate with your party members.",
                    timestamp: Date.now(),
                },
            ],
            unreadMessages: 0,
            closeable: false,
        };
        chatStore.chatRooms.push(partyRoom);
        return partyRoom;
    },
    closePartyChatRoom() {
        chatStore.chatRooms = chatStore.chatRooms.filter((room) => room.type !== "party");
    },
};

// For debugging purposes
// window.chatActions = chatActions;
