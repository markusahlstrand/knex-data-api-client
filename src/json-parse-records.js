const jsonColumnTypes = ['json', 'jsonb'];

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
  const jsonColumns = columnMetadata.filter(
    (metadata) => jsonColumnTypes.indexOf(metadata.typeName) !== -1,
  );

  return records.map((record) => jsonParseRecord(jsonColumns, record));
}

module.exports = jsonParseReponse;
