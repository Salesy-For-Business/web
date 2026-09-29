export type TimeBucket = "day" | "week" | "month";

export const REPORTING_TIMEZONE = "Africa/Lagos";
/** Lagos has no DST, so a fixed offset is enough to line JS buckets up with Mongo's. */
const TZ_OFFSET_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the bucket containing `date`, as the UTC instant of local midnight. */
export function truncateToBucket(date: Date, unit: TimeBucket): Date {
  const local = new Date(date.getTime() + TZ_OFFSET_MS);
  let y = local.getUTCFullYear();
  let m = local.getUTCMonth();
  let d = local.getUTCDate();
  if (unit === "month") d = 1;
  if (unit === "week") {
    const weekday = (local.getUTCDay() + 6) % 7;
    const monday = new Date(Date.UTC(y, m, d - weekday));
    y = monday.getUTCFullYear();
    m = monday.getUTCMonth();
    d = monday.getUTCDate();
  }
  return new Date(Date.UTC(y, m, d) - TZ_OFFSET_MS);
}

export function nextBucket(date: Date, unit: TimeBucket): Date {
  if (unit === "day") return new Date(date.getTime() + DAY_MS);
  if (unit === "week") return new Date(date.getTime() + 7 * DAY_MS);
  const local = new Date(date.getTime() + TZ_OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1) - TZ_OFFSET_MS,
  );
}

/** `YYYY-MM-DD` of the bucket start in reporting time — matches `bucketKeyExpr`. */
export function bucketKey(date: Date) {
  return new Date(date.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
}

/** Aggregation expression producing the same key as `bucketKey` for a date field. */
export function bucketKeyExpr(field: string, unit: TimeBucket) {
  return {
    $dateToString: {
      format: "%Y-%m-%d",
      timezone: REPORTING_TIMEZONE,
      date: {
        $dateTrunc: {
          date: field,
          unit,
          timezone: REPORTING_TIMEZONE,
          ...(unit === "week" ? { startOfWeek: "monday" } : {}),
        },
      },
    },
  };
}

/** Every bucket key from `start` up to (not including) `end`. */
export function bucketKeys(start: Date, end: Date, unit: TimeBucket): string[] {
  const keys: string[] = [];
  for (let at = truncateToBucket(start, unit); at < end; at = nextBucket(at, unit)) {
    keys.push(bucketKey(at));
  }
  return keys;
}
