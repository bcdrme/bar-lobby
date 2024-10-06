import { Signal } from "$/jaz-ts-utils/signal";

class UtilsAPI {
    public readonly onRightClick = new Signal();
    public readonly onLeftClick = new Signal();
}

export const utilsApi = new UtilsAPI();
