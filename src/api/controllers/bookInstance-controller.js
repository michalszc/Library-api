const BookInstance = require('../models/bookinstance-model');
const APIError = require('../errors/api-error');
const status = require('http-status');
const { get, capitalize, mapKeys, has, omit } = require('lodash');
const { addDays } = require('../utils/date');

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
      book: get(res, 'book', ''),
      publisher: get(req, 'body.publisher', ''),
      status: get(req, 'body.status', ''),
      back: mapKeys(get(req, 'body.back'), (_, key) => `$${key}`),
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
      }, {}),
      populate: ['book', 'author', 'genre'].reduce((result, key) => {
        if (get(req, `body.show${capitalize(key)}`, false)) {
          if (result.length === 0) {
            result.push({ path: 'book' });
          }
          if (['author', 'genre'].includes(key)) {
            ((result[0]?.populate) || (result[0].populate = [])).push({ path: key });
          }
        }

        return result;
      }, [])
    };
    if (fields.only && !fields.only.includes('_id')) {
      options.fields._id = 0;
    }

    if (has(options.back, '$e')) {
      options.back = Object.assign(omit(options.back, ['$e']), {
        $gte: options.back.$e,
        $lte: addDays(options.back.$e).toISOString()
      });
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