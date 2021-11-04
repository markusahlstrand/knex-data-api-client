function applyRecord(columnMetadata, record) {
  const parsedColumns = {};

  columnMetadata.forEach((column) => {
    // Skip null values
    if (record[column.name]) {
      switch (column.typeName) {
        case 'timestamp':
        case 'timestamptz': {
          // Postgres format 2001-01-01 00:00:00 or 2001-01-01 00:00:00.123456
          // eslint-disable-next-line no-case-declarations
          const [, year, month, day, hour, minute, second, millisecond] = record[column.name].match(
            /^(\d{1,4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})(?:.(\d{1,3}))?(?:\d{1,3})?$/,
          );

          const millisecondPadded = millisecond === undefined ? '000' : millisecond.padEnd(3, 0);
          parsedColumns[column.name] = new Date(
            Date.UTC(year, month - 1, day, hour, minute, second, millisecondPadded),
          );
          break;
        }
        case 'json':
        case 'jsonb':
          parsedColumns[column.name] = JSON.parse(record[column.name]);
          break;
        case '_text':
          parsedColumns[column.name] = record[column.name].stringValues;
          break;
        default:
          // Skip
          break;
      }
    }
  });

  return {
    ...record,
    ...parsedColumns,
  };
}

function apply({ columnMetadata, records }) {
  return records.map((record) => applyRecord(columnMetadata, record));
}

module.exports = {
  apply,
};
