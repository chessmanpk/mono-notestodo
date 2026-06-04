import { addMonths, endOfMonth, startOfMonth } from "date-fns";

export function getMonthInfo(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    start: startOfMonth(date),
    end: endOfMonth(date),
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
  };
}

export function getPreviousMonthInfo(date = new Date()) {
  return getMonthInfo(addMonths(date, -1));
}

export function getNextDueDate(dueDate: Date | null | undefined, recurringType: string) {
  if (!dueDate) return null;
  const date = new Date(dueDate);

  if (recurringType === "daily") date.setDate(date.getDate() + 1);
  if (recurringType === "weekly") date.setDate(date.getDate() + 7);
  if (recurringType === "monthly") date.setMonth(date.getMonth() + 1);

  return date;
}

export function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
