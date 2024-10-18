export type BattleOptions = {
    title: string;
    engineVersion: string;
    gameVersion: string;
    map: string;
    startPosType: StartPosType;
    startBoxes: Record<number, StartBox>;
    gameOptions: Record<string, string | number | boolean>;
    mapOptions: Record<string, string | number | boolean>;
    restrictions: Restriction[];
};

export type SpadsBattleOptions = {
    id: number;
    isHost: boolean;
    passworded: boolean;
    password: string | null;
    scriptPassword: string | null;
    founderId: number;
    ip: string | null;
    port: number | null;
    locked: boolean;
    maxPlayers: number;
    preset: string;
    joinQueueUserIds: number[];
    autoBalance: string;
    teamSize: number;
    nbTeams: number;
    balanceMode: string;
};

export type StartBox = {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
};

export enum StartPosType {
    Fixed = 0,
    Random = 1,
    Boxes = 2,
}

export enum Faction {
    Armada = "Armada",
    Cortex = "Cortex",
    Legion = "Legion",
    Raptors = "Raptors",
    Scavengers = "Scavengers",
}

export enum TeamPreset {
    Standard,
    FFA,
    TeamFFA,
    Custom,
}

export type Restriction = {
    unitDefId: string;
    limit: number;
};

export type BattleContenderConfig = {
    playerId: number;
    teamId: number;
    startPos?: { x: number; z: number };
    handicap?: number;
    advantage?: number;
    incomeMultiplier?: number;
    color?: string;
};

export type Bot = {
    playerId: number;
    ownerUserId: number;
    aiShortName: string; // TODO: point directly to AI obj and object.freeze it?
    name: string;
    aiOptions: Record<string, unknown>;
    battleStatus: {
        faction?: Faction;
        teamId: number;
    };
};

export function isBot(bot: any): bot is Bot {
    return "ownerUserId" in bot;
}
