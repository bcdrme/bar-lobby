import pino from "pino";
import PinoPretty from "pino-pretty";

const stream = PinoPretty({
    messageFormat: "{filename} - {msg}",
    ignore: "pid,hostname,filename",
    colorize: true,
});
const parentLogger = pino(stream);

export function logger(filename: string) {
    return parentLogger.child(
        { filename },
        {
            level: "debug",
        }
    );
}
