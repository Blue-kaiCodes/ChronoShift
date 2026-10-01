import { describe, it, expect } from "vitest";
import {
  isWeekend,
  OFFLINE_HOLIDAYS,
  getPublicHoliday
} from "../holidays";

describe("Holidays Service — Weekend Detection", () => {
  it("detects standard Saturday and Sunday as weekend days by default", () => {
    const saturday = new Date("2026-06-20T12:00:00Z");
    const sunday = new Date("2026-06-21T12:00:00Z");
    const monday = new Date("2026-06-22T12:00:00Z");

    expect(isWeekend(saturday)).toBe(true);
    expect(isWeekend(sunday)).toBe(true);
    expect(isWeekend(monday)).toBe(false);
  });

  it("supports custom weekend day configurations (e.g. Friday and Saturday in Middle East)", () => {
    const friday = new Date("2026-06-19T12:00:00Z");
    const sunday = new Date("2026-06-21T12:00:00Z");

    const customWeekend = [5, 6];
    expect(isWeekend(friday, customWeekend)).toBe(true);
    expect(isWeekend(sunday, customWeekend)).toBe(false);
  });
});

describe("Holidays Service — Offline Fallbacks and Public Holidays", () => {
  it("provides reliable offline fallback holidays for major countries", () => {
    expect(OFFLINE_HOLIDAYS.US).toBeDefined();
    expect(OFFLINE_HOLIDAYS.GB).toBeDefined();
    expect(OFFLINE_HOLIDAYS.IN).toBeDefined();
    expect(OFFLINE_HOLIDAYS.DE).toBeDefined();
    expect(OFFLINE_HOLIDAYS.JP).toBeDefined();
    expect(OFFLINE_HOLIDAYS.AU).toBeDefined();
    expect(OFFLINE_HOLIDAYS.CA).toBeDefined();
  });

  it("detects New Year's Day from offline database synchronously", () => {
    const newYearsDay = new Date("2026-01-01T12:00:00Z");
    const usHoliday = getPublicHoliday(newYearsDay, "US");
    expect(usHoliday).not.toBeNull();
    expect(usHoliday?.name).toBe("New Year's Day");

    const normalDay = new Date("2026-04-14T12:00:00Z");
    const noHoliday = getPublicHoliday(normalDay, "US");
    expect(noHoliday).toBeNull();
  });
});
