/**
 * Robust timezone overlap and visualization engine.
 * Supports standard IANA timezone databases and calculates dynamic offsets
 * accounting for Daylight Saving Time (DST) on any specified planning date.
 */

/**
 * Calculates the exact UTC offset (in hours) for a given IANA timezone on a specific date.
 * Handles fractional offsets (e.g., India UTC+5.5) and dynamic DST changes.
 * 
 * @param {string} timezone - IANA timezone name (e.g. "America/New_York")
 * @param {Date} date - The date to check for offsets
 * @returns {number} - The offset in hours (e.g. -4 or 5.5)
 */
export function getTimezoneOffset(timezone, date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    
    const parts = formatter.formatToParts(date);
    const map = new Map(parts.map(p => [p.type, p.value]));
    
    // Construct local date in UTC representation to find difference
    const year = parseInt(map.get("year"), 10);
    const month = parseInt(map.get("month"), 10) - 1;
    const day = parseInt(map.get("day"), 10);
    let hour = parseInt(map.get("hour"), 10);
    const minute = parseInt(map.get("minute"), 10);
    
    // Intl.DateTimeFormat with hour12: false can return 24 for midnight on some platforms
    if (hour === 24) hour = 0;

    const localTargetUTC = Date.UTC(year, month, day, hour, minute, 0, 0);
    const utcTime = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      0
    );

    const diffMinutes = Math.round((localTargetUTC - utcTime) / 60000);
    return diffMinutes / 60;
  } catch (error) {
    console.error(`Failed to resolve timezone ${timezone}:`, error);
    return 0;
  }
}

/**
 * Classifies an hour of the day into Sleeping, Personal, or Working periods.
 * Default Working: 09:00 - 17:00 (9 to 17)
 * Default Sleeping: 22:00 - 06:00 (22 to 6)
 */
export function getHourCategory(localHour, workStart = 9, workEnd = 17) {
  const norm = (localHour + 24) % 24;
  
  // Working hours
  if (norm >= workStart && norm < workEnd) {
    return "working";
  }
  // Sleeping hours (standard 10pm to 6am)
  if (norm >= 22 || norm < 6) {
    return "sleeping";
  }
  // Otherwise personal time
  return "personal";
}

/**
 * Computes availability status for all team members over a 24-hour range.
 * The 24-hour timeline is framed in a reference timezone (defaulting to UTC).
 * 
 * @param {Array} members - List of team members
 * @param {Date} date - The target planning date
 * @param {string} referenceTimezone - The timezone to frame the 24-hour visualizer in
 */
export function calculateTimelineData(members, date = new Date(), referenceTimezone = "UTC") {
  if (!members || members.length === 0) return null;

  const refOffset = getTimezoneOffset(referenceTimezone, date);
  const startOfDayUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  
  const hourlyData = Array.from({ length: 24 }, (_, refHour) => {
    // Determine target time for this hour in UTC
    const hourUtcTime = new Date(startOfDayUtc.getTime() + (refHour - refOffset) * 3600000);
    
    let workingCount = 0;
    let personalCount = 0;
    let sleepingCount = 0;
    
    const teammateStatuses = members.map(m => {
      const memberOffset = getTimezoneOffset(m.timezone, hourUtcTime);
      // Local hour for this member
      const memberLocalHour = (refHour - refOffset + memberOffset + 24) % 24;
      const category = getHourCategory(memberLocalHour, m.workStart || 9, m.workEnd || 17);
      
      if (category === "working") workingCount++;
      else if (category === "personal") personalCount++;
      else sleepingCount++;
      
      return {
        id: m.id,
        name: m.name,
        localHour: memberLocalHour,
        category,
        offset: memberOffset
      };
    });

    // Score is weighted: Working count is full weight, Personal is 0.5 weight, Sleeping is 0 weight
    const score = members.length > 0
      ? ((workingCount + personalCount * 0.4) / members.length) * 100
      : 0;

    return {
      hour: refHour,
      timeString: `${String(refHour).padStart(2, "0")}:00`,
      score,
      workingCount,
      personalCount,
      sleepingCount,
      statuses: teammateStatuses
    };
  });

  // Find the single best hour (highest overlap score)
  let bestHour = 0;
  let maxScore = -1;
  hourlyData.forEach(h => {
    if (h.score > maxScore) {
      maxScore = h.score;
      bestHour = h.hour;
    }
  });

  return {
    hourlyData,
    bestHour,
    bestScore: maxScore,
    referenceTimezone,
    referenceOffset: refOffset
  };
}
