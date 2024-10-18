import { CurrentUser } from "@main/model/user";
import { reactive } from "vue";

export const me = reactive({
    username: "Player",
    battleStatus: {
        ready: false,
        sync: {
            engine: 0,
            game: 0,
            map: 0,
        },
        teamId: -1,
    },
} as CurrentUser);
