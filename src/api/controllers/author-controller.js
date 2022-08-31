const Author = require('../models/author-model');

/**
 * Display list of all Authors.
 * @public
 */
exports.authorList = async function (req, res, next) {
  try {
    const authors = await Author.getList();
    res.json({ authors });
  } catch (error) {
    next(error);
  }
};
