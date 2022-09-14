const Book = require('../models/book-model');
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
    const fields = {
      only: get(req, 'body.only'),
      omit: get(req, 'body.omit')
    };
    const options = {
      name: get(req, 'body.name', ''),
      sort: get(req, 'body.sort', { name: 1 }),
      skip: get(req, 'body.skip', 0),
      limit: get(req, 'body.limit', ''),
      fields: ['__v', '_id', 'name'].reduce((result, key) => {
        if (fields.only && fields.only.includes(key)) {
          result[key] = 1;
        } else if (fields.omit && fields.omit.includes(key)) {
          result[key] = 0;
        }

        return result;
      }, {})
    };
    if (fields.only && !fields.only.includes('_id')) {
      options.fields._id = 0;
    }
    const genres = await Genre.getList(options);
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
    const result = { genre: res.genre };
    if (req.body?.showBookList) {
      result.listOfBooks = await Book.getList({ genre: res.genre._id, fields: { genre: 0 } });
    }
    res.json(result);
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
