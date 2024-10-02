import { intervalToDuration } from "date-fns";

export function getFriendlyDuration(durationMs: number, withSeconds = true) {
    const durationValues = intervalToDuration({ start: 0, end: durationMs });
    const result = `${durationValues.hours}:${durationValues.minutes?.toString().padStart(2, "0")}`;
    if (withSeconds) {
        return result + `:${durationValues.seconds?.toString().padStart(2, "0")}`;
    }
    return result;
}
