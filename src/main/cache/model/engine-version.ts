import { Selectable } from "kysely";

import { LuaOptionSection } from "@renderer/model/lua-options";

export type EngineVersionTable = {
    id: string;
    lastLaunched: Date;
    ais: EngineAI[];
};

export type EngineAI = {
    name: string;
    shortName: string;
    version: string;
    description: string;
    options: LuaOptionSection[];
};

export type EngineVersion = Selectable<EngineVersionTable>;
