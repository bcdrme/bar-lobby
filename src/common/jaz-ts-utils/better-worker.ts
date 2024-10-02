import { WorkerWrapper } from "$/jaz-ts-utils/worker-wrapper";

export class BetterWorker extends WorkerWrapper {
    constructor(protected debug = false) {
        super();

        addEventListener("message", (event) => this.onMessage(event));

        if (this.debug) {
            process.on("warning", (err) => {
                console.warn(err.stack);
            });

            process.on("uncaughtException", (err) => {
                console.warn(err.stack);
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override send(channel: string, data?: any) {
        postMessage({ channel, data });
    }
}
