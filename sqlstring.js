const sqlstring = require("sqlstring");
const constants = require("./constants");

function format(sql, values, dialect) {
  if (dialect === constants.dialects.postgres) {
    return sql.replace(/(\$\d+)/gi, binding => {
      const index = parseInt(binding.slice(1));
      const value = values[index - 1];

      if (value instanceof Date) {
        return `'${value.toISOString()}'`;
      } else if (value === null) {
        return "NULL";
      }

      return `'${value}'`;
    });
  } else {
    return sqlstring.format(sql, values);
  }
}

module.exports = {
  format
};
