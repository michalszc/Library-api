const APIError = require('../errors/api-error');
const Genre = require('../models/genre-model');
const status = require('http-status');

/**
 * Gets Genre by id passed in route parameters
 * @public
 */
exports.getGenre = async function (req, res, next) {
  let genre;
  try {
    genre = await Genre.findById(req.params.id);
    if (!genre) {
      throw Error('Cannot find genre');
    }
  } catch (error) {
    if (error.message === 'Cannot find genre') {
      return next(new APIError({
        message: error.message,
        status: status.NOT_FOUND,
        stack: error.stack
      }));
    } else {
      return next(error);
    }
  }
  res.genre = genre;
  next();
};
