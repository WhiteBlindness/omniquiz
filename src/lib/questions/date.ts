const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export const isIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};

export const getUtcDateKey = (timestamp = Date.now()): string =>
  new Date(timestamp).toISOString().slice(0, 10);

export const offsetIsoDate = (date: string, offsetDays: number): string => {
  if (!isIsoDate(date)) throw new RangeError("date must be an ISO date");
  if (!Number.isInteger(offsetDays)) throw new RangeError("offsetDays must be an integer");

  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + offsetDays);
  return getUtcDateKey(parsed.valueOf());
};

export const getUtcDayOfYear = (isoDate: string): number => {
  if (!isIsoDate(isoDate)) throw new RangeError("date must be an ISO date");

  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - yearStart) / DAY_MS);
};
