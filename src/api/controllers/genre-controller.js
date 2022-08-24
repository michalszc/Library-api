const Genre = require('../models/genre-model');
const APIError = require('../errors/api-error');
const status = require('http-status');

/**
 * Display list of all Genre.
 * @public
 */
exports.genreList = async function (req, res, next) {
  try {
    const genres = await Genre.getList();
    res.json({ genres });
  } catch (error) {
    next(error);
  }
};

/**
 * Display details for a specific Genre.
 * @public
 */
exports.genreDetail = async function (req, res, next) {
  try {
    res.json({ genre: res.genre, listOfBooks: null }); // ADD LIST OF BOOKS WITH THIS GENRE
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};

/**
 * Handle Genre create.
 * @public
 */
exports.genreCreate = async function (req, res, next) {
  const genre = new Genre({
    name: req.body.name
  });
  try {
    const newGenre = await genre.saveIfNotExists();
    res.status(status.CREATED).json(newGenre);
  } catch (error) {
    if (error.message === 'Genre already exists') {
      next(new APIError({
        message: error.message,
        status: status.BAD_REQUEST,
        stack: error.stack
      }));
    } else {
      next(error);
    }
  }
};

/**
 * Handle Genre delete.
 * @public
 */
exports.genreDelete = async function (req, res, next) {
  try {
    await res.genre.remove();
    res.json({ message: 'Deleted genre' });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Genre update.
 * @public
 */
exports.genreUpdate = async function (req, res, next) {
  if (req.body?.name) {
    res.genre.name = req.body.name;
  }
  try {
    const updatedGenre = await res.genre.saveIfNotExists();
    res.json(updatedGenre);
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};
