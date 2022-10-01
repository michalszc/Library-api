const BookInstance = require('../models/bookinstance-model');
const APIError = require('../errors/api-error');
const status = require('http-status');
const { get } = require('lodash');

/**
 * Display list of book instances.
 * @public
 */
exports.bookInstanceList = async function (req, res, next) {
  try {
    const fields = {
      only: get(req, 'body.only'),
      omit: get(req, 'body.omit')
    };
    const options = {
      publisher: get(req, 'body.publisher', ''),
      status: get(req, 'body.status', ''),
      sort: get(req, 'body.sort', { status: 1 }),
      skip: get(req, 'body.skip', 0),
      limit: get(req, 'body.limit', ''),
      fields: ['__v', '_id', 'book', 'publisher', 'status', 'back'].reduce((result, key) => {
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
    const bookInsances = await BookInstance.getList(options);
    res.json({ bookInsances });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle book instance create.
 * @public
 */
exports.bookInstanceCreate = async function (req, res, next) {
  const bookInstance = new BookInstance({
    book: res.book,
    publisher: req.body.publisher,
    status: req.body.status,
    back: req.body?.back
  });
  try {
    const newBookInstance = await bookInstance.saveIfNotExists();
    res.status(status.CREATED).json(newBookInstance);
  } catch (error) {
    if (error.message === 'Book instance(s) already exist(s)') {
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
