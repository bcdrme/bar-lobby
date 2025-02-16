export type User = {
    userId: string;
    username: string;
    displayName: string;
    clanId: string | null;
    partyId: string | null;
    countryCode: string;
    rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    status: "offline" | "menu" | "playing" | "lobby";

    bannerId: number;

    // Is the user a friend?
    isFriend: 0 | 1;

    // Is the user me?
    isMe: 0 | 1;

    // Last time the user was seen by me (in a lobby, battle, etc)
    // last time this user was updated basically
    lastSeen: number;

    // When user is a contender in a battle
    battleRoomState: {
        isSpectator?: boolean;
        isReady?: boolean;
        teamId?: number;
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUser(user: any): user is User {
    return "username" in user;
}

type ExcludedFromMe = "isFriend" | "isMe" | "lastSeen";
export type Me = Omit<User, ExcludedFromMe> & {
    friendUserIds: Set<number>;
    outgoingFriendRequestUserIds: Set<number>;
    incomingFriendRequestUserIds: Set<number>;
    ignoreUserIds: Set<number>;
};
