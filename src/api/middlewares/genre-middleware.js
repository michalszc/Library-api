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

/**
 * Check existence of genres with ids passed by body argument
 * @public
 */
exports.checkExistence = async function (req, res, next) {
  try {
    const genres = await Genre.find({ _id: req.body.ids });
    let allExists;
    if (Array.isArray(genres)) {
      const genresIds = genres.map(({ _id }) => _id.toString());
      allExists = !req.body.ids.every(id => genresIds.includes(id));
    } else {
      allExists = req.body.ids > 1 || genres;
    }
    if (allExists) {
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
  next();
};
