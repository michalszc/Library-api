const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const app = require('../../src/config/express');
const supertest = require('supertest');
const mongoose = require('../../src/config/mongoose');
const Author = require('../../src/api/models/author-model');
const Book = require('../../src/api/models/book-model');
const BookInstance = require('../../src/api/models/bookinstance-model');
const Genre = require('../../src/api/models/genre-model');
const { addDays } = require('../../src/api/utils/date');
const request = supertest(app);

describe('BOOKINSTANCE ROUTES', () => {
  let mongodb, connection;
  beforeAll(async () => {
    ({ connection, mongodb } = await mongoose.connect());
  });
  afterAll(async () => {
    await connection.disconnect();
    await mongodb.stop();
  });
  describe('List book instances', () => {
    let bookInstances;
    let book;
    beforeAll(async () => {
      const _genre = new Genre({ name: 'Fantasy' });
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author({
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      });
      await _author.save();
      const authorId = _author._id.toString();
      book = {
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      };
      const _book = new Book(book);
      await _book.save();
      const bookId = _book._id.toString();
      bookInstances = [
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Available'
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Loaned',
          back: new Date('2020-04-19').toISOString()
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Maintenance',
          back: new Date('2020-04-23').toISOString()
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Reserved',
          back: new Date('2020-04-19').toISOString()
        }
      ];
      await BookInstance.insertMany(bookInstances);
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should return full list of book instances', (done) => {
      request
        .get('/bookInstances')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstances');
          expect(res.body.bookInstances).toBeInstanceOf(Array);
          expect(res.body.bookInstances).toHaveLength(bookInstances.length);
          res.body.bookInstances.forEach((bookInstance, i) => {
            expect(bookInstance).toMatchObject({
              _id: expect.any(String),
              book: bookInstances.at(i).book,
              publisher: bookInstances.at(i).publisher,
              status: bookInstances.at(i).status,
              back: bookInstances.at(i).back ?? expect.any(String),
              __v: expect.any(Number)
            });
          });

          return done();
        });
    });
    test('should return list of book instances which match the passed status', (done) => {
      request
        .get('/bookInstances')
        .send({
          status: 'Available'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstances');
          expect(res.body.bookInstances).toBeInstanceOf(Array);
          expect(res.body.bookInstances).toHaveLength(1);
          expect(res.body.bookInstances[0]).toMatchObject({
            _id: expect.any(String),
            book: bookInstances.at(0).book,
            publisher: bookInstances.at(0).publisher,
            status: bookInstances.at(0).status,
            back: expect.any(String),
            __v: expect.any(Number)
          });

          return done();
        });
    }); // eslint-disable-next-line max-len
    test('should return list of book instances with limited number of result to 2 and skipped first result', (done) => {
      request
        .get('/bookInstances')
        .send({
          skip: 1,
          limit: 2
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstances');
          expect(res.body.bookInstances).toBeInstanceOf(Array);
          expect(res.body.bookInstances).toHaveLength(2);
          res.body.bookInstances.forEach((bookInstance, i) => {
            expect(bookInstance).toMatchObject({
              _id: expect.any(String),
              book: bookInstances.at(i + 1).book,
              publisher: bookInstances.at(i + 1).publisher,
              status: bookInstances.at(i + 1).status,
              back: bookInstances.at(i + 1).back ?? expect.any(String),
              __v: expect.any(Number)
            });
          });

          return done();
        });
    });
    test('should return list of book instances sorted ascending by back date', (done) => {
      request
        .get('/bookInstances')
        .send({
          sort: {
            back: 1
          }
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstances');
          expect(res.body.bookInstances).toBeInstanceOf(Array);
          expect(res.body.bookInstances).toHaveLength(bookInstances.length);
          const sortedBookInstances = bookInstances.slice().sort((a, b) => {
            const backA = a.back ?? new Date().toISOString();
            const backB = b.back ?? new Date().toISOString();

            return new Date(backA) - new Date(backB);
          });
          res.body.bookInstances.forEach((bookInstance, i) => {
            expect(bookInstance).toMatchObject({
              _id: expect.any(String),
              book: sortedBookInstances.at(i).book,
              publisher: sortedBookInstances.at(i).publisher,
              status: sortedBookInstances.at(i).status,
              back: sortedBookInstances.at(i).back ?? expect.any(String),
              __v: expect.any(Number)
            });
          });

          return done();
        });
    });
    test('should return list of book instances with only _id field', (done) => {
      request
        .get('/bookInstances')
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstances');
          expect(res.body.bookInstances).toBeInstanceOf(Array);
          expect(res.body.bookInstances).toHaveLength(bookInstances.length);
          res.body.bookInstances.forEach((bookInstance) => {
            expect(bookInstance).toHaveProperty('_id');
            expect(bookInstance).not.toHaveProperty('book');
            expect(bookInstance).not.toHaveProperty('publisher');
            expect(bookInstance).not.toHaveProperty('status');
            expect(bookInstance).not.toHaveProperty('back');
            expect(bookInstance).not.toHaveProperty('__v');
          });

          return done();
        });
    });
    test('should return list of book instances with omitted _id and __v field', (done) => {
      request
        .get('/bookInstances')
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstances');
          expect(res.body.bookInstances).toBeInstanceOf(Array);
          expect(res.body.bookInstances).toHaveLength(bookInstances.length);
          res.body.bookInstances.forEach((bookInstance) => {
            expect(bookInstance).not.toHaveProperty('_id');
            expect(bookInstance).toHaveProperty('book');
            expect(bookInstance).toHaveProperty('publisher');
            expect(bookInstance).toHaveProperty('status');
            expect(bookInstance).toHaveProperty('back');
            expect(bookInstance).not.toHaveProperty('__v');
          });

          return done();
        });
    });
  });
  describe('Get book instance', () => {
    let bookInstance;
    let bookInstanceId;
    let book;
    const author = {
      firstName: 'Ben',
      lastName: 'Bova',
      dateOfBirth: '1932-11-07T23:00:00.000Z'
    };
    const genre = { name: 'Fantasy' };
    beforeAll(async () => {
      const _genre = new Genre(genre);
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author(author);
      await _author.save();
      const authorId = _author._id.toString();
      book = {
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      };
      const _book = new Book(book);
      await _book.save();
      const bookId = _book._id.toString();
      bookInstance = {
        book: bookId,
        publisher: 'Publisher',
        status: 'Loaned',
        back: new Date('2020-04-19').toISOString()
      };
      const _bookInstance = new BookInstance(bookInstance);
      await _bookInstance.save();
      bookInstanceId = _bookInstance._id.toString();
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should return book instance', (done) => {
      request
        .get(`/bookInstances/${bookInstanceId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstance');
          expect(res.body.bookInstance).toMatchObject({
            _id: bookInstanceId,
            book: bookInstance.book,
            publisher: bookInstance.publisher,
            status: bookInstance.status,
            back: bookInstance.back,
            __v: expect.any(Number)
          });

          return done();
        });
    });
    test('should return book instance with book object and author object and genre object(s)', (done) => {
      request
        .get(`/bookInstances/${bookInstanceId}`)
        .send({
          showBook: true,
          showAuthor: true,
          showGenre: true
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstance');
          expect(res.body.bookInstance).toMatchObject({
            _id: bookInstanceId,
            book: {
              _id: expect.any(String),
              title: book.title,
              author: {
                _id: expect.any(String),
                firstName: author.firstName,
                lastName: author.lastName,
                dateOfBirth: author.dateOfBirth,
                __v: expect.any(Number)
              },
              summary: book.summary,
              isbn: book.isbn,
              genre: [
                genre
              ],
              __v: expect.any(Number)
            },
            publisher: bookInstance.publisher,
            status: bookInstance.status,
            back: bookInstance.back,
            __v: expect.any(Number)
          });

          return done();
        });
    });
    test('should return book instance with only _id field', (done) => {
      request
        .get(`/bookInstances/${bookInstanceId}`)
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstance');
          expect(res.body.bookInstance).toHaveProperty('_id');
          expect(res.body.bookInstance).not.toHaveProperty('book');
          expect(res.body.bookInstance).not.toHaveProperty('publisher');
          expect(res.body.bookInstance).not.toHaveProperty('status');
          expect(res.body.bookInstance).not.toHaveProperty('back');
          expect(res.body.bookInstance).not.toHaveProperty('__v');

          return done();
        });
    });
    test('should return book instance with omitted _id and __v field', (done) => {
      request
        .get(`/bookInstances/${bookInstanceId}`)
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstance');
          expect(res.body.bookInstance).not.toHaveProperty('_id');
          expect(res.body.bookInstance).toHaveProperty('book');
          expect(res.body.bookInstance).toHaveProperty('publisher');
          expect(res.body.bookInstance).toHaveProperty('status');
          expect(res.body.bookInstance).toHaveProperty('back');
          expect(res.body.bookInstance).not.toHaveProperty('__v');

          return done();
        });
    });
    test('should not return book instance due to validation error', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      request
        .get(`/bookInstances/${invalidId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400, // eslint-disable-next-line max-len
            message: `Validation Error: params: "id" with value "${invalidId}" fails to match the required pattern: /^[a-fA-F0-9]{24}$/`,
            errors: 'Bad Request'
          });

          return done();
        });
    });
    test('should not return book instance due to because cannot find', (done) => {
      const notFoundId = '63091e5e4ec3fbc5c720db4c';
      request
        .get(`/bookInstances/${notFoundId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 404,
            message: `Cannot find book instance with id ${notFoundId}`
          });

          return done();
        });
    });
  });
  describe('Create book instance', () => {
    let bookId;
    let book;
    const bookInstance = {
      publisher: 'Publisher',
      status: 'Loaned',
      back: addDays(new Date(), 10).toISOString()
    };
    beforeAll(async () => {
      const _genre = new Genre({ name: 'Fantasy' });
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author({
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      });
      await _author.save();
      const authorId = _author._id.toString();
      book = {
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      };
      const _book = new Book(book);
      await _book.save();
      bookId = _book._id.toString();
      bookInstance.bookId = bookId;
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly create book instance', (done) => {
      request
        .post('/bookinstances')
        .send({
          ...bookInstance
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res).toHaveProperty('body.bookInstance');
          expect(res.body.bookInstance).toMatchObject({
            _id: expect.any(String),
            book: bookInstance.bookId,
            publisher: bookInstance.publisher,
            status: bookInstance.status,
            back: bookInstance.back,
            __v: expect.any(Number)
          });

          return done();
        });
    });
    test('should properly create book instance with book passed as object', (done) => {
      const bookInstance = {
        book: {
          ...book,
          authorId: book.author,
          author: undefined,
          genreId: book.genre,
          genre: undefined
        },
        publisher: 'Publisher',
        status: 'Loaned',
        back: addDays(new Date(), 10).toISOString()
      };
      request
        .post('/bookinstances')
        .send({
          ...bookInstance
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res).toHaveProperty('body.bookInstance');
          expect(res.body.bookInstance).toMatchObject({
            _id: expect.any(String),
            book: bookId,
            publisher: bookInstance.publisher,
            status: bookInstance.status,
            back: bookInstance.back,
            __v: expect.any(Number)
          });

          return done();
        });
    });
    test('should not create book instance because it already exists', (done) => {
      request
        .post('/bookinstances')
        .send({
          ...bookInstance
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400,
            message: 'Book instance(s) already exist(s)'
          });

          return done();
        });
    });
    test('should not create book instance due to empty publisher', (done) => {
      const _bookInstance = {
        ...bookInstance,
        publisher: ''
      };
      request
        .post('/bookinstances')
        .send({
          ..._bookInstance
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400,
            message: 'Validation Error: body: "publisher" is not allowed to be empty',
            errors: 'Bad Request'
          });

          return done();
        });
    });
    test('should not create book instance due to too long length of publisher', (done) => {
      const _bookInstance = {
        ...bookInstance,
        publisher: 'x'.repeat(101)
      };
      request
        .post('/bookinstances')
        .send({
          ..._bookInstance
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400, // eslint-disable-next-line max-len
            message: 'Validation Error: body: "publisher" length must be less than or equal to 100 characters long',
            errors: 'Bad Request'
          });

          return done();
        });
    });
    test('should not create book instance due to invalid status', (done) => {
      const _bookInstance = {
        ...bookInstance,
        status: 'test'
      };
      request
        .post('/bookinstances')
        .send({
          ..._bookInstance
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400,
            message: 'Validation Error: body: "status" must be one of [Available, Maintenance, Loaned, Reserved]',
            errors: 'Bad Request'
          });

          return done();
        });
    });
    test('should not create book instance due to invalid date', (done) => {
      const _bookInstance = {
        ...bookInstance,
        back: addDays(new Date(), -2)
      };
      request
        .post('/bookinstances')
        .send({
          ..._bookInstance
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400,
            message: 'Validation Error: body: "back" must be greater than or equal to "now"',
            errors: 'Bad Request'
          });

          return done();
        });
    });
  });
  describe('Create mulitple book instances', () => {
    const bookInstances = [];
    beforeAll(async () => {
      const _genre = new Genre({ name: 'Fantasy' });
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author({
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      });
      await _author.save();
      const authorId = _author._id.toString();
      const _book = new Book({
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      });
      await _book.save();
      const bookId = _book._id.toString();
      bookInstances.push({
        bookId,
        publisher: 'Publisher',
        status: 'Available',
        back: addDays(new Date(), 1).toISOString()
      });
      bookInstances.push({
        bookId,
        publisher: 'Publisher',
        status: 'Maintenance',
        back: addDays(new Date(), 20).toISOString()
      });
      bookInstances.push({
        bookId,
        publisher: 'Publisher',
        status: 'Loaned',
        back: addDays(new Date(), 3).toISOString()
      });
      bookInstances.push({
        bookId,
        publisher: 'Publisher',
        status: 'Reserved',
        back: addDays(new Date(), 100).toISOString()
      });
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly create multiple book instances', (done) => {
      request
        .post('/bookinstances/multiple')
        .send({
          bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('bookInstances');
          expect(res.body.bookInstances).toBeInstanceOf(Array);
          expect(res.body.bookInstances).toHaveLength(bookInstances.length);
          res.body.bookInstances.forEach((bookInstance, i) => {
            expect(bookInstance).toStrictEqual(
              expect.objectContaining({
                _id: expect.any(String),
                book: bookInstances.at(i).bookId,
                publisher: bookInstances.at(i).publisher,
                status: bookInstances.at(i).status,
                back: expect.any(String),
                __v: expect.any(Number)
              })
            );
          });

          return done();
        });
    });
    test('should not create multiple book instances because they already exist', (done) => {
      request
        .post('/bookinstances/multiple')
        .send({
          bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400,
            message: 'Book instance(s) already exist(s)'
          });

          return done();
        });
    });
    test('should not create multiple book instances due to empty publisher', (done) => {
      const _bookInstances = [
        ...bookInstances,
        {
          bookId: bookInstances.at(0).bookId,
          publisher: '',
          status: bookInstances.at(0).status,
          back: bookInstances.at(0).back
        }
      ];
      request
        .post('/bookinstances/multiple')
        .send({
          bookInstances: _bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400,
            message: 'Validation Error: body: "bookInstances[4].publisher" is not allowed to be empty',
            errors: 'Bad Request'
          });

          return done();
        });
    });
    test('should not create multiple books due to too long length of title', (done) => {
      const _bookInstances = [
        ...bookInstances,
        {
          bookId: bookInstances.at(0).bookId,
          publisher: 'x'.repeat(101),
          status: bookInstances.at(0).status,
          back: bookInstances.at(0).back
        }
      ];
      request
        .post('/bookinstances/multiple')
        .send({
          bookInstances: _bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400, // eslint-disable-next-line max-len
            message: 'Validation Error: body: "bookInstances[4].publisher" length must be less than or equal to 100 characters long',
            errors: 'Bad Request'
          });

          return done();
        });
    });
    test('should not create book instances due to invalid status', (done) => {
      const _bookInstances = [
        ...bookInstances,
        {
          bookId: bookInstances.at(0).bookId,
          publisher: bookInstances.at(0).publisher,
          status: 'test',
          back: bookInstances.at(0).back
        }
      ];
      request
        .post('/bookinstances/multiple')
        .send({
          bookInstances: _bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400, // eslint-disable-next-line max-len
            message: 'Validation Error: body: "bookInstances[4].status" must be one of [Available, Maintenance, Loaned, Reserved]',
            errors: 'Bad Request'
          });

          return done();
        });
    });
    test('should not create book instances due to invalid date', (done) => {
      const _bookInstances = [
        ...bookInstances,
        {
          bookId: bookInstances.at(0).bookId,
          publisher: bookInstances.at(0).publisher,
          status: bookInstances.at(0).status,
          back: addDays(new Date(), -2)
        }
      ];
      request
        .post('/bookinstances/multiple')
        .send({
          bookInstances: _bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400,
            message: 'Validation Error: body: "bookInstances[4].back" must be greater than or equal to "now"',
            errors: 'Bad Request'
          });

          return done();
        });
    });
  });
  describe('Delete book instance', () => {
    let bookInstance;
    let bookInstanceId;
    beforeAll(async () => {
      const _genre = new Genre({ name: 'Fantasy' });
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author({
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      });
      await _author.save();
      const authorId = _author._id.toString();
      const _book = new Book({
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      });
      await _book.save();
      const bookId = _book._id.toString();
      bookInstance = {
        book: bookId,
        publisher: 'Publisher',
        status: 'Loaned',
        back: new Date('2020-04-19').toISOString()
      };
      const _bookInstance = new BookInstance(bookInstance);
      await _bookInstance.save();
      bookInstanceId = _bookInstance._id.toString();
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly delete book instance', (done) => {
      request
        .delete(`/bookInstances/${bookInstanceId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toMatchObject({
            message: 'Deleted book instance',
            bookInstance: {
              _id: expect.any(String),
              book: bookInstance.book,
              publisher: bookInstance.publisher,
              status: bookInstance.status,
              back: bookInstance.back,
              __v: expect.any(Number)
            }
          });

          return done();
        });
    });
    test('should not delete book instance because that book no longer exists ', (done) => {
      request
        .delete(`/bookInstances/${bookInstanceId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 404,
            message: `Cannot find book instance with id ${bookInstanceId}`
          });

          return done();
        });
    });
    test('should not delete book instance due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      request
        .delete(`/bookInstances/${invalidId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            code: 400, // eslint-disable-next-line max-len
            message: `Validation Error: params: "id" with value "${invalidId}" fails to match the required pattern: /^[a-fA-F0-9]{24}$/`,
            errors: 'Bad Request'
          });

          return done();
        });
    });
  });
  describe('Delete multiple book instances', () => {
    const bookInstanceIds = [];
    beforeAll(async () => {
      const _genre = new Genre({ name: 'Fantasy' });
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author({
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      });
      await _author.save();
      const authorId = _author._id.toString();
      const book = {
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      };
      const _book = new Book(book);
      await _book.save();
      const bookId = _book._id.toString();
      const bookInstances = [
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Available'
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Loaned',
          back: new Date('2020-04-19').toISOString()
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Maintenance',
          back: new Date('2020-04-23').toISOString()
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Reserved',
          back: new Date('2020-04-19').toISOString()
        }
      ];
      const _bookInstances = await BookInstance.insertMany(bookInstances);
      _bookInstances.forEach(({ id }) => {
        bookInstanceIds.push(id);
      });
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly delete multiple book instances', (done) => {
      request
        .delete('/bookinstances/multiple')
        .send({
          ids: bookInstanceIds
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              message: 'Deleted book instances',
              deletedCount: bookInstanceIds.length
            })
          );

          return done();
        });
    });
    test('should not delete book instances because that books no longer exist ', (done) => {
      request
        .delete('/bookinstances/multiple')
        .send({
          ids: bookInstanceIds
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404,
              message: `Cannot find book instance(s) with id(s) ${bookInstanceIds.join()}`
            })
          );

          return done();
        });
    });
    test('should not delete book instances due to validation error ', (done) => {
      request
        .delete('/bookinstances/multiple')
        .send({
          ids: []
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "ids" must contain at least 1 items',
              errors: 'Bad Request'
            })
          );

          return done();
        });
    });
  });
  describe('Update book instance', () => {
    let bookInstance;
    let bookInstanceId;
    beforeAll(async () => {
      const _genre = new Genre({ name: 'Fantasy' });
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author({
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      });
      await _author.save();
      const authorId = _author._id.toString();
      const _book = new Book({
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      });
      await _book.save();
      const bookId = _book._id.toString();
      bookInstance = {
        book: bookId,
        publisher: 'Publisher',
        status: 'Loaned',
        back: new Date('2020-04-19').toISOString()
      };
      const _bookInstance = new BookInstance(bookInstance);
      await _bookInstance.save();
      bookInstanceId = _bookInstance._id.toString();
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should not update book instance', (done) => {
      request
        .patch(`/bookinstances/${bookInstanceId}`)
        .send({
          publisher: bookInstance.publisher
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Book instance(s) already exist(s)'
            })
          );

          return done();
        });
    });
    test('should properly update book instance', (done) => {
      const newPublisher = 'newPublisher';
      request
        .patch(`/bookinstances/${bookInstanceId}`)
        .send({
          publisher: newPublisher
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res).toHaveProperty('body.bookInstance',
            expect.objectContaining({
              _id: expect.any(String),
              book: bookInstance.book,
              publisher: newPublisher,
              status: bookInstance.status,
              back: bookInstance.back,
              __v: expect.any(Number)
            })
          );

          return done();
        });
    });
    test('should not update book instance due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      const newPublisher = 'newPublisher';
      request
        .patch(`/bookinstances/${invalidId}`)
        .send({
          publisher: newPublisher
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400, // eslint-disable-next-line max-len
              message: `Validation Error: params: "id" with value "${invalidId}" fails to match the required pattern: /^[a-fA-F0-9]{24}$/`,
              errors: 'Bad Request'
            })
          );

          return done();
        });
    });
    test('should not update book instance because cannot find book instance', (done) => {
      const notFoundId = '63091e5e4ec3fbc5c720db4c';
      const newPublisher = 'newPublisher';
      request
        .patch(`/bookinstances/${notFoundId}`)
        .send({
          publisher: newPublisher
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404, // eslint-disable-next-line max-len
              message: `Cannot find book instance with id ${notFoundId}`
            })
          );

          return done();
        });
    });
  });
  describe('Update multiple book bookinstances', () => {
    const bookInstanceIds = [];
    let bookInstances;
    beforeAll(async () => {
      const _genre = new Genre({ name: 'Fantasy' });
      await _genre.save();
      const genreId = _genre._id.toString();
      const _author = new Author({
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      });
      await _author.save();
      const authorId = _author._id.toString();
      const book = {
        title: 'title',
        author: authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genreId
        ]
      };
      const _book = new Book(book);
      await _book.save();
      const bookId = _book._id.toString();
      bookInstances = [
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Available'
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Loaned',
          back: new Date('2020-04-19').toISOString()
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Maintenance',
          back: new Date('2020-04-23').toISOString()
        },
        {
          book: bookId,
          publisher: 'Publisher 1',
          status: 'Reserved',
          back: new Date('2020-04-19').toISOString()
        }
      ];
      const _bookInstances = await BookInstance.insertMany(bookInstances);
      _bookInstances.forEach(({ id }) => {
        bookInstanceIds.push(id);
      });
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await BookInstance.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should not update multiple book bookinstances', (done) => {
      request
        .patch('/bookinstances/multiple')
        .send({
          bookInstances: bookInstances
            .map(({ publisher }, i) => ({ id: bookInstanceIds.at(i).toString(), publisher }))
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              updateCount: 0
            })
          );

          return done();
        });
    });
    test('should properly update multiple book bookinstances', (done) => {
      const _bookInstances = bookInstances
        .map(({ publisher }, i) => ({ id: bookInstanceIds.at(i).toString(), publisher: publisher + '_' }));
      request
        .patch('/bookinstances/multiple')
        .send({
          bookInstances: _bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              bookInstances: _bookInstances,
              updateCount: _bookInstances.length
            })
          );

          return done();
        });
    });
    test('should not update multiple book bookinstances due to validation error ', (done) => {
      request
        .patch('/bookinstances/multiple')
        .send({
          bookInstances: []
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "bookInstances" must contain at least 1 items',
              errors: 'Bad Request'
            })
          );

          return done();
        });
    });
    test('should not update multiple book bookinstances because cannot find book bookinstances', (done) => {
      const _ids = bookInstanceIds.map(_id => _id.toString().replace(/[a-c]/, 'd'));
      const _bookInstances = bookInstances
        .map(({ publisher }, i) => ({ id: _ids.at(i), publisher: publisher + '_' }));
      request
        .patch('/bookinstances/multiple')
        .send({
          bookInstances: _bookInstances
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404,
              message: `Cannot find book instance(s) with id(s) ${_ids.join()}`
            })
          );

          return done();
        });
    });
  });
});
