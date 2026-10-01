/**
 * Robust timezone overlap, DST intelligence, and meeting coordination engine.
 * Supports standard IANA timezone databases and calculates dynamic offsets
 * accounting for Daylight Saving Time (DST) on any specified planning date.
 */

/**
 * Calculates the exact UTC offset (in fractional hours) for a given IANA timezone on a specific date.
 * Handles fractional offsets (e.g., India UTC+5.5, Nepal UTC+5.75) and dynamic DST changes.
 * 
 * @param {string} timezone - IANA timezone name (e.g. "America/New_York", "Asia/Kolkata")
 * @param {Date} date - The date to check for offsets
 * @returns {number} - The offset in hours (e.g. -4, 5.5, 0)
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
 * Retrieves the short timezone abbreviation (e.g., "EDT", "EST", "BST", "GMT", "IST")
 * for an IANA timezone on a specific date.
 * 
 * @param {string} timezone - IANA timezone name
 * @param {Date} date - Evaluation date
 * @returns {string} Short abbreviation or UTC offset string
 */
export function getTimezoneAbbreviation(timezone, date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short"
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === "timeZoneName");
    return tzPart ? tzPart.value : "UTC";
  } catch {
    const offset = getTimezoneOffset(timezone, date);
    return `UTC${offset >= 0 ? "+" : ""}${offset}`;
  }
}

/**
 * Checks whether an hour falls inside a working schedule.
 * Correctly supports wrap-around overnight schedules (e.g., 22:00 to 06:00).
 * 
 * @param {number} hour - 0 to 23.999
 * @param {number} workStart - Start hour (0-23)
 * @param {number} workEnd - End hour (0-23)
 * @returns {boolean}
 */
export function isHourWorking(hour, workStart = 9, workEnd = 17) {
  const norm = (hour % 24 + 24) % 24;
  if (workStart < workEnd) {
    return norm >= workStart && norm < workEnd;
  }
  if (workStart > workEnd) {
    // Wrap-around overnight shift (e.g. 22:00 -> 06:00)
    return norm >= workStart || norm < workEnd;
  }
  // workStart === workEnd implies zero working hours
  return false;
}

/**
 * Classifies an hour of the day into Sleeping, Personal, or Working periods.
 * Fully supports overnight shifts (e.g. 22:00 to 06:00) without classifying
 * working hours as sleeping.
 * 
 * @param {number} localHour - Local hour (0 - 24)
 * @param {number} workStart - Work start hour (0-23)
 * @param {number} workEnd - Work end hour (0-23)
 * @returns {"working" | "personal" | "sleeping"}
 */
export function getHourCategory(localHour, workStart = 9, workEnd = 17) {
  const norm = (localHour % 24 + 24) % 24;

  if (isHourWorking(norm, workStart, workEnd)) {
    return "working";
  }

  // Determine sleep window based on whether the shift is overnight
  if (workStart > workEnd) {
    // Overnight worker: sleeps during the day after shift
    // E.g. shift ends at 6:00 -> sleep 07:00 to 15:00
    const sleepStart = (workEnd + 1) % 24;
    const sleepEnd = (sleepStart + 8) % 24;
    if (sleepStart < sleepEnd) {
      if (norm >= sleepStart && norm < sleepEnd) return "sleeping";
    } else {
      if (norm >= sleepStart || norm < sleepEnd) return "sleeping";
    }
  } else {
    // Standard worker: diurnal sleep (10pm to 6am)
    // Ensure sleep doesn't collide with early/late work
    if ((norm >= 22 || norm < 6) && !isHourWorking(norm, workStart, workEnd)) {
      return "sleeping";
    }
  }

  return "personal";
}

/**
 * Detects whether a timezone is actively observing Daylight Saving Time on a specific date,
 * and finds the next upcoming DST transition date if available.
 * 
 * @param {string} timezone - IANA timezone identifier
 * @param {Date} date - Evaluation date
 * @returns {{ isDST: boolean, offset: number, abbreviation: string, nextTransition: { date: Date, shiftHours: number } | null }}
 */
