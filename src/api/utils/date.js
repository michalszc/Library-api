
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

/**
 * Check if a Date is before another Date
 * @public
 * @param {String} date1
 * @param {String} date2
 * @returns {boolean} Returns true if the first date is before the second
 */
exports.isBefore = function isBefore (date1, date2) {
  return new Date(date1) < new Date(date2);
};
