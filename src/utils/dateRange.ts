export interface MonthOption {
  year: number;
  month: number; // 1 - 12
  id: string; // "2026-09"
  monthName: string; // "Setembro"
  label: string; // "Setembro/2026"
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Returns the last 12 months starting from current month down to 11 months ago in descending order.
 * E.g.: Setembro/2026, Agosto/2026, ..., Outubro/2025.
 */
export const getLast12Months = (baseDate: Date = new Date()): MonthOption[] => {
  const months: MonthOption[] = [];
  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth(); // 0-indexed

  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const monthName = MONTH_NAMES_PT[m - 1];
    months.push({
      year: y,
      month: m,
      id: `${y}-${String(m).padStart(2, '0')}`,
      monthName,
      label: `${monthName}/${y}`,
    });
  }
  return months;
};

/**
 * Format date as YYYY-MM-DD
 */
const formatDate = (year: number, month1To12: number, day: number): string => {
  return `${year}-${String(month1To12).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Builds the JQL condition for created OR resolved based on dateRange (e.g. "2026-09" or "all").
 */
export const buildDateRangeJql = (
  dateRange: string,
  baseDate: Date = new Date()
): string | null => {
  if (!dateRange) return null;

  if (dateRange === 'all') {
    const months = getLast12Months(baseDate);
    if (months.length === 0) return null;
    const oldest = months[months.length - 1];
    const newest = months[0];

    const startDate = formatDate(oldest.year, oldest.month, 1);
    const nextMonthOfNewest = new Date(newest.year, newest.month, 1);
    const endDate = formatDate(
      nextMonthOfNewest.getFullYear(),
      nextMonthOfNewest.getMonth() + 1,
      1
    );

    return `((created >= "${startDate}" AND created < "${endDate}") OR (resolved >= "${startDate}" AND resolved < "${endDate}"))`;
  }

  // Expecting format "YYYY-MM"
  const [yStr, mStr] = dateRange.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);

  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return null;

  const startDate = formatDate(y, m, 1);
  const nextMonthDate = new Date(y, m, 1);
  const endDate = formatDate(
    nextMonthDate.getFullYear(),
    nextMonthDate.getMonth() + 1,
    1
  );

  return `((created >= "${startDate}" AND created < "${endDate}") OR (resolved >= "${startDate}" AND resolved < "${endDate}"))`;
};
