import { User } from "@main/model/user";
import { db } from "@renderer/store/db";
import { reactive } from "vue";

export const usersStore = reactive<{ isInitialized: boolean; isFriendListOpen: boolean; invites: User[] }>({ isInitialized: false, isFriendListOpen: false, invites: [] });

function insertFakeUsers() {
    const users = [
        {
            userId: "1",
            username: "user1",
            countryCode: "us",
            status: "offline",
            displayName: "User 1",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 0,
            lastSeen: Date.now() - 1000 * 60 * 60 * 6,
            bannerId: 1,
        },
        {
            userId: "2",
            username: "user2",
            countryCode: "us",
            status: "lobby",
            displayName: "User 2",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 0,
            lastSeen: Date.now() - 1000 * 60 * 60 * 12,
            bannerId: 2,
        },
        {
            userId: "3",
            username: "user3",
            countryCode: "us",
            status: "playing",
            displayName: "User 3",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 0,
            lastSeen: Date.now() - 1000 * 60 * 60 * 24,
            bannerId: 3,
        },
    ] as User[];
    db.users.bulkPut(users);
}

function insertFakeOnlineFriends() {
    const users = [
        {
            userId: "4",
            username: "user4",
            countryCode: "us",
            status: "menu",
            displayName: "User 4",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 1,
            lastSeen: Date.now(),
            bannerId: 4,
        },
        {
            userId: "5",
            username: "user5",
            countryCode: "us",
            status: "playing",
            displayName: "User 5",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 1,
            lastSeen: Date.now(),
            bannerId: 5,
        },
        {
            userId: "6",
            username: "user6",
            countryCode: "us",
            status: "lobby",
            displayName: "User 6",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 1,
            lastSeen: Date.now(),
            bannerId: 6,
        },
    ] as User[];
    db.users.bulkPut(users);
}

function insertFakeOfflineFriends() {
    const users = [
        {
            userId: "7",
            username: "user7",
            countryCode: "us",
            status: "offline",
            displayName: "User 7",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 1,
            lastSeen: Date.now() - 1000 * 60 * 60 * 6,
            bannerId: 1,
        },
        {
            userId: "8",
            username: "user8",
            countryCode: "us",
            status: "offline",
            displayName: "User 8",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 1,
            lastSeen: Date.now() - 1000 * 60 * 60 * 12,
            bannerId: 1,
        },
        {
            userId: "9",
            username: "user9",
            countryCode: "us",
            status: "offline",
            displayName: "User 9",
            clanId: null,
            partyId: null,
            battleRoomState: {},
            isMe: 0,
            isFriend: 1,
            lastSeen: Date.now() - 1000 * 60 * 60 * 24,
            bannerId: 1,
        },
    ] as User[];
    db.users.bulkPut(users);
}

// need a lot of work protocol side
// see https://github.com/beyond-all-reason/tachyon/blob/master/docs/schema/user.md
export function initUsersStore() {
    if (usersStore.isInitialized) return;
    window.tachyon.onEvent("user/updated", (event) => {
        console.debug(`Received user/updated event: ${JSON.stringify(event)}`);
        const users = event.users.map((user) => {
            return {
                userId: user.userId || "",
                username: user.username || "",
                countryCode: user.countryCode || "",
                status: user.status || "offline",
                displayName: user.displayName || "",
                clanId: user.clanId || null,
                battleRoomState: {},
                isMe: 1, // TODO unweirdify this after we have a proper protocol for users
                isFriend: 0, // TODO unweirdify this after we have a proper protocol for users
                lastSeen: Date.now(),
                bannerId: Math.floor(Math.random() * 6) + 1,
            } as User;
        });
        db.users.bulkPut(users);
    });

    insertFakeUsers();
    insertFakeOnlineFriends();
    insertFakeOfflineFriends();

    usersStore.isInitialized = true;
}

export const usersActions = {
    toggleFriendList() {
        usersStore.isFriendListOpen = !usersStore.isFriendListOpen;
    },
    acceptInvite(userId: string) {
        console.debug(`Accepting invite from user ${userId}`);
        usersStore.invites = usersStore.invites.filter((user) => user.userId !== userId);
        usersActions.addFriend(userId);
    },
    addInvite(user: User) {
        usersStore.invites.push(user);
    },
    addFriend(userId: string) {
        db.users.update(userId, { isFriend: 1 });
    },
};
