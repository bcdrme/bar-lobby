import { randomFromArray } from "$/jaz-ts-utils";
import { StartPosType } from "@main/game/battle/battle-types";
import { OfflineBattle } from "@main/game/battle/offline-battle";

import { defaultMaps } from "@renderer/config/default-maps";
import { defaultEngineVersion, defaultGameVersion } from "@renderer/config/default-versions";
import { defaultMapBoxes } from "@renderer/utils/start-boxes";

export function defaultBattle(mapScriptName?: string) {
    const me = api.session.offlineUser;
    const map = mapScriptName ?? randomFromArray(defaultMaps)!;

    me.battleStatus.playerId = 0;
    me.battleStatus.teamId = 0;
    me.battleStatus.isSpectator = false;

    const engine = api.content.engine.installedVersions.find((version) => version.id === defaultEngineVersion);
    const barb = engine?.ais.find((ai) => ai.shortName === "BARb");

    return new OfflineBattle({
        battleOptions: {
            title: "Offline Custom Battle",
            startTime: null,
            engineVersion: defaultEngineVersion,
            gameVersion: defaultGameVersion,
            map: map,
            startPosType: StartPosType.Boxes,
            startBoxes: defaultMapBoxes(map),
            gameOptions: {},
            mapOptions: {},
            restrictions: [],
        },
        users: [me],
        bots: barb ? [{ playerId: 1, teamId: 1, ownerUserId: me.userId, name: barb.name, aiShortName: barb.shortName, aiOptions: {} }] : [],
    });
}
