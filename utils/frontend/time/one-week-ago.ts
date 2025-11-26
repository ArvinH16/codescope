export default function oneWeekAgo() {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    return now.toISOString();
}