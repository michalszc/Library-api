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
      throw Error(`Cannot find genre with id ${req.params.id}`);
    }
  } catch (error) {
    if (error.message.startsWith('Cannot find genre')) {
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
    const genresIds = await Genre.find({ _id: req.body.ids }, { _id: 1, name: 0 })
      .then(r => r.map(({ _id }) => _id.toString()));
    console.log(genresIds);
    const idsNotFound = req.body.ids.filter(id => !genresIds.includes(id));
    if (idsNotFound.length !== 0) {
      throw Error(`Cannot find genre(s) with id(s) ${idsNotFound.join()}`);
    }
  } catch (error) {
    if (error.message.startsWith('Cannot find genre')) {
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
