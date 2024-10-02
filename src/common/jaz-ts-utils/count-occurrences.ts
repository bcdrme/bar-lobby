export function countOccurrences<T, K extends keyof T>(arr: T[], key: K): Array<{ value: T[K]; count: number }> {
    const counts: Array<{ value: T[K]; count: number }> = [];
    for (const record of arr) {
        const count = counts.find((count) => count.value === record[key]);
        if (count) {
            count.count++;
        } else {
            counts.push({ value: record[key], count: 1 });
        }
    }
    counts.sort((a, b) => b.count - a.count);
    return counts;
}