export function getDSTInfo(timezone, dateOrYear = new Date()) {
  try {
    let date = dateOrYear instanceof Date ? dateOrYear : new Date();
    if (typeof dateOrYear === "number") {
      date = new Date(Date.UTC(dateOrYear, 5, 15, 12, 0, 0));
    }
    const currentOffset = getTimezoneOffset(timezone, date);
    const abbr = getTimezoneAbbreviation(timezone, date);

    // Compute standard time offset by comparing January and July
    const year = date.getFullYear();
    const janDate = new Date(Date.UTC(year, 0, 15, 12, 0, 0));
    const julDate = new Date(Date.UTC(year, 6, 15, 12, 0, 0));
    const janOffset = getTimezoneOffset(timezone, janDate);
    const julOffset = getTimezoneOffset(timezone, julDate);

    // Standard time is typically the smaller offset
    const standardOffset = Math.min(janOffset, julOffset);
    const maxOffset = Math.max(janOffset, julOffset);
    const observesDST = janOffset !== julOffset;
    const isDST = observesDST && currentOffset > standardOffset;

    const summerOffset = julOffset;
    const winterOffset = janOffset;

    // Scan for next transition within the next 180 days
    let nextTransition = null;
    if (observesDST) {
      const probe = new Date(date.getTime());
      let prevOffset = currentOffset;
      for (let day = 1; day <= 180; day++) {
        probe.setDate(probe.getDate() + 1);
        const probeOffset = getTimezoneOffset(timezone, probe);
        if (probeOffset !== prevOffset) {
          nextTransition = {
            date: new Date(probe.getTime()),
            shiftHours: probeOffset - prevOffset
          };
          break;
        }
        prevOffset = probeOffset;
      }
    }

    return {
      isDST,
      observesDST,
      summerOffset,
      winterOffset,
      offset: currentOffset,
      abbreviation: abbr,
      nextTransition
    };
  } catch (e) {
    console.error("DST detection error:", e);
    const offset = getTimezoneOffset(timezone, dateOrYear instanceof Date ? dateOrYear : new Date());
    return {
      isDST: false,
      observesDST: false,
      summerOffset: offset,
      winterOffset: offset,
      offset,
      abbreviation: `UTC${offset >= 0 ? "+" : ""}${offset}`,
      nextTransition: null
    };
  }
}

/**
 * Scans ahead to find the next upcoming DST transition for an IANA timezone.
 * 
 * @param {string} timezone - IANA timezone identifier
 * @param {Date} [startDate=new Date()] - Start evaluation date
 * @param {number} [maxDays=180] - Maximum lookahead days
 * @returns {{ date: Date, shiftHours: number, daysUntil: number } | null}
 */
export function getNextDSTTransition(timezone, startDate = new Date(), maxDays = 180) {
  const currentOffset = getTimezoneOffset(timezone, startDate);
  const probe = new Date(startDate.getTime());
  let prevOffset = currentOffset;

  for (let day = 1; day <= maxDays; day++) {
    probe.setDate(probe.getDate() + 1);
    const probeOffset = getTimezoneOffset(timezone, probe);
    if (probeOffset !== prevOffset) {
      return {
        date: new Date(probe.getTime()),
        shiftHours: probeOffset - prevOffset,
        daysUntil: day
      };
    }
    prevOffset = probeOffset;
  }

  return null;
}

/**
 * Computes exact timezone time difference between two IANA timezones on a specific date.
 * E.g., "New York is 9h 30m behind Bengaluru"
 * 
 * @param {string} tz1 - First timezone (reference)
 * @param {string} tz2 - Second timezone (target)
 * @param {Date} date - Planning date
 * @returns {{ hoursDiff: number, diffHours: number, formatted: string, isSame: boolean }}
 */
