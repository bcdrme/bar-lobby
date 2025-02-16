import { reactive } from "vue";

export const drawerStore = reactive<{
    isOpen: boolean;
    state: "main" | "ranked" | "custom";
}>({
    isOpen: false,
    state: "main",
});
