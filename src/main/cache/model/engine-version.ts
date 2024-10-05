import { LuaOptionSection } from "@main/content/model/lua-options";
import { Insertable, JSONColumnType, Selectable } from "kysely";

export interface EngineVersionTable {
    id: string;
    lastLaunched: Date;
    ais: JSONColumnType<EngineAI[]>;
}

export interface EngineAI {
    name: string;
    shortName: string;
    version: string;
    description: string;
    options: LuaOptionSection[];
}

export type EngineVersion = Selectable<EngineVersionTable>;