export function getTimezoneDifference(tz1, tz2, date = new Date()) {
  const offset1 = getTimezoneOffset(tz1, date);
  const offset2 = getTimezoneOffset(tz2, date);
  const diff = offset2 - offset1;

  if (diff === 0) {
    return { hoursDiff: 0, diffHours: 0, formatted: "Same time", isSame: true };
  }

  const sign = diff > 0 ? "+" : "-";
  const absHours = Math.abs(diff);
  const wholeHours = Math.floor(absHours);
  const minutes = Math.round((absHours - wholeHours) * 60);

  const formatted = minutes > 0
    ? `${sign}${wholeHours}h ${minutes}m`
    : `${sign}${wholeHours}h`;

  return {
    hoursDiff: diff,
    diffHours: diff,
    formatted,
    isSame: false
  };
}

/**
 * Duration-aware meeting slot finder.
 * Finds continuous meeting windows where all or most team members can attend
 * for the ENTIRE duration of the meeting (15, 30, 45, 60, 90, 120 minutes).
 * 
 * @param {Object} options
 * @param {Array} options.members - Teammate list
 * @param {Date} options.date - Target meeting date
 * @param {number} [options.durationMinutes=60] - Meeting length in minutes
 * @param {string} [options.referenceTimezone="UTC"] - Reference timezone for slots
 * @param {number} [options.intervalMinutes=30] - Grid step (15 or 30 mins)
 * @param {number} [options.minScore=40] - Minimum suitability score threshold
 * @returns {Array<Object>} List of suitable meeting slots ranked by score
 */
export function findMeetingSlots({
  members = [],
  date = new Date(),
  durationMinutes = 60,
  referenceTimezone = "UTC",
  intervalMinutes = 30,
  minScore = 30
}) {
  if (!members || members.length === 0) return [];

  const refOffset = getTimezoneOffset(referenceTimezone, date);
  const startOfDayUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  const slots = [];

  // Evaluate candidate start times throughout the 24-hour cycle
  const totalSteps = Math.floor((24 * 60) / intervalMinutes);

  for (let step = 0; step < totalSteps; step++) {
    const startMinutesFromMidnight = step * intervalMinutes;
    const startHour = startMinutesFromMidnight / 60;
    
    // Exact UTC start and end instants
    const slotStartUtc = new Date(startOfDayUtc.getTime() + (startHour - refOffset) * 3600000);
    const slotEndUtc = new Date(slotStartUtc.getTime() + durationMinutes * 60000);

    let workingCount = 0;
    let personalCount = 0;
    let sleepingCount = 0;
    let totalScorePoints = 0;

    const participantBreakdown = members.map(m => {
      const memberStartOffset = getTimezoneOffset(m.timezone, slotStartUtc);
      const memberEndOffset = getTimezoneOffset(m.timezone, slotEndUtc);

      // Local start and end times for member
      const memberStartUtcMs = slotStartUtc.getTime() + memberStartOffset * 3600000;
      const memberEndUtcMs = slotEndUtc.getTime() + memberEndOffset * 3600000;
      
      const memberStartDate = new Date(memberStartUtcMs);
      const memberEndDate = new Date(memberEndUtcMs);

      const localStartHour = memberStartDate.getUTCHours() + memberStartDate.getUTCMinutes() / 60;
      const localEndHour = memberEndDate.getUTCHours() + memberEndDate.getUTCMinutes() / 60;

      // Sample throughout meeting duration to verify ALL parts fit
      const samples = 4;
      let sampleSleeping = false;
      let sampleAllWorking = true;

      for (let s = 0; s <= samples; s++) {
        const sampleRatio = s / samples;
        const sampleUtc = new Date(slotStartUtc.getTime() + durationMinutes * 60000 * sampleRatio);
        const sampleOffset = getTimezoneOffset(m.timezone, sampleUtc);
        const sampleLocalMs = sampleUtc.getTime() + sampleOffset * 3600000;
        const sampleLocalDate = new Date(sampleLocalMs);
        const sampleHour = sampleLocalDate.getUTCHours() + sampleLocalDate.getUTCMinutes() / 60;

        const cat = getHourCategory(sampleHour, m.workStart ?? 9, m.workEnd ?? 17);
        if (cat === "sleeping") {
          sampleSleeping = true;
          sampleAllWorking = false;
        } else if (cat !== "working") {
          sampleAllWorking = false;
        }
      }

      let category = "personal";
      let weight = 0.5;

      if (sampleSleeping) {
        category = "sleeping";
        weight = 0.0;
        sleepingCount++;
      } else if (sampleAllWorking) {
        category = "working";
        weight = 1.0;
        workingCount++;
      } else {
        personalCount++;
      }

      // Check if day crosses midnight or falls on weekend
      const dayOfWeek = memberStartDate.getUTCDay();
      const isWeekendDay = (m.weekendDays || [0, 6]).includes(dayOfWeek);
      if (isWeekendDay) {
        weight *= 0.3; // Weekend penalty
      }

      totalScorePoints += weight;

      // Format clean localized display string
      const timeFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: m.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

      return {
        memberId: m.id,
        name: m.name,
        city: m.city,
        timezone: m.timezone,
        category,
        localStartStr: timeFmt.format(slotStartUtc),
        localEndStr: timeFmt.format(slotEndUtc),
        crossesMidnight: memberStartDate.getUTCDate() !== memberEndDate.getUTCDate(),
        isWeekend: isWeekendDay,
        weight
      };
    });

    const score = members.length > 0 ? (totalScorePoints / members.length) * 100 : 0;

    if (score >= minScore) {
      const refHours = Math.floor(startHour);
      const refMins = Math.round((startHour - refHours) * 60);
      const timeString = `${String(refHours).padStart(2, "0")}:${String(refMins).padStart(2, "0")}`;

      const endHour = startHour + durationMinutes / 60;
      const endHours = Math.floor(endHour % 24);
      const endMins = Math.round(((endHour % 24) - endHours) * 60);
      const endTimeString = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

      slots.push({
        hour: startHour,
        startTime: timeString,
        endTime: endTimeString,
        timeString,
        slotStartUtc,
        slotEndUtc,
        durationMinutes,
        referenceTimezone,
        score: Math.round(score),
        workingCount,
        personalCount,
        sleepingCount,
        allWorking: workingCount === members.length,
        attendeeTimes: participantBreakdown,
        participantBreakdown
      });
    }
  }

  // Sort descending by score, then by start hour
  slots.sort((a, b) => b.score - a.score || a.hour - b.hour);
  return slots;
}

