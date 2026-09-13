export const formatSemester = (sem) => `Semester ${sem}`;

export const formatPercentage = (pct) => `${parseFloat(pct).toFixed(1)}%`;

export const getAttendanceColor = (pct) => {
  const val = parseFloat(pct);
  if (val >= 75) return "text-emerald-400";
  if (val >= 60) return "text-amber-400";
  return "text-rose-400";
};
