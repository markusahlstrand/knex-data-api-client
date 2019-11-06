function format(sql, bindings) {
  return sql.replace(/(\$\d)/gi, binding => {
    const index = parseInt(binding.slice(1));
    return `'${bindings[index - 1]}'`;
  });
}

module.exports = {
  format
};
