import { LuaOptionSection } from "@main/content/model/lua-options";
import { JSONColumnType, Selectable } from "kysely";

export type EngineVersionTable = {
    id: string;
    lastLaunched: Date;
    ais: JSONColumnType<EngineAI[]>;
};

export type EngineAI = {
    name: string;
    shortName: string;
    version: string;
    description: string;
    options: LuaOptionSection[];
};

export type EngineVersion = Selectable<EngineVersionTable>;
