// mobile/src/utils/dateFormatter.ts

// ============================================================
// TYPES
// ============================================================

export type DateFormatStyle =
  | 'short'
  | 'medium'
  | 'long'
  | 'full';

export type TimeFormatStyle =
  | '12h'
  | '24h';

export type RelativeTimeUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

export interface DateFormatOptions {
  locale?: string;

  style?: DateFormatStyle;

  includeTime?: boolean;

  timeStyle?: TimeFormatStyle;

  timeZone?: string;
}

export interface DateRange {
  startDate: Date;

  endDate: Date;
}

export interface FormattedDate {
  date: string;

  time: string;

  dateTime: string;

  relative: string;

  isValid: boolean;
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_LOCALE = 'en-ET';

const DEFAULT_DATE_STYLE: DateFormatStyle = 'medium';

const DEFAULT_TIME_STYLE: TimeFormatStyle = '12h';

// ============================================================
// DATE CONVERSION
// ============================================================

export function toDate(
  value: Date | string | number,
): Date | null {
  try {
    const date = value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

// ============================================================
// DATE VALIDATION
// ============================================================

export function isValidDate(
  value: unknown,
): value is Date | string | number {
  if (
    !(value instanceof Date) &&
    typeof value !== 'string' &&
    typeof value !== 'number'
  ) {
    return false;
  }

  if (typeof value === 'string' && !value.trim()) {
    return false;
  }

  return toDate(value) !== null;
}

// ============================================================
// FORMAT DATE
// ============================================================

export function formatDate(
  value: Date | string | number,
  options: DateFormatOptions = {},
): string {
  const date = toDate(value);

  if (!date) {
    return 'Invalid date';
  }

  const {
    locale = DEFAULT_LOCALE,
    style = DEFAULT_DATE_STYLE,
    timeZone,
  } = options;

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: style,
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

// ============================================================
// FORMAT TIME
// ============================================================

export function formatTime(
  value: Date | string | number,
  style: TimeFormatStyle = DEFAULT_TIME_STYLE,
  locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);

  if (!date) {
    return 'Invalid time';
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: style === '12h',
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

// ============================================================
// FORMAT DATE AND TIME
// ============================================================

export function formatDateTime(
  value: Date | string | number,
  options: DateFormatOptions = {},
): string {
  const date = toDate(value);

  if (!date) {
    return 'Invalid date';
  }

  const {
    locale = DEFAULT_LOCALE,
    style = DEFAULT_DATE_STYLE,
    timeStyle = DEFAULT_TIME_STYLE,
    timeZone,
  } = options;

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: style,
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeStyle === '12h',
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

// ============================================================
// FORMAT DATE FOR API
// ============================================================

export function formatDateForApi(
  value: Date | string | number,
): string | null {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  return date.toISOString();
}

// ============================================================
// FORMAT DATE ONLY FOR API
// ============================================================

export function formatDateOnlyForApi(
  value: Date | string | number,
): string | null {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ============================================================
// RELATIVE TIME
// ============================================================

export function formatRelativeTime(
  value: Date | string | number,
  locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);

  if (!date) {
    return 'Unknown time';
  }

  const difference =
    date.getTime() - Date.now();

  const seconds =
    Math.round(difference / 1000);

  const minutes =
    Math.round(seconds / 60);

  const hours =
    Math.round(minutes / 60);

  const days =
    Math.round(hours / 24);

  const weeks =
    Math.round(days / 7);

  const months =
    Math.round(days / 30);

  const years =
    Math.round(days / 365);

  const formatter = new Intl.RelativeTimeFormat(
    locale,
    {
      numeric: 'auto',
      style: 'long',
    },
  );

  if (Math.abs(seconds) < 60) {
    return formatter.format(seconds, 'second');
  }

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute');
  }

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, 'hour');
  }

  if (Math.abs(days) < 7) {
    return formatter.format(days, 'day');
  }

  if (Math.abs(weeks) < 5) {
    return formatter.format(weeks, 'week');
  }

  if (Math.abs(months) < 12) {
    return formatter.format(months, 'month');
  }

  return formatter.format(years, 'year');
}

// ============================================================
// SHORT RELATIVE TIME
// ============================================================

export function formatShortRelativeTime(
  value: Date | string | number,
): string {
  const date = toDate(value);

  if (!date) {
    return 'Unknown';
  }

  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000,
  );

  if (seconds < 0) {
    return 'In the future';
  }

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks}w ago`;
  }

  return formatDate(date, {
    style: 'medium',
  });
}

// ============================================================
// FORMAT NOTIFICATION DATE
// ============================================================

export function formatNotificationDate(
  value: Date | string | number,
): string {
  const date = toDate(value);

  if (!date) {
    return 'Unknown date';
  }

  const today = new Date();

  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return `Today, ${formatTime(date)}`;
  }

  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${formatTime(date)}`;
  }

