
/**
 * Add days to date
 * @public
 * @param {String} date
 * @param {Number} days number of days to add (default is 1)
 * @returns {object} date with added days
 */
exports.addDays = function (date, days = 1) {
  const d = new Date(date);
  return new Date(d.getTime() + 86400000 * days);
};
