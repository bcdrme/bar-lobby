import { infosStore } from "@renderer/store/infos.store";

export const useTimestampFormatter = () => {
    const locale = infosStore.locale;

    const formatFull = (timestamp: number) => {
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(timestamp);
    };

    const formatHourMin = (timestamp: number) => {
        return new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
        }).format(timestamp);
    };

    return { formatFull, formatHourMin };
};
