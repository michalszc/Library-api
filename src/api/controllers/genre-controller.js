const Genre = require('../models/genre-model');
const APIError = require('../errors/api-error');
const status = require('http-status');
const { get } = require('lodash');

/**
 * Display list of genres.
 * @public
 */
exports.genreList = async function (req, res, next) {
  try {
    const name = req.body.name || '';
    const sort = req.body.sort || ['name', 'ascending'];
    const genres = await Genre.getList({ name, sort });
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
    if (error.message.startsWith('Genre(s) with name(s)')) {
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
 * Handle create many genres.
 * @public
 */
exports.genreCreateMany = async function (req, res, next) {
  try {
    await Genre.checkExistence(req.body.names);
    const arr = req.body.names.map(name => ({ name }));
    const newGenres = await Genre.insertMany(arr);
    res.status(status.CREATED).json(newGenres);
  } catch (error) {
    if (error.message.startsWith('Genre(s) with name(s)')) {
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
    const deletedGenre = await res.genre.remove();
    res.json({ message: 'Deleted genre', deletedGenre });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle delete many genres.
 * @public
 */
exports.genreDeleteMany = async function (req, res, next) {
  try {
    const { deletedCount } = await Genre.deleteMany({ _id: req.body.ids });
    res.json({ message: 'Deleted genres', deletedCount });
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

/**
 * Handle Genre update many.
 * @public
 */
exports.genreUpdateMany = async function (req, res, next) {
  try {
    const bulkArr = req.body.genres.map(({ id, name }) => (
      {
        updateOne: {
          filter: { _id: id },
          update: { name }
        }
      }
    ));
    const updatedGenres = await Genre.bulkWrite(bulkArr);
    const updateCount = get(updatedGenres, 'result.nModified', 0);
    res.json({ genres: req.body.genres, updateCount });
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};
