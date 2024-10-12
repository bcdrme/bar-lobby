export type GameVersion = {
    id: string;
    md5: string;
    lastLaunched: Date;
    ais: GameAI[];
};

export interface GameAI {
    name: string;
    description: string;
}

export type CustomGameVersion = {
    id: string;
    dir: string;
    ais: GameAI[];
};
