const APIError = require('../errors/api-error');
const Genre = require('../models/genre-model');
const status = require('http-status');
const { get } = require('lodash');

/**
 * Gets Genre by id passed in route parameters
 * @public
 */
exports.getGenre = async function (req, res, next) {
  const only = get(req, 'body.only');
  const omit = get(req, 'body.omit');
  const fields = ['__v', '_id', 'name'].reduce((result, key) => {
    if (only && only.includes(key)) {
      result[key] = 1;
    } else if (omit && omit.includes(key)) {
      result[key] = 0;
    }

    return result;
  }, {});
  if (only && !only.includes('_id')) {
    fields._id = 0;
  }
  try {
    const genre = await Genre.findById(req.params.id, fields);
    if (!genre) {
      throw Error(`Cannot find genre with id ${req.params.id}`);
    }
    res.genre = genre;
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

/**
 * Check existence of genres with ids passed by body argument
 * @public
 */
exports.checkExistence = async function (req, res, next) {
  try {
    const ids = req.body.ids || req.body.genres.map(({ id }) => id);
    const genresIds = await Genre.find({ _id: ids }, { _id: 1, name: 0 })
      .then(r => r.map(({ _id }) => _id.toString()));
    const idsNotFound = ids.filter(id => !genresIds.includes(id));
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
