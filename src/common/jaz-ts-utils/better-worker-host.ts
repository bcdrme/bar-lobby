/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkerWrapper } from "$/jaz-ts-utils/worker-wrapper";

export class BetterWorkerHost extends WorkerWrapper {
    protected worker: Worker;

    // would be nice if it were possible to pass the worker filepath and initialise it internally,
    // but doesn't seem to play nice with webpack/electron
    constructor(worker: Worker) {
        super();
        this.worker = worker;
        this.worker.onmessage = (event) => this.onMessage(event);

        this.worker.addEventListener("error", (err) => {
            console.error("Worker error", err);
        });
    }

    public override send(channel: string, data?: any) {
        this.worker.postMessage({ channel, data });
    }
}
