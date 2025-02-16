import { reactive } from "vue";

export interface ChatRoom {
    id: string;
    name: string;
    color: string;
    type: "room" | "player";
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
        id: WellKnownChatRooms.General,
        name: "General",
        color: "#87ceeb",
        type: "room",
        messages: [{ userId: "System", userName: "System", text: "Welcome to the chat!", timestamp: Date.now() }],
        members: [],
        unreadMessages: 0,
        closeable: false,
    },
    {
        id: WellKnownChatRooms.Lobby,
        name: "Lobby",
        color: "#87ceeb",
        type: "room",
        messages: [
            { userId: "System", userName: "System", text: "Welcome to the lobby!", timestamp: Date.now() - 1000 * 60 * 60 },
            { userId: "System", userName: "System", text: "This is a place to chat with other players.", timestamp: Date.now() - 1000 * 60 * 60 },
            { userId: "System", userName: "System", text: "Please be respectful and follow the rules.", timestamp: Date.now() - 1000 * 60 },
            { userId: "System", userName: "System", text: "Enjoy your stay!", timestamp: Date.now() },
        ],
        members: ["smile2", "Banana", "Apple", "Grape", "Kiwi", "Pineapple"],
        unreadMessages: 4,
        closeable: false,
    },
    {
        id: "101",
        name: "Melon",
        color: "#ff6347",
        type: "player",
        messages: [{ userId: "101", userName: "Melon", text: "Welcome to the Melon chat!", timestamp: Date.now() }],
        members: [],
        unreadMessages: 1,
        closeable: true,
    },
];

export const chatStore = reactive<{ chatRooms: ChatRoom[]; selectedChatRoom: ChatRoom; isInitialized?: boolean }>({
    chatRooms: defaultChatRooms,
    selectedChatRoom: defaultChatRooms.at(0),
    isInitialized: false,
});

export function initChatStore() {
    window.tachyon.onEvent("messaging/received", async (data) => {
        console.debug(`Received message: ${JSON.stringify(data)}`);
        const { message, source } = data;
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
        chatStore.selectedChatRoom = chatStore.chatRooms.find((room) => room.id === id);
        chatStore.selectedChatRoom.unreadMessages = 0;
    },
    async sendMessage(message: ChatMessage) {
        //TODO change this when we have room support in protocol
        if (chatStore.selectedChatRoom.type === "player") {
            const repsonse = await window.tachyon.request("messaging/send", { message: message.text, target: { type: chatStore.selectedChatRoom.type, userId: chatStore.selectedChatRoom.id } });
            if (repsonse.status === "success") {
                message.failed = false;
            } else {
                message.failed = true;
            }
        }
        chatStore.selectedChatRoom.messages.push(message);
    },
    addMessage(roomId: string, message: ChatMessage) {
        const room = chatStore.chatRooms.find((room) => room.id === roomId);
        if (room) {
            room.messages.push(message);
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
};

// For debugging purposes
// window.chatActions = chatActions;
