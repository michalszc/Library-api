const Book = require('../models/book-model');
const APIError = require('../errors/api-error');
const status = require('http-status');

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
