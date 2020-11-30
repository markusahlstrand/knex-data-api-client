function jsonParseRecord(jsonColumns, record) {
  const parsedColumns = {};

  jsonColumns.forEach((column) => {
    parsedColumns[column.name] = JSON.parse(record[column.name]);
  });

  return {
    ...record,
    ...parsedColumns,
  };
}

function jsonParseReponse({ columnMetadata, records }) {
  const jsonColumns = columnMetadata.filter((metadata) => metadata.typeName === 'json');

  return records.map((record) => jsonParseRecord(jsonColumns, record));
}

module.exports = jsonParseReponse;
