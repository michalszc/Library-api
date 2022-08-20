const Genre = require('../models/genre-model');
const APIError = require('../errors/api-error');
const status = require('http-status');

// Display list of all Genre.
exports.genreList = async function (req, res, next) {
  try {
    const genres = await Genre.find().sort([['name', 'ascending']]);
    res.json({ title: 'Genre List', genres: genres.map(({ name }) => name) });
  } catch (error) {
    next(error);
  }
};

// Display details for a specific Genre.
exports.genreDetail = async function (req, res, next) {
  try {
    res.json({ title: 'Genre', genre: res.genre.name, listOfBooks: null }); // ADD LIST OF BOOKS WITH THIS GENRE
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};

// Handle Genre create.
exports.genreCreate = async function (req, res, next) {
  const genre = new Genre({
    name: req.body.name
  });
  try {
    const one = await Genre.findOne({ name: req.body.name });
    if (one) {
      throw Error('Genre already exists');
    }
    const newGenre = await genre.save();
    res.status(status.CREATED).json(newGenre);
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};

// Handle Genre delete.
exports.genreDelete = async function (req, res, next) {
  try {
    await res.genre.remove();
    res.json({ message: 'Deleted genre' });
  } catch (error) {
    next(error);
  }
};

// Handle Genre update
exports.genreUpdate = async function (req, res, next) {
  if (req.body?.name) {
    res.genre.name = req.body.name;
  }
  try {
    const updatedGenre = await res.genre.save();
    res.json(updatedGenre);
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};
