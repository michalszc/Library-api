const APIError = require('../errors/api-error');
const Author = require('../models/author-model');
const status = require('http-status');

/**
 * Gets Author by id passed in route parameters
 * @public
 */
exports.getAuthor = async function (req, res, next) {
  let author;
  try {
    author = await Author.findById(req.params.id);
    if (!author) {
      throw Error(`Cannot find author with id ${req.params.id}`);
    }
  } catch (error) {
    if (error.message.startsWith('Cannot find author')) {
      return next(new APIError({
        message: error.message,
        status: status.NOT_FOUND,
        stack: error.stack
      }));
    } else {
      return next(error);
    }
  }
  res.author = author;
  next();
};
