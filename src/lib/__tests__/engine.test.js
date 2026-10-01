import { describe, it, expect } from "vitest";
import {
  getTimezoneOffset,
  getHourCategory,
  isHourWorking,
  getTimezoneDifference,
  getDSTInfo,
  getNextDSTTransition,
  findMeetingSlots,
  calculateTimelineData,
  getTopGoldenHours
} from "../engine";

describe("Timezone Engine — Offset Calculations", () => {
  it("calculates exact integer offsets correctly", () => {
    const fixedDate = new Date("2026-01-15T12:00:00Z");
    const utcOffset = getTimezoneOffset("UTC", fixedDate);
    expect(utcOffset).toBe(0);

    const londonOffset = getTimezoneOffset("Europe/London", fixedDate);
    expect(londonOffset).toBe(0);

    const nyOffset = getTimezoneOffset("America/New_York", fixedDate);
    expect(nyOffset).toBe(-5);

    const tokyoOffset = getTimezoneOffset("Asia/Tokyo", fixedDate);
    expect(tokyoOffset).toBe(9);
  });

  it("handles non-integer/fractional timezone offsets accurately (e.g. IST +5.5)", () => {
    const fixedDate = new Date("2026-01-15T12:00:00Z");
    const kolkataOffset = getTimezoneOffset("Asia/Kolkata", fixedDate);
    expect(kolkataOffset).toBe(5.5);

    const kathmanduOffset = getTimezoneOffset("Asia/Kathmandu", fixedDate);
    expect(kathmanduOffset).toBe(5.75);
  });

  it("calculates relative timezone difference between two timezones", () => {
    const fixedDate = new Date("2026-01-15T12:00:00Z");
    const diff = getTimezoneDifference("Europe/London", "Asia/Kolkata", fixedDate);
    expect(diff.diffHours).toBe(5.5);
    expect(diff.formatted).toBe("+5h 30m");

    const diffWest = getTimezoneDifference("Europe/London", "America/New_York", fixedDate);
    expect(diffWest.diffHours).toBe(-5);
    expect(diffWest.formatted).toBe("-5h");

    const diffSame = getTimezoneDifference("UTC", "Europe/London", fixedDate);
    expect(diffSame.formatted).toBe("Same time");
  });
});

describe("Timezone Engine — Hour Categorization and Shifts", () => {
  it("categorizes standard 9-17 working schedule correctly", () => {
    expect(getHourCategory(9, 9, 17)).toBe("working");
    expect(getHourCategory(12, 9, 17)).toBe("working");
    expect(getHourCategory(16, 9, 17)).toBe("working");
    expect(getHourCategory(17, 9, 17)).toBe("personal");
    expect(getHourCategory(20, 9, 17)).toBe("personal");
    expect(getHourCategory(23, 9, 17)).toBe("sleeping");
    expect(getHourCategory(3, 9, 17)).toBe("sleeping");
    expect(getHourCategory(7, 9, 17)).toBe("personal");
  });

  it("supports overnight schedule wrap-around across midnight (e.g. 22:00 to 06:00)", () => {
    expect(isHourWorking(22, 22, 6)).toBe(true);
    expect(isHourWorking(23, 22, 6)).toBe(true);
    expect(isHourWorking(0, 22, 6)).toBe(true);
    expect(isHourWorking(3, 22, 6)).toBe(true);
    expect(isHourWorking(5, 22, 6)).toBe(true);
    expect(isHourWorking(6, 22, 6)).toBe(false);
    expect(isHourWorking(14, 22, 6)).toBe(false);

    expect(getHourCategory(23, 22, 6)).toBe("working");
    expect(getHourCategory(2, 22, 6)).toBe("working");
    expect(getHourCategory(10, 22, 6)).toBe("sleeping");
    expect(getHourCategory(19, 22, 6)).toBe("personal");
  });
});

