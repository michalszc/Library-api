const APIError = require('../errors/api-error');
const Author = require('../models/author-model');
const Book = require('../models/book-model');
const Genre = require('../models/genre-model');
const status = require('http-status');
const { get, capitalize, omit } = require('lodash');

/**
 * Get the author ID and genre ID if author and genre exist
 * @public
 */
exports.getAuthorAndGenre = async function (req, res, next) {
  const { authorId, author, genreId, genre } = req.body;
  try {
    if (authorId && await Author.findById(authorId)) {
      res.author = authorId;
    } else if (author) {
      const id = get(await Author.findOne(author, { _id: 1 }), '_id');
      if (id) {
        res.author = id.toString();
      }
    }

    if (!res.author && (authorId || author)) {
      throw Error('Cannot find author');
    }

    if (genreId && Array.isArray(genreId)) {
      const ids = genreId.map(id => ({ _id: id }));
      const grenreIds = await Genre.getList({ or: ids });
      if (Array.isArray(grenreIds) && grenreIds.length === genreId.length) {
        res.genre = ids;
      }
    } else if (genreId && await Genre.findById(genreId)) {
      res.genre = genreId;
    } else if (genre && Array.isArray(genre)) {
      const genres = await Genre.getList({ or: genre });
      if (Array.isArray(genres) && genres.length === genre.length) {
        res.genre = genres.map(({ _id }) => _id);
      }
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
 * Get the author ID and genre ID for multiple books if author and genre exist
 * @public
 */
exports.getAuthorAndGenreMultiple = async function (req, res, next) {
  const books_ = req.body.books;
  try {
    const books = [];
    for (const book_ of books_) {
      const { authorId, author, genreId, genre } = book_;
      const book = omit(book_, ['authorId', 'author', 'genreId', 'genre']);
      if (authorId && await Author.findById(authorId)) {
        book.author = authorId;
      } else if (author) {
        const id = get(await Author.findOne(author, { _id: 1 }), '_id');
        if (id) {
          book.author = id.toString();
        }
      }

      if (!book.author && (authorId || author)) {
        throw Error('Cannot find author');
      }

      if (genreId && Array.isArray(genreId)) {
        const ids = genreId.map(id => ({ _id: id }));
        const grenreIds = await Genre.getList({ or: ids });
        if (Array.isArray(grenreIds) && grenreIds.length === genreId.length) {
          book.genre = ids;
        }
      } else if (genreId && await Genre.findById(genreId)) {
        book.genre = genreId;
      } else if (genre && Array.isArray(genre)) {
        const genres = await Genre.getList({ or: genre });
        if (Array.isArray(genres) && genres.length === genre.length) {
          book.genre = genres.map(({ _id }) => _id);
        }
      } else if (genre) {
        const id = get(await Genre.findOne(genre, { _id: 1 }), '_id');
        if (id) {
          book.genre = id.toString();
        }
      }

      if (!book.genre && (genreId || genre)) {
        throw Error('Cannot find genre');
      }
      books.push(book);
    }
    res.books = books;
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
  const only = get(req, 'body.only');
  const omit = get(req, 'body.omit');
  const fields = ['__v', '_id', 'title', 'author', 'summary', 'isbn', 'genre'].reduce((result, key) => {
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
  const populate = ['author', 'genre'].reduce((result, key) => {
    if (get(req, `body.show${capitalize(key)}`, false)) {
      result.push(key);
    }

    return result;
  }, []);
  try {
    const book = await Book.findById(req.params.id, fields, { populate });
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

/**
 * Check existence of books with ids passed by body argument
 * @public
 */
 exports.checkExistence = async function (req, res, next) {
  try {
    const ids = req.body.ids;
    const booksIds = await Book.find({ _id: ids }, { _id: 1, name: 0 })
      .then(r => r.map(({ _id }) => _id.toString()));
    const idsNotFound = ids.filter(id => !booksIds.includes(id));
    if (idsNotFound.length !== 0) {
      throw Error(`Cannot find book(s) with id(s) ${idsNotFound.join()}`);
    }
  } catch (error) {
    if (error.message.startsWith('Cannot find book')) {
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
