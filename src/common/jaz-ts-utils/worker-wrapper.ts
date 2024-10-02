/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal } from "$/jaz-ts-utils/signal";

export interface WorkerMessage {
    channel: string;
    data: any;
}

export abstract class WorkerWrapper {
    protected messageHandlers: { [channel: string]: Signal<any> } = {};

    public send(channel: string, data?: any): void {
        //
    }

    public on(channel: string): Signal<any> {
        if (!this.messageHandlers[channel]) {
            this.messageHandlers[channel] = new Signal();
        }

        return this.messageHandlers[channel];
    }

    public invoke(channel: string, data?: any) {
        return new Promise<any>((resolve) => {
            this.on(channel).addOnce((data: any) => resolve(data));
            this.send(channel, data);
        });
    }

    protected onMessage(event: MessageEvent): void {
        const workerMessage: WorkerMessage = event.data;
        if (this.messageHandlers[workerMessage.channel]) {
            this.messageHandlers[workerMessage.channel].dispatch(workerMessage.data);
        }
    }
}