  return formatDateTime(date);
}

// ============================================================
// SAME DAY CHECK
// ============================================================

export function isSameDay(
  first: Date | string | number,
  second: Date | string | number,
): boolean {
  const firstDate = toDate(first);

  const secondDate = toDate(second);

  if (!firstDate || !secondDate) {
    return false;
  }

  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth() &&
    firstDate.getDate() ===
      secondDate.getDate()
  );
}

// ============================================================
// SAME MONTH CHECK
// ============================================================

export function isSameMonth(
  first: Date | string | number,
  second: Date | string | number,
): boolean {
  const firstDate = toDate(first);

  const secondDate = toDate(second);

  if (!firstDate || !secondDate) {
    return false;
  }

  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth()
  );
}

// ============================================================
// SAME YEAR CHECK
// ============================================================

export function isSameYear(
  first: Date | string | number,
  second: Date | string | number,
): boolean {
  const firstDate = toDate(first);

  const secondDate = toDate(second);

  if (!firstDate || !secondDate) {
    return false;
  }

  return (
    firstDate.getFullYear() ===
    secondDate.getFullYear()
  );
}

// ============================================================
// CHECK TODAY
// ============================================================

export function isToday(
  value: Date | string | number,
): boolean {
  return isSameDay(value, new Date());
}

// ============================================================
// CHECK YESTERDAY
// ============================================================

export function isYesterday(
  value: Date | string | number,
): boolean {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  return isSameDay(value, yesterday);
}

// ============================================================
// CHECK FUTURE DATE
// ============================================================

export function isFutureDate(
  value: Date | string | number,
): boolean {
  const date = toDate(value);

  return date !== null && date.getTime() > Date.now();
}

// ============================================================
// CHECK PAST DATE
// ============================================================

export function isPastDate(
  value: Date | string | number,
): boolean {
  const date = toDate(value);

  return date !== null && date.getTime() < Date.now();
}

// ============================================================
// ADD DAYS
// ============================================================

export function addDays(
  value: Date | string | number,
  days: number,
): Date | null {
  const date = toDate(value);

  if (!date || !Number.isFinite(days)) {
    return null;
  }

  date.setDate(date.getDate() + days);

  return date;
}

// ============================================================
// SUBTRACT DAYS
// ============================================================

export function subtractDays(
  value: Date | string | number,
  days: number,
): Date | null {
  return addDays(value, -days);
}

// ============================================================
// ADD MONTHS
// ============================================================

export function addMonths(
  value: Date | string | number,
  months: number,
): Date | null {
  const date = toDate(value);

  if (!date || !Number.isFinite(months)) {
    return null;
  }

  const originalDay = date.getDate();

  date.setDate(1);

  date.setMonth(date.getMonth() + months);

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  date.setDate(
    Math.min(originalDay, lastDay),
  );

  return date;
}

// ============================================================
// START OF DAY
// ============================================================

