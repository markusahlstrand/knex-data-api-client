const sqlstring = require("sqlstring");
const constants = require("./constants");

function format(sql, values, dialect) {
  if (dialect === constants.dialects.postgres) {
    return sql.replace(/(\$\d)/gi, binding => {
      const index = parseInt(binding.slice(1));
      return `'${values[index - 1]}'`;
    });
  } else {
    return sqlstring.format(sql, values);
  }
}

module.exports = {
  format
};
