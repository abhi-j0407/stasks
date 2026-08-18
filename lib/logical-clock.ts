const TIME_ZONE = "Asia/Kolkata";
const CUT_HOUR = 4;

const kolkataPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  const value = parts.find((entry) => entry.type === type)?.value;
  if (!value) {
    throw new Error(`Missing ${type} in Kolkata date parts`);
  }
  return value;
}

function isoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addCalendarDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return isoDate(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

export function logicalDate(now: Date = new Date()): string {
  const parts = kolkataPartsFormatter.formatToParts(now);
  const year = Number(part(parts, "year"));
  const month = Number(part(parts, "month"));
  const day = Number(part(parts, "day"));
  const hour = Number(part(parts, "hour"));
  const calendar = isoDate(year, month, day);

  if (hour < CUT_HOUR) {
    return addCalendarDays(calendar, -1);
  }

  return calendar;
}

export function logicalTomorrow(now: Date = new Date()): string {
  return addCalendarDays(logicalDate(now), 1);
}

const captionFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatCaptionDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return captionFormatter
    .format(new Date(Date.UTC(year, month - 1, day)))
    .replace(",", "");
}
