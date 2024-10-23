// model for https://maps-metadata.beyondallreason.dev/latest/map_list.validated.json

export interface OnlineMap {
    author: string;
    backgroundImage: ImageData[];
    certified: boolean;
    description: string;
    displayName: string;
    gameType: string[];
    inGameShots: any[];
    inPool: boolean;
    mapLists: string[];
    minPlayerCount: number;
    perspectiveShot: any[];
    photo: ImageData[];
    playerCount: number;
    special: string;
    springName: string;
    startPos: StartPosition;
    startPosActive: boolean;
    startboxesSet: StartboxesSet;
    teamCount: number;
    terrain: string[];
}

interface ImageData {
    downloadURL: string;
    lastModifiedTS: number;
    name: string;
    ref: string;
    type: string;
}

interface StartPosition {
    positions: { [key: string]: Coordinates };
    team: Team[];
}

interface Coordinates {
    x: number;
    y: number;
}

interface Team {
    playersPerTeam: number;
    sides: Side[];
    teamCount: number;
}

interface Side {
    starts: SpawnPoint[];
}

interface SpawnPoint {
    role: string;
    spawnPoint: string;
}

interface StartboxesSet {
    [key: string]: StartboxDetails;
}

interface StartboxDetails {
    maxPlayersPerStartbox: number;
    startboxes: Startbox[];
}

interface Startbox {
    poly: Coordinates[];
}
