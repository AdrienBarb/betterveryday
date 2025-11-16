import { DateTime } from "luxon";

/**
 * Get the current hour (0-23) in a specific timezone
 */
export function getCurrentHourInTimezone(timezone: string): number {
  return DateTime.now().setZone(timezone).hour;
}

/**
 * Get the start of today in a specific timezone (as UTC Date)
 * This creates a Date object representing midnight (00:00:00) in the given timezone
 */
export function getStartOfTodayInTimezone(timezone: string): Date {
  return DateTime.now().setZone(timezone).startOf("day").toJSDate();
}