/**
 * Computes availability status for all team members over a 24-hour range.
 * The 24-hour timeline is framed in a reference timezone.
 * 
 * @param {Array} members - List of team members
 * @param {Date} date - The target planning date
 * @param {string} referenceTimezone - The timezone to frame the 24-hour visualizer in
 * @param {number} [durationMinutes=60] - Target meeting duration
 */
export function calculateTimelineData(members, date = new Date(), referenceTimezone = "UTC", durationMinutes = 60) {
  if (!members || members.length === 0) return null;

  const refOffset = getTimezoneOffset(referenceTimezone, date);
  const startOfDayUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  
  const hourlyData = Array.from({ length: 24 }, (_, refHour) => {
    const hourUtcTime = new Date(startOfDayUtc.getTime() + (refHour - refOffset) * 3600000);
    
    let workingCount = 0;
    let personalCount = 0;
    let sleepingCount = 0;
    let scoreTotal = 0;
    
    const teammateStatuses = members.map(m => {
      const memberOffset = getTimezoneOffset(m.timezone, hourUtcTime);
      const memberLocalHour = (refHour - refOffset + memberOffset + 24) % 24;
      const category = getHourCategory(memberLocalHour, m.workStart ?? 9, m.workEnd ?? 17);
      
      let weight = 0;
      if (category === "working") {
        workingCount++;
        weight = 1.0;
      } else if (category === "personal") {
        personalCount++;
        weight = 0.5;
      } else {
        sleepingCount++;
        weight = 0.0;
      }
      
      scoreTotal += weight;

      return {
        id: m.id,
        name: m.name,
        localHour: memberLocalHour,
        category,
        offset: memberOffset
      };
    });

    const score = members.length > 0 ? (scoreTotal / members.length) * 100 : 0;

    return {
      hour: refHour,
      timeString: `${String(refHour).padStart(2, "0")}:00`,
      score: Math.round(score),
      workingCount,
      personalCount,
      sleepingCount,
      statuses: teammateStatuses
    };
  });

  // Find the single best hour
  let bestHour = 0;
  let maxScore = -1;
  hourlyData.forEach(h => {
    if (h.score > maxScore) {
      maxScore = h.score;
      bestHour = h.hour;
    }
  });

  return {
    hours: hourlyData,
    hourlyData,
    bestHour,
    bestScore: maxScore,
    referenceTimezone,
    referenceOffset: refOffset
  };
}

