const Author = require('../models/author-model');
const Book = require('../models/book-model');
const Genre = require('../models/genre-model');
const APIError = require('../errors/api-error');
const status = require('http-status');
const { get, mapKeys, isNil, has, omit, capitalize } = require('lodash');
const { addDays } = require('../utils/date');

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
    const author = {
      id: get(req, 'body.authorId', ''),
      obj: get(req, 'body.author', '')
    };
    const genre = {
      id: get(req, 'body.genreId', ''),
      obj: get(req, 'body.genre', '')
    };
    const options = {
      title: get(req, 'body.title', ''),
      summary: get(req, 'body.summary', ''),
      isbn: get(req, 'body.isbn', ''),
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
      }, {}),
      populate: ['author', 'genre'].reduce((result, key) => {
        if (get(req, `body.show${capitalize(key)}`, false)) {
          result.push(key);
        }

        return result;
      }, [])
    };
    if (author.id) {
      options.author = author.id;
    } else if (author.obj) {
      const authorOptions = {
        firstName: get(author, 'obj.firstName', ''),
        lastName: get(author, 'obj.lastName', ''),
        dateOfBirth: mapKeys(
          get(author, 'obj.dateOfBirth', { lte: new Date().toISOString() }),
          (_, key) => `$${key}`
        ),
        or: [
          {
            dateOfDeath: mapKeys(
              get(author, 'obj.dateOfDeath', { lte: new Date().toISOString() }),
              (_, key) => `$${key}`
            )
          }
        ],
        fields: { _id: 1 },
        limit: 1
      };
      if (has(authorOptions.dateOfBirth, '$e')) {
        authorOptions.dateOfBirth = Object.assign(omit(authorOptions.dateOfBirth, ['$e']), {
          $gte: authorOptions.dateOfBirth.$e,
          $lte: addDays(authorOptions.dateOfBirth.$e).toISOString()
        });
      }
      if (isNil(get(author, 'obj.dateOfDeath'))) {
        authorOptions.or.push({
          dateOfDeath: undefined
        });
      } else if (has(authorOptions.or[0].dateOfDeath, '$e')) {
        authorOptions.or[0].dateOfDeath = Object.assign(omit(authorOptions.or[0].dateOfDeath, ['$e']), {
          $gte: authorOptions.or[0].dateOfDeath.$e,
          $lte: addDays(authorOptions.or[0].dateOfDeath.$e).toISOString()
        });
      }
      const _id = get(await Author.getList(authorOptions), '[0]._id');
      if (_id) {
        options.author = _id;
      } else {
        res.json({ books: [] });
      }
    }
    if (genre.id) {
      options.genre = genre.id;
    } else if (genre.obj && Array.isArray(genre.obj)) {
      const genres = await Genre.getList({ or: genre.obj });
      if (Array.isArray(genres) && genres.length === genre.obj.length) {
        options.genre = genres.map(({ _id }) => _id);
      } else {
        res.json({ books: [] });
      }
    } else if (genre.obj) {
      const genreOptions = {
        name: get(genre, 'obj.name', ''),
        fields: { _id: 1 },
        limit: 1
      };
      const _id = get(await Genre.getList(genreOptions), '[0]._id');
      if (_id) {
        options.genre = _id;
      } else {
        res.json({ books: [] });
      }
    }
    if (fields.only && !fields.only.includes('_id')) {
      options.fields._id = 0;
    }
    const books = await Book.getList(options);
    res.json({ books });
  } catch (error) {
    next(error);
  }
};

/**
 * Display details for a specific Book.
 * @public
 */
exports.bookDetail = async function (req, res, next) {
  try {
    res.json({ book: res.book });
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};

/**
 * Handle create many books.
 * @public
 */
exports.bookCreateMany = async function (req, res, next) {
  try {
    const books = res.books;
    for (const book of books) {
      await Book.checkExistence(book);
    }
    const newBooks = await Book.insertMany(books);
    res.status(status.CREATED).json({ books: newBooks });
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
    res.status(status.CREATED).json({ book: newBook });
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

/**
 * Handle delete many books.
 * @public
 */
exports.bookDeleteMany = async function (req, res, next) {
  try {
    const { deletedCount } = await Book.deleteMany({ _id: req.body.ids });
    res.json({ message: 'Deleted books', deletedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Book delete.
 * @public
 */
exports.bookDelete = async function (req, res, next) {
  try {
    const deletedBook = await res.book.remove();
    res.json({ message: 'Deleted book', book: deletedBook });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Book update many.
 * @public
 */
exports.bookUpdateMany = async function (req, res, next) {
  try {
    const bulkArr = req.body.books.map(({ id, ...update }) => (
      {
        updateOne: {
          filter: { _id: id },
          update
        }
      }
    ));
    const updatedBooks = await Book.bulkWrite(bulkArr);
    const updateCount = get(updatedBooks, 'result.nModified', 0);
    res.json({ books: req.body.books, updateCount });
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};

/**
 * Handle Book update.
 * @public
 */
exports.bookUpdate = async function (req, res, next) {
  const { title, summary, isbn } = req.body;
  const { author, book, genre } = res;
  if (title) {
    book.title = title;
  }
  if (author) {
    book.author = author;
  }
  if (summary) {
    book.summary = summary;
  }
  if (isbn) {
    book.isbn = isbn;
  }
  if (genre) {
    book.genre = genre;
  }
  try {
    const updatedBook = await book.saveIfNotExists();
    res.json({ book: updatedBook });
  } catch (error) {
    next(new APIError({
      message: error.message,
      status: status.BAD_REQUEST,
      stack: error.stack
    }));
  }
};
