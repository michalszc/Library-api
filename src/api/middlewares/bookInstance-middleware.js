const APIError = require('../errors/api-error');
const Author = require('../models/author-model');
const Book = require('../models/book-model');
const BookInstance = require('../models/bookinstance-model');
const Genre = require('../models/genre-model');
const status = require('http-status');
const { get, omit, capitalize } = require('lodash');

/**
 * Get book ID if book exist
 * @public
 */
exports.getBook = async function (req, res, next) {
  try {
    const { book, bookId } = req.body;
    if (bookId && await Book.findById(bookId)) {
      res.book = bookId;
    } else if (book) {
      const { authorId, author, genreId, genre } = book;
      const book2find = omit(book, ['authorId', 'author', 'genreId', 'genre']);
      if (authorId && await Author.findById(authorId)) {
        book2find.author = authorId;
      } else if (author) {
        const id = get(await Author.findOne(author, { _id: 1 }), '_id');
        if (id) {
          book2find.author = id.toString();
        }
      }

      if (!book2find.author && (authorId || author)) {
        throw Error('Cannot find author');
      }

      if (genreId && Array.isArray(genreId)) {
        const ids = genreId.map(id => ({ _id: id }));
        const grenreIds = await Genre.getList({ or: ids });
        if (Array.isArray(grenreIds) && grenreIds.length === genreId.length) {
          book2find.genre = genreId;
        }
      } else if (genreId && await Genre.findById(genreId)) {
        book2find.genre = genreId;
      } else if (genre && Array.isArray(genre)) {
        const genres = await Genre.getList({ or: genre });
        if (Array.isArray(genres) && genres.length === genre.length) {
          book2find.genre = genres.map(({ _id }) => _id);
        }
      } else if (genre) {
        const id = get(await Genre.findOne(genre, { _id: 1 }), '_id');
        if (id) {
          book2find.genre = id.toString();
        }
      }

      if (!book2find.genre && (genreId || genre)) {
        throw Error('Cannot find genre');
      }

      const book2findId = get(await Book.getList({
        ...book2find,
        limit: 1,
        fields: { _id: 1 }
      }), '[0]._id');
      if (book2findId) {
        res.book = book2findId;
      }
    }
    if (!res.book && (book || bookId)) {
      throw Error('Cannot find book');
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
 * Gets Book instance by id passed in route parameters
 * @public
 */
exports.getBookInstance = async function (req, res, next) {
  const only = get(req, 'body.only');
  const omit = get(req, 'body.omit');
  const fields = ['__v', '_id', 'book', 'publisher', 'status', 'back'].reduce((result, key) => {
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
  const populate = ['book', 'author', 'genre'].reduce((result, key) => {
    if (get(req, `body.show${capitalize(key)}`, false)) {
      if (result.length === 0) {
        result.push({ path: 'book' });
      }
      if (['author', 'genre'].includes(key)) {
        ((result[0]?.populate) || (result[0].populate = [])).push({ path: key });
      }
    }

    return result;
  }, []);
  try {
    const bookInstance = await BookInstance.findById(req.params.id, fields, { populate });
    if (!bookInstance) {
      throw Error(`Cannot find book instance with id ${req.params.id}`);
    }
    res.bookInstance = bookInstance;
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
 * Check existence of book instances with ids passed by body argument
 * @public
 */
exports.checkExistence = async function (req, res, next) {
  try {
    const ids = req.body.ids;
    const bookInstancesIds = await BookInstance.find({ _id: ids }, { _id: 1, name: 0 })
      .then(r => r.map(({ _id }) => _id.toString()));
    const idsNotFound = ids.filter(id => !bookInstancesIds.includes(id));
    if (idsNotFound.length !== 0) {
      throw Error(`Cannot find book instance(s) with id(s) ${idsNotFound.join()}`);
    }
  } catch (error) {
    if (error.message.startsWith('Cannot find book instance')) {
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
