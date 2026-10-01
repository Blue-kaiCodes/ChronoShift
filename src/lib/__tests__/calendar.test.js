import { describe, it, expect } from "vitest";
import {
  escapeIcsText,
  formatIcsDate,
  generateIcsFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getOffice365CalendarUrl,
  getYahooCalendarUrl
} from "../calendar";

describe("Calendar Exporter — RFC 5545 Compliance", () => {
  it("escapes special characters correctly according to RFC 5545", () => {
    const raw = "Team, Sync; Notes\\Details\nNext line";
    const escaped = escapeIcsText(raw);
    expect(escaped).toBe("Team\\, Sync\\; Notes\\\\Details\\nNext line");
  });

  it("formats Date to UTC iCalendar timestamp", () => {
    const date = new Date("2026-07-20T15:30:00Z");
    const formatted = formatIcsDate(date);
    expect(formatted).toBe("20260720T153000Z");
  });

  it("generates a valid, complete .ics document", () => {
    const meeting = {
      title: "Quarterly Strategy Review",
      description: "Review milestones and roadmap for Q3.",
      location: "ChronoShift Virtual Conference",
      startTime: new Date("2026-08-10T14:00:00Z"),
      endTime: new Date("2026-08-10T15:00:00Z"),
      attendees: [
        { name: "Aditya Bhaskar", email: "aditya@chronoshift.co" },
        { name: "Sarah Chen", email: "sarah@chronoshift.co" }
      ]
    };

    const ics = generateIcsFile(meeting);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//ChronoShift//Calendar Service//EN");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Quarterly Strategy Review");
    expect(ics).toContain("DTSTART:20260810T140000Z");
    expect(ics).toContain("DTEND:20260810T150000Z");
    expect(ics).toContain("STATUS:CONFIRMED");
    expect(ics).toContain("CN=Aditya Bhaskar:mailto:aditya@chronoshift.co");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT15M");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });
});

describe("Calendar Exporter — Web Calendar Link Generators", () => {
  const meeting = {
    title: "Global Planning",
    description: "Align across US and UK timezones.",
    location: "Google Meet",
    startTime: new Date("2026-09-01T13:00:00Z"),
    endTime: new Date("2026-09-01T14:00:00Z")
  };

  it("generates valid Google Calendar URL", () => {
    const url = getGoogleCalendarUrl(meeting);
    expect(url).toContain("calendar.google.com/calendar/render?action=TEMPLATE");
    expect(url).toMatch(/Global(\+|%20)Planning/);
  });

  it("generates valid Outlook Live URL", () => {
    const url = getOutlookCalendarUrl(meeting);
    expect(url).toContain("outlook.live.com/calendar/0/deeplink/compose");
    expect(url).toMatch(/subject=Global(\+|%20)Planning/);
  });

  it("generates valid Office 365 URL", () => {
    const url = getOffice365CalendarUrl(meeting);
    expect(url).toContain("outlook.office.com/calendar/0/deeplink/compose");
  });

  it("generates valid Yahoo Calendar URL", () => {
    const url = getYahooCalendarUrl(meeting);
    expect(url).toContain("calendar.yahoo.com/?v=60");
  });
});
