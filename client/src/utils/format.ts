import { format, isToday, isPast, parseISO, formatDistanceToNowStrict } from "date-fns";

export function niceDate(date?: string | null) {
  if (!date) return "No date";
  const parsed = parseISO(date);
  if (isToday(parsed)) return "Today";
  return format(parsed, "MMM d, yyyy");
}

export function timeAgo(date: string) {
  return formatDistanceToNowStrict(parseISO(date), { addSuffix: true });
}

export function isOverdue(date?: string | null) {
  if (!date) return false;
  const parsed = parseISO(date);
  return isPast(parsed) && !isToday(parsed);
}

export function toInputDate(date?: string | null) {
  if (!date) return "";
  return format(parseISO(date), "yyyy-MM-dd");
}
