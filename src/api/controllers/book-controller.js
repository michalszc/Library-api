const Book = require('../models/book-model');
const APIError = require('../errors/api-error');
const status = require('http-status');
const { get } = require('lodash');

/**
 * Display list of all Books.
 * @public
 */
exports.bookList = async function (req, res, next) {
  try {
    const fields = {
      only: get(req, 'body.only'),
      omit: get(req, 'body.omit')
    };
    const options = {
      title: get(req, 'body.title', ''),
      author: get(req, 'body.authorId', ''),
      summary: get(req, 'body.summary', ''),
      isbn: get(req, 'body.isbn', ''),
      genre: get(req, 'body.genreId', ''),
      sort: get(req, 'body.sort', { title: 1 }),
      skip: get(req, 'body.skip', 0),
      limit: get(req, 'body.limit', ''),
      fields: ['__v', '_id', 'title', 'author', 'summary', 'isbn', 'genre'].reduce((result, key) => {
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
    if (fields.only) {
      if (!fields.only.includes('_id')) {
        options.fields._id = 0;
      }
      if (!fields.only.includes('author')) {
        options.fields.author = 0;
      }
      if (!fields.only.includes('genre')) {
        options.fields.genre = 0;
      }
    }
    const books = await Book.getList(options);
    res.json({ books });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Book create.
 * @public
 */
exports.bookCreate = async function (req, res, next) {
  const book = new Book({
    title: req.body.title,
    author: res.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: res?.genre
  });
  try {
    const newBook = await book.saveIfNotExists();
    res.status(status.CREATED).json(newBook);
  } catch (error) {
    if (error.message === 'Book(s) already exist(s)') {
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
