// Returns the ISO string for the date that was exactly one week ago from the current date
export function oneWeekAgo() {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    return now.toISOString();
}