/**
 * Returns top N hours ranked by overlap score.
 * Supports both:
 * - getTopGoldenHours(hourlyData, count)
 * - getTopGoldenHours(members, date, referenceTimezone, count)
 * 
 * @param {Array} dataOrMembers 
 * @param {number|Date} [arg2=3] 
 * @param {string} [arg3="UTC"]
 * @param {number} [arg4=3]
 * @returns {Array}
 */
export function getTopGoldenHours(dataOrMembers, arg2 = 3, arg3 = "UTC", arg4 = 3) {
  if (!dataOrMembers || dataOrMembers.length === 0) return [];

  // If first item has an hour property, it is already an hourlyData array
  if (dataOrMembers[0] && typeof dataOrMembers[0].hour === "number") {
    const count = typeof arg2 === "number" ? arg2 : 3;
    const sorted = [...dataOrMembers].sort((a, b) => b.score - a.score || a.hour - b.hour);
    return sorted.slice(0, count);
  }

  // Otherwise, dataOrMembers is a members list
  const date = arg2 instanceof Date ? arg2 : new Date();
  const refTz = typeof arg3 === "string" ? arg3 : "UTC";
  const count = typeof arg4 === "number" ? arg4 : 3;

  const result = calculateTimelineData(dataOrMembers, date, refTz);
  if (!result || !result.hourlyData) return [];
  const sorted = [...result.hourlyData].sort((a, b) => b.score - a.score || a.hour - b.hour);
  return sorted.slice(0, count);
}

/**
 * Calculates equirectangular SVG path data for the night terminator shadow.
 * @param {Date} date - Target date
 * @param {number} utcHour - Hour in UTC (0 - 24)
 * @param {number} width - Map viewBox width (default 1000)
 * @param {number} height - Map viewBox height (default 500)
 * @returns {string} SVG path string
 */
export function getSolarTerminatorPath(date = new Date(), utcHour = 12, width = 1000, height = 500) {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
  
  // Approximate solar declination in radians
  const declinationDeg = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const declinationRad = (declinationDeg * Math.PI) / 180;
  
  // Sun longitude in degrees (at 12 UTC, sun is at approx 0 deg)
  const sunLng = (12 - utcHour) * 15;
  
  const points = [];
  const step = 4; // Longitude step in degrees
  for (let lng = -180; lng <= 180; lng += step) {
    const diffLngRad = ((lng - sunLng) * Math.PI) / 180;
    const tanLat = -Math.cos(diffLngRad) / Math.tan(declinationRad || 0.0001);
    const latRad = Math.atan(tanLat);
    const latDeg = (latRad * 180) / Math.PI;

    // Convert (lng, lat) to SVG coordinates
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - latDeg) / 180) * height;
    points.push({ x, y });
  }

  // Close the night polygon towards the darker pole
  const isNorthWinter = declinationDeg < 0;
  const poleY = isNorthWinter ? 0 : height;
  
  let path = `M 0 ${points[0].y.toFixed(1)}`;
  points.forEach(p => {
    path += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  });
  path += ` L ${width} ${poleY} L 0 ${poleY} Z`;
  return path;
}
