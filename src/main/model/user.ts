export type User = {
    userId: number;
    username: string;
    icons: Record<string, string>;
    isBot: boolean;
    clanId: number | null;
    countryCode: string;
    isOnline: boolean;
    battleStatus: BattleStatus;
    teamId?: number;
};

export function isUser(user: any): user is User {
    return "username" in user;
}

export type CurrentUser = User & {
    permissions: Set<string>;
    friendUserIds: Set<number>;
    outgoingFriendRequestUserIds: Set<number>;
    incomingFriendRequestUserIds: Set<number>;
    ignoreUserIds: Set<number>;
};

export type BattleStatus = {
    away: boolean;
    inBattle: boolean;
    battleId: number | null;
    isSpectator: boolean;
    ready: boolean;
    /* each sync property denotes the downloaded percentage of the map */
    sync: {
        engine: number;
        game: number;
        map: number;
    };
};
