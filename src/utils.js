/**
 * Parse Data Api timestamp field to JS native type.
 * @param {string} timestamp Timestamp string from Data Api
 * @returns {Date | number}
 */
function parseTimestamp(timestamp) {
  // Postgres format 2001-01-01 00:00:00 or 2001-01-01 00:00:00.123456
  // Postgres format +292278994-08-16 23:00:00 or -292275055-05-16 23:00:00 for Infinity values
  // eslint-disable-next-line no-case-declarations
  const [, year, month, day, hour, minute, second, millisecond = ''] = timestamp.match(
    /^([+|-]?\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})(?:.(\d{1,3}))?(?:\d{1,3})?$/,
  );

  const epochTimestamp = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    millisecond.padEnd(3, 0),
  );

  if (epochTimestamp) {
    return new Date(epochTimestamp);
  }

  return year[0] === '+' ? Infinity : -Infinity;
}

module.exports = {
  parseTimestamp,
};
