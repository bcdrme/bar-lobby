import { CurrentUser } from "@main/model/user";
import { reactive } from "vue";

export const me = reactive({
    userId: 0,
    isOnline: false,
    username: "Player",
} as CurrentUser);
