const Author = require('../models/author-model');
const APIError = require('../errors/api-error');
const status = require('http-status');

/**
 * Display list of all Authors.
 * @public
 */
exports.authorList = async function (req, res, next) {
  try {
    const authors = await Author.getList();
    res.json({ authors });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Author create.
 * @public
 */
exports.authorCreate = async function (req, res, next) {
  const author = new Author({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dateOfBirth: req.body.dateOfBirth,
    dateOfDeath: req.body?.dateOfDeath
  });
  try {
    const newAuthor = await author.saveIfNotExists();
    res.status(status.CREATED).json(newAuthor);
  } catch (error) {
    if (error.message === 'Author already exists') {
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
 * Display details for a specific Author.
 * @public
 */
exports.authorDetail = async function (req, res, next) {
  try {
    res.json({ author: res.author, listOfBooks: null }); // ADD LIST OF BOOKS WITH THIS AUTHOR
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};
