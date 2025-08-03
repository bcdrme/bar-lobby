// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { User } from "@main/model/user";
import { db } from "@renderer/store/db";
import { tachyonStore } from "@renderer/store/tachyon.store";
import { reactive } from "vue";

export const usersStore = reactive<{
    isInitialized: boolean;
    isFriendListOpen: boolean;
}>({
    isInitialized: false,
    isFriendListOpen: false,
});

export function initUsersStore() {
    if (usersStore.isInitialized) return;

    window.tachyon.onEvent("user/updated", (event) => {
        console.debug(`Received user/updated event: ${JSON.stringify(event)}`);
        event.users.forEach((user) => {
            if (!user.userId) {
                console.warn("Received user/updated event with no userId, skipping update.");
                return;
            }
            db.users.update(user.userId, {
                ...user,
            });
        });
    });

    if (tachyonStore.isConnected) friends.fetchFriends();

    usersStore.isInitialized = true;
}

export const friends = {
    async fetchFriends() {
        const { data } = await window.tachyon.request("friend/list");
        const friends = await Promise.all(
            data.friends.map((friend) => {
                return window.tachyon.request("user/info", { userId: friend.userId }).then(
                    ({ data: userData }) =>
                        ({
                            ...userData,
                            isFriend: 1,
                            isMe: 0,
                            battleRoomState: {},
                        }) as User
                );
            })
        );
        db.users.bulkPut(friends);
        // Waiting on https://github.com/beyond-all-reason/tachyon/pull/64 and a new Tachyon release
        // window.tachyon.request("user/subscribeUpdates", { userIds: [...data.friends.map((f) => f.userId)] });
    },
    toggleFriendList() {
        usersStore.isFriendListOpen = !usersStore.isFriendListOpen;
    },
    async acceptInvite(userId: string) {
        await window.tachyon.request("friend/acceptRequest", { from: userId });
        const { data } = await window.tachyon.request("user/info", { userId });
        db.users.update(userId, { ...data, isFriend: 1 });
    },
    async sendInvite(userId: string) {
        await window.tachyon.request("friend/sendRequest", { to: userId });
    },
};
