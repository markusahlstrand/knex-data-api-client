const { parseTimestamp } = require('./utils');

function applyRecord(columnMetadata, record) {
  const parsedColumns = {};

  columnMetadata.forEach((column) => {
    // Skip null values
    if (record[column.name]) {
      switch (column.typeName) {
        case 'timestamp':
        case 'timestamptz':
          parsedColumns[column.name] = parseTimestamp(record[column.name]);
          break;
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
