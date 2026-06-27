export const calculateGoldenHour = (members) => {
  if (!members.length) return null;
  let bestHour = 0, maxOverlap = 0, bestAttendees = [];
  const heatmapData = Array.from({ length: 24 }, (_, h) => {
    let count = 0;
    const available = [];
    members.forEach(m => {
      const localH = (h + m.offset + 24) % 24;
      if (localH >= 9 && localH < 17) { count++; available.push(m.name); }
    });
    if (count > maxOverlap) { maxOverlap = count; bestHour = h; bestAttendees = available; }
    return { hour: h, overlap: count, attendees: available };
  });
  return { bestHour, maxOverlap, bestAttendees, score: (maxOverlap / members.length) * 100, heatmapData };
};
