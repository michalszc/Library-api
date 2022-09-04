const Author = require('../models/author-model');
const APIError = require('../errors/api-error');
const status = require('http-status');
const { get, mapKeys, isNil, has, omit } = require('lodash');
const { addDays } = require('../utils/date');

/**
 * Display list of all Authors.
 * @public
 */
exports.authorList = async function (req, res, next) {
  try {
    const fields = {
      only: get(req, 'body.only'),
      omit: get(req, 'body.omit')
    };
    const options = {
      firstName: get(req, 'body.firstName', ''),
      lastName: get(req, 'body.lastName', ''),
      dateOfBirth: mapKeys(
        get(req, 'body.dateOfBirth', { lte: new Date().toISOString() }),
        (_, key) => `$${key}`
      ),
      or: [
        {
          dateOfDeath: mapKeys(
            get(req, 'body.dateOfDeath', { lte: new Date().toISOString() }),
            (_, key) => `$${key}`
          )
        }
      ],
      sort: get(req, 'body.sort', { firstName: 1 }),
      skip: get(req, 'body.skip', 0),
      limit: get(req, 'body.limit', ''),
      fields: ['__v', '_id', 'firstName', 'lastName', 'dateOfBirth', 'dateOfDeath'].reduce((result, key) => {
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
    if (has(options.dateOfBirth, '$e')) {
      options.dateOfBirth = Object.assign(omit(options.dateOfBirth, ['$e']), {
        $gte: options.dateOfBirth.$e,
        $lte: addDays(options.dateOfBirth.$e).toISOString()
      });
    }
    if (isNil(get(req, 'body.dateOfDeath'))) {
      options.or.push({
        dateOfDeath: undefined
      });
    } else if (has(options.or[0].dateOfDeath, '$e')) {
      options.or[0].dateOfDeath = Object.assign(omit(options.or[0].dateOfDeath, ['$e']), {
        $gte: options.or[0].dateOfDeath.$e,
        $lte: addDays(options.or[0].dateOfDeath.$e).toISOString()
      });
    }
    const authors = await Author.getList(options);
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
