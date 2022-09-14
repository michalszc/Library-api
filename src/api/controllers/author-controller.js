const Author = require('../models/author-model');
const Book = require('../models/book-model');
const APIError = require('../errors/api-error');
const status = require('http-status');
const { get, mapKeys, isNil, has, omit } = require('lodash');
const { addDays, isBefore } = require('../utils/date');

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
 * Display details for a specific Author.
 * @public
 */
exports.authorDetail = async function (req, res, next) {
  try {
    const result = { author: res.author };
    if (req.body?.showBookList) {
      result.listOfBooks = await Book.getList({ author: res.author._id, fields: { author: 0 } });
    }
    res.json(result);
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};

/**
 * Handle create many authors.
 * @public
 */
exports.authorCreateMany = async function (req, res, next) {
  try {
    const authors = req.body.authors;
    for (const author of authors) {
      await Author.checkExistence(author);
    }
    const newAuthors = await Author.insertMany(authors);
    res.status(status.CREATED).json({ authors: newAuthors });
  } catch (error) {
    if (error.message === 'Author(s) already exist(s)') {
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
    if (error.message === 'Author(s) already exist(s)') {
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
 * Handle delete many authors.
 * @public
 */
exports.authorDeleteMany = async function (req, res, next) {
  try {
    const { deletedCount } = await Author.deleteMany({ _id: req.body.ids });
    res.json({ message: 'Deleted authors', deletedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Author delete.
 * @public
 */
exports.authorDelete = async function (req, res, next) {
  try {
    const deletedAuthor = await res.author.remove();
    res.json({ message: 'Deleted author', deletedAuthor });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Author update many.
 * @public
 */
exports.authorUpdateMany = async function (req, res, next) {
  try {
    const bulkArr = req.body.authors.map(({ id, ...update }) => (
      {
        updateOne: {
          filter: { _id: id },
          update
        }
      }
    ));
    const updatedAuthors = await Author.bulkWrite(bulkArr);
    const updateCount = get(updatedAuthors, 'result.nModified', 0);
    res.json({ authors: req.body.authors, updateCount });
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};

/**
 * Handle Author update.
 * @public
 */
exports.authorUpdate = async function (req, res, next) {
  if (req.body?.firstName) {
    res.author.firstName = req.body.firstName;
  }
  if (req.body?.lastName) {
    res.author.lastName = req.body.lastName;
  }
  if (req.body?.dateOfBirth) {
    res.author.dateOfBirth = req.body.dateOfBirth;
  }
  if (req.body?.dateOfDeath) {
    res.author.dateOfDeath = req.body.dateOfDeath;
  }
  try {
    const { dateOfBirth, dateOfDeath } = res.author;
    if (dateOfDeath && !isBefore(dateOfBirth, dateOfDeath)) {
      throw Error(`Incorrect dates: date of death (${dateOfDeath}) is before date of birth (${dateOfBirth})`);
    }
    const updatedAuthor = await res.author.saveIfNotExists();
    res.json(updatedAuthor);
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};
