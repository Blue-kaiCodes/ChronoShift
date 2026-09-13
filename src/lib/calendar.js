/**
 * Calendar Link & ICS Generation Utilities.
 * Handles dates cleanly in UTC to prevent timezone translation bugs during export.
 */

function formatISOCompact(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generates a Google Calendar scheduling link.
 */
export function getGoogleCalendarUrl({ title, description, startDate, durationMinutes }) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const startStr = formatISOCompact(start);
  const endStr = formatISOCompact(end);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(description)}`;
}

/**
 * Generates an Outlook.com Web Calendar scheduling link.
 */
export function getOutlookCalendarUrl({ title, description, startDate, durationMinutes }) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
    title
  )}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(description)}`;
}

/**
 * Generates the raw content string for a standard RFC-5545 .ics calendar file.
 */
export function generateIcsContent({ title, description, startDate, durationMinutes }) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const startStr = formatISOCompact(start);
  const endStr = formatISOCompact(end);
  const stampStr = formatISOCompact(new Date());
  const uid = `uid_${Math.random().toString(36).substring(2)}@chronoshift.app`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ChronoShift//Timezone Sync//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stampStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "DESCRIPTION:Meeting Reminder",
    "ACTION:DISPLAY",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

/**
 * Triggers a native browser file download for the .ics meeting invite.
 */
export function downloadIcsFile({ title, description, startDate, durationMinutes }) {
  const content = generateIcsContent({ title, description, startDate, durationMinutes });
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
