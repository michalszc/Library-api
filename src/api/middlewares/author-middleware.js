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

/**
 * Check existence of authors with ids passed by body argument
 * @public
 */
exports.checkExistence = async function (req, res, next) {
  try {
    const ids = req.body.ids || req.body.authors.map(({ id }) => id);
    const authorsIds = await Author.find({ _id: ids }, { _id: 1, name: 0 })
      .then(r => r.map(({ _id }) => _id.toString()));
    const idsNotFound = ids.filter(id => !authorsIds.includes(id));
    if (idsNotFound.length !== 0) {
      throw Error(`Cannot find author(s) with id(s) ${idsNotFound.join()}`);
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
  next();
};
