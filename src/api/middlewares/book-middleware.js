const APIError = require('../errors/api-error');
const Author = require('../models/author-model');
const Book = require('../models/book-model');
const Genre = require('../models/genre-model');
const status = require('http-status');
const { get } = require('lodash');

/**
 * Get the author ID and genre ID if author and genre exist
 * @public
 */
exports.getAuthorAndGenre = async function (req, res, next) {
  const { authorId, author, genreId, genre } = req.body;
  try {
    if (authorId && Author.findById(authorId)) {
      res.author = authorId;
    } else if (author) {
      const id = get(await Author.findOne(author, { _id: 1 }), '_id');
      if (id) {
        res.author = id.toString();
      }
    }

    if (!res.author) {
      throw Error('Cannot find author');
    }

    if (genreId && Genre.findById(genreId)) {
      res.genre = genreId;
    } else if (genre) {
      const id = get(await Genre.findOne(genre, { _id: 1 }), '_id');
      if (id) {
        res.genre = id.toString();
      }
    }

    if (!res.genre && (genreId || genre)) {
      throw Error('Cannot find genre');
    }
  } catch (error) {
    if (error.message.startsWith('Cannot find')) {
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
 * Gets Book by id passed in route parameters
 * @public
 */
exports.getBook = async function (req, res, next) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      throw Error(`Cannot find book with id ${req.params.id}`);
    }
    res.book = book;
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