export function startOfDay(
  value: Date | string | number,
): Date | null {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

// ============================================================
// END OF DAY
// ============================================================

export function endOfDay(
  value: Date | string | number,
): Date | null {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  date.setHours(23, 59, 59, 999);

  return date;
}

// ============================================================
// START OF MONTH
// ============================================================

export function startOfMonth(
  value: Date | string | number,
): Date | null {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  date.setDate(1);

  date.setHours(0, 0, 0, 0);

  return date;
}

// ============================================================
// END OF MONTH
// ============================================================

export function endOfMonth(
  value: Date | string | number,
): Date | null {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  date.setMonth(date.getMonth() + 1, 0);

  date.setHours(23, 59, 59, 999);

  return date;
}

// ============================================================
// DAYS BETWEEN TWO DATES
// ============================================================

export function getDaysBetween(
  first: Date | string | number,
  second: Date | string | number,
): number | null {
  const firstDate = toDate(first);

  const secondDate = toDate(second);

  if (!firstDate || !secondDate) {
    return null;
  }

  const difference = Math.abs(
    secondDate.getTime() - firstDate.getTime(),
  );

  return Math.floor(
    difference / (1000 * 60 * 60 * 24),
  );
}

// ============================================================
// MINUTES BETWEEN TWO DATES
// ============================================================

export function getMinutesBetween(
  first: Date | string | number,
  second: Date | string | number,
): number | null {
  const firstDate = toDate(first);

  const secondDate = toDate(second);

  if (!firstDate || !secondDate) {
    return null;
  }

  return Math.floor(
    Math.abs(
      secondDate.getTime() - firstDate.getTime(),
    ) / 60000,
  );
}

// ============================================================
// CHECK DATE RANGE
// ============================================================

export function isWithinDateRange(
  value: Date | string | number,
  range: DateRange,
): boolean {
  const date = toDate(value);

  const start = toDate(range.startDate);

  const end = toDate(range.endDate);

  if (!date || !start || !end) {
    return false;
  }

  return (
    date.getTime() >= start.getTime() &&
    date.getTime() <= end.getTime()
  );
}

// ============================================================
// GET AGE OF ITEM REPORT
// ============================================================

export function getReportAge(
  createdAt: Date | string | number,
): string {
  return formatRelativeTime(createdAt);
}

// ============================================================
// GET FORMATTED DATE OBJECT
// ============================================================

export function getFormattedDate(
  value: Date | string | number,
): FormattedDate {
  const date = toDate(value);

  if (!date) {
    return {
      date: 'Invalid date',
      time: 'Invalid time',
      dateTime: 'Invalid date',
      relative: 'Unknown time',
      isValid: false,
    };
  }

  return {
    date: formatDate(date),

    time: formatTime(date),

    dateTime: formatDateTime(date),

    relative: formatRelativeTime(date),

    isValid: true,
  };
}

// ============================================================
// GET WEEKDAY NAME
// ============================================================

export function getWeekdayName(
  value: Date | string | number,
  locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);

  if (!date) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
  }).format(date);
}

// ============================================================
// GET MONTH NAME
// ============================================================

export function getMonthName(
  value: Date | string | number,
  locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);

  if (!date) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
  }).format(date);
}

// ============================================================
// GET CURRENT DATE
// ============================================================

export function getCurrentDate(): Date {
  return new Date();
}

// ============================================================
// GET CURRENT DATE FOR API
// ============================================================

export function getCurrentDateForApi(): string {
  return new Date().toISOString();
}

// ============================================================
// GET CURRENT YEAR
// ============================================================

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// ============================================================
// GET CURRENT MONTH
// ============================================================

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

// ============================================================
// EXPORT CONSTANTS
// ============================================================

export const DATE_FORMAT_DEFAULTS = {
  locale: DEFAULT_LOCALE,
  dateStyle: DEFAULT_DATE_STYLE,
  timeStyle: DEFAULT_TIME_STYLE,
} as const;