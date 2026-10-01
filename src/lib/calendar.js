/**
 * RFC 5545 Compliant iCalendar (.ics) Generator & Web Dispatch Service.
 * Produces valid universal calendars for Google Calendar, Apple Calendar, Outlook, and Yahoo.
 */

export function formatIcsDateTime(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export const formatIcsDate = formatIcsDateTime;

/**
 * Escapes characters per RFC 5545 section 3.3.11.
 * Special characters that MUST be escaped: comma, semicolon, backslash, newline.
 */
export function escapeIcsText(text = "") {
  if (typeof text !== "string") return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
}

function resolveDates(startDate, startTime, endTime, durationMinutes = 60) {
  const start = new Date(startDate || startTime || Date.now());
  let end;
  if (endTime) {
    end = new Date(endTime);
  } else {
    end = new Date(start.getTime() + durationMinutes * 60000);
  }
  return { start, end };
}

/**
 * Generates a prepopulated Google Calendar scheduling URL.
 */
export function getGoogleCalendarUrl({
  title = "Team Sync",
  description = "",
  location = "Virtual Sync",
  startDate,
  startTime,
  endTime,
  durationMinutes = 60
}) {
  const { start, end } = resolveDates(startDate, startTime, endTime, durationMinutes);

  const startStr = formatIcsDateTime(start);
  const endStr = formatIcsDateTime(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startStr}/${endStr}`,
    details: description,
    location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an Outlook.com (Consumer) Calendar scheduling URL.
 */
export function getOutlookCalendarUrl({
  title = "Team Sync",
  description = "",
  location = "Virtual Sync",
  startDate,
  startTime,
  endTime,
  durationMinutes = 60
}) {
  const { start, end } = resolveDates(startDate, startTime, endTime, durationMinutes);

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: description,
    location
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates an Office 365 (Enterprise) Calendar scheduling URL.
 */
export function getOffice365CalendarUrl({
  title = "Team Sync",
  description = "",
  location = "Virtual Sync",
  startDate,
  startTime,
  endTime,
  durationMinutes = 60
}) {
  const { start, end } = resolveDates(startDate, startTime, endTime, durationMinutes);

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: description,
    location
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates a Yahoo Calendar scheduling URL.
 */
export function getYahooCalendarUrl({
  title = "Team Sync",
  description = "",
  location = "Virtual Sync",
  startDate,
  startTime,
  endTime,
  durationMinutes = 60
}) {
  const { start, end } = resolveDates(startDate, startTime, endTime, durationMinutes);

  const params = new URLSearchParams({
    v: "60",
    title,
    st: formatIcsDateTime(start),
    et: formatIcsDateTime(end),
    desc: description,
    in_loc: location
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Generates compliant RFC 5545 .ics file content.
 */
export function generateIcsContent({
  title = "Team Sync",
  description = "",
  location = "Virtual Sync",
  startDate,
  startTime,
  endTime,
  durationMinutes = 60,
  attendees = []
}) {
  const { start, end } = resolveDates(startDate, startTime, endTime, durationMinutes);
  const now = new Date();

  const startStr = formatIcsDateTime(start);
  const endStr = formatIcsDateTime(end);
  const stampStr = formatIcsDateTime(now);
  const uid = `cshift-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@chronoshift.co`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ChronoShift//Calendar Service//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stampStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0"
  ];

  // Optional attendees
  if (Array.isArray(attendees)) {
    attendees.forEach(a => {
      if (a && a.email) {
        const cn = a.name ? `;CN=${escapeIcsText(a.name)}` : "";
        lines.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION${cn}:mailto:${a.email}`);
      }
    });
  }

  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "DESCRIPTION:ChronoShift Meeting Reminder",
    "ACTION:DISPLAY",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return lines.join("\r\n");
}

export const generateIcsFile = generateIcsContent;

/**
 * Triggers native browser download for the generated .ics calendar invite.
 */
export function downloadIcsFile({
  title = "Team Sync",
  description = "",
  location = "Virtual Sync",
  startDate,
  startTime,
  endTime,
  durationMinutes = 60,
  attendees = []
}) {
  const content = generateIcsContent({
    title,
    description,
    location,
    startDate,
    startTime,
    endTime,
    durationMinutes,
    attendees
  });

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  const safeFilename = title.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 40) || "meeting";
  link.download = `${safeFilename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
