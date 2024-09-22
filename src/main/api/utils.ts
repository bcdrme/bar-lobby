import { ipcRenderer } from "electron";

export declare class Signal<T = any> {
    bindings: Array<SignalBinding<T>>;
    add(callback: (data: T) => void): SignalBinding<T>;
    addOnce(callback: (data: T) => void): SignalBinding<T>;
    dispatch(data?: T): void;
    dispose(bindingToDispose: SignalBinding): void;
    disposeAll(): void;
}
export declare class SignalBinding<T = any> {
    protected signal: Signal;
    protected listener?: ((data: T) => void) | undefined;
    protected destroyAfterExecute: boolean;
    constructor(signal: Signal, listener?: ((data: T) => void) | undefined, destroyAfterExecute?: boolean);
    execute(data: T): void;
    destroy(): void;
}


export class UtilsAPI {
    public readonly onRightClick = new Signal();
    public readonly onLeftClick = new Signal();

    public flashFrame(flag: boolean) {
        return ipcRenderer.invoke("flashFrame", flag);
    }
}