describe("Timezone Engine — DST Inspection", () => {
  it("detects whether a timezone observes Daylight Saving Time", () => {
    const nyDST = getDSTInfo("America/New_York", 2026);
    expect(nyDST.observesDST).toBe(true);
    expect(nyDST.summerOffset).toBe(-4);
    expect(nyDST.winterOffset).toBe(-5);

    const tokyoDST = getDSTInfo("Asia/Tokyo", 2026);
    expect(tokyoDST.observesDST).toBe(false);
    expect(tokyoDST.summerOffset).toBe(9);
    expect(tokyoDST.winterOffset).toBe(9);
  });

  it("scans and identifies upcoming DST transition dates", () => {
    const startDate = new Date("2026-03-01T00:00:00Z");
    const nextTransition = getNextDSTTransition("America/New_York", startDate, 60);
    expect(nextTransition).not.toBeNull();
    expect(nextTransition.date).toBeDefined();
    expect(nextTransition.daysUntil).toBeGreaterThan(0);
    expect(nextTransition.daysUntil).toBeLessThanOrEqual(60);
  });
});

describe("Timezone Engine — findMeetingSlots Algorithm", () => {
  const members = [
    {
      id: "u1",
      name: "London Lead",
      timezone: "Europe/London",
      workStart: 9,
      workEnd: 17,
      weekendDays: [0, 6]
    },
    {
      id: "u2",
      name: "NY PM",
      timezone: "America/New_York",
      workStart: 9,
      workEnd: 17,
      weekendDays: [0, 6]
    }
  ];

  it("finds overlapping working slots between London (UTC) and New York (UTC-5)", () => {
    const date = new Date("2026-06-15T12:00:00Z");
    const slots = findMeetingSlots({
      members,
      date,
      durationMinutes: 60,
      referenceTimezone: "UTC",
      intervalMinutes: 30,
      minScore: 50
    });

    expect(slots.length).toBeGreaterThan(0);
    const bestSlot = slots[0];
    expect(bestSlot.score).toBeGreaterThanOrEqual(80);
    expect(bestSlot.attendeeTimes).toHaveLength(2);
    expect(bestSlot.durationMinutes).toBe(60);
  });

  it("respects meeting duration across the window", () => {
    const date = new Date("2026-06-15T12:00:00Z");
    const slots30 = findMeetingSlots({
      members,
      date,
      durationMinutes: 30,
      referenceTimezone: "UTC",
      intervalMinutes: 30
    });

    const slots120 = findMeetingSlots({
      members,
      date,
      durationMinutes: 120,
      referenceTimezone: "UTC",
      intervalMinutes: 30
    });

    expect(slots30.length).toBeGreaterThanOrEqual(slots120.length);
  });

  it("penalizes slots when any member is sleeping or outside work hours", () => {
    const date = new Date("2026-06-15T02:00:00Z");
    const slots = findMeetingSlots({
      members,
      date,
      durationMinutes: 60,
      referenceTimezone: "UTC",
      intervalMinutes: 60,
      minScore: 0
    });

    const nightSlot = slots.find(s => s.startTime === "03:00");
    if (nightSlot) {
      expect(nightSlot.score).toBeLessThan(40);
    }
  });
});

describe("Timezone Engine — Timeline and Golden Hours Compatibility", () => {
  it("calculates 24-hour timeline matrix and best overlap hour", () => {
    const members = [
      { id: "1", timezone: "Europe/London", workStart: 9, workEnd: 17 },
      { id: "2", timezone: "Europe/Paris", workStart: 9, workEnd: 17 }
    ];
    const res = calculateTimelineData(members, new Date("2026-05-10T12:00:00Z"), "UTC");
    expect(res).toBeDefined();
    expect(res.hours).toHaveLength(24);
    expect(res.bestHour).toBeDefined();
    expect(res.bestScore).toBeGreaterThan(0);
  });

  it("returns top golden hour recommendations", () => {
    const members = [
      { id: "1", timezone: "Europe/London", workStart: 9, workEnd: 17 },
      { id: "2", timezone: "Asia/Tokyo", workStart: 9, workEnd: 18 }
    ];
    const golden = getTopGoldenHours(members, new Date("2026-05-10T12:00:00Z"), "UTC", 3);
    expect(golden).toHaveLength(3);
    expect(golden[0].score).toBeGreaterThanOrEqual(golden[1].score);
  });
});
