const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const app = require('../../src/config/express');
const supertest = require('supertest');
const mongoose = require('../../src/config/mongoose');
const Author = require('../../src/api/models/author-model');
const Book = require('../../src/api/models/book-model');
const Genre = require('../../src/api/models/genre-model');
const request = supertest(app);

describe('BOOK ROUTES', () => {
  let mongodb, connection;
  beforeAll(async () => {
    ({ connection, mongodb } = await mongoose.connect());
  });
  afterAll(async () => {
    await connection.disconnect();
    await mongodb.stop();
  });
  describe('List books', () => {
    const authors = [
      {
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      },
      {
        firstName: 'Isaac',
        lastName: 'Asimov',
        dateOfBirth: '1920-01-01T22:00:00.000Z',
        dateOfDeath: '1992-04-05T22:00:00.000Z'
      },
      {
        firstName: 'Patrick',
        lastName: 'Rothfuss',
        dateOfBirth: '1973-06-05T23:00:00.000Z'
      }
    ];
    const authorIds = [];
    const genres = [
      { name: 'Fantasy' },
      { name: 'Horror' },
      { name: 'Thriller' },
      { name: 'Western' }
    ];
    const genreIds = [];
    let books;
    beforeAll(async () => {
      const _genres = await Genre.insertMany(genres);
      _genres.forEach(({ _id }) => {
        genreIds.push(_id.toString());
      });
      const _authors = await Author.insertMany(authors);
      _authors.forEach(({ _id }) => {
        authorIds.push(_id.toString());
      });
      books = [
        {
          title: 'title 1',
          author: authorIds[0],
          summary: 'something 1',
          isbn: '978-0-575-08244-1',
          genre: [
            genreIds[0], genreIds[1]
          ]
        },
        {
          title: 'title 2',
          author: authorIds[1],
          summary: 'something 2',
          isbn: '978-0-575-08244-2',
          genre: [
            genreIds[2], genreIds[3]
          ]
        },
        {
          title: 'title 3',
          author: authorIds[2],
          summary: 'something 3',
          isbn: '978-0-575-08244-3',
          genre: []
        },
        {
          title: 'title 4',
          author: authorIds[0],
          summary: 'something 4',
          isbn: '978-0-575-08244-1',
          genre: [
            genreIds[1], genreIds[2]
          ]
        }
      ];
      await Book.insertMany(books);
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should return full list of books', (done) => {
      request
        .get('/books')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('books');
          expect(res.body.books).toHaveLength(books.length);
          res.body.books.forEach(({ title, author, summary, isbn, genre }, i) => {
            expect(books.at(i).title).toBe(title);
            expect(books.at(i).author).toBe(author);
            expect(books.at(i).summary).toBe(summary);
            expect(books.at(i).isbn).toBe(isbn);
            expect(books.at(i).genre).toStrictEqual(genre);
          });
          return done();
        });
    });
    test('should return list of books which match the passed title', (done) => {
      request
        .get('/books')
        .send({
          title: books.at(0).title
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.books).toHaveLength(1);
          expect(res.body.books[0].title).toBe(books.at(0).title);
          expect(res.body.books[0].author).toBe(books.at(0).author);
          expect(res.body.books[0].summary).toBe(books.at(0).summary);
          expect(res.body.books[0].isbn).toBe(books.at(0).isbn);
          expect(res.body.books[0].genre).toStrictEqual(books.at(0).genre);
          return done();
        });
    });
    test('should return list of books with limited number of result to 2 and skipped first result', (done) => {
      request
        .get('/books')
        .send({
          skip: 1,
          limit: 2
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.books).toHaveLength(2);
          expect(res.body.books[0].title).toBe(books.at(1).title);
          expect(res.body.books[0].author).toBe(books.at(1).author);
          expect(res.body.books[0].summary).toBe(books.at(1).summary);
          expect(res.body.books[0].isbn).toBe(books.at(1).isbn);
          expect(res.body.books[0].genre).toStrictEqual(books.at(1).genre);
          expect(res.body.books[1].title).toBe(books.at(2).title);
          expect(res.body.books[1].author).toBe(books.at(2).author);
          expect(res.body.books[1].summary).toBe(books.at(2).summary);
          expect(res.body.books[1].isbn).toBe(books.at(2).isbn);
          expect(res.body.books[1].genre).toStrictEqual(books.at(2).genre);
          return done();
        });
    });
    test('should return list of books sorted descending by title', (done) => {
      request
        .get('/books')
        .send({
          sort: {
            title: -1
          }
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.books).toHaveLength(books.length);
          const reversedBooks = books.reverse();
          res.body.books.forEach(({ title, author, summary, isbn, genre }, i) => {
            expect(reversedBooks.at(i).title).toBe(title);
            expect(reversedBooks.at(i).author).toBe(author);
            expect(reversedBooks.at(i).summary).toBe(summary);
            expect(reversedBooks.at(i).isbn).toBe(isbn);
            expect(reversedBooks.at(i).genre).toStrictEqual(genre);
          });
          return done();
        });
    });
    test('should return list of books with only _id field', (done) => {
      request
        .get('/books')
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.books).toHaveLength(books.length);
          res.body.books.forEach((book) => {
            expect(book).toHaveProperty('_id');
            expect(book).not.toHaveProperty('title');
            expect(book).not.toHaveProperty('author');
            expect(book).not.toHaveProperty('summary');
            expect(book).not.toHaveProperty('isbn');
            expect(book).not.toHaveProperty('genre');
            expect(book).not.toHaveProperty('__v');
          });
          return done();
        });
    });
    test('should return list of books with omitted _id and __v field', (done) => {
      request
        .get('/books')
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.books).toHaveLength(books.length);
          res.body.books.forEach((book) => {
            expect(book).not.toHaveProperty('_id');
            expect(book).toHaveProperty('title');
            expect(book).toHaveProperty('author');
            expect(book).toHaveProperty('summary');
            expect(book).toHaveProperty('isbn');
            expect(book).toHaveProperty('genre');
            expect(book).not.toHaveProperty('__v');
          });
          return done();
        });
    });
  });
  describe('Get book', () => {
    const bookIds = [];
    const authors = [
      {
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      },
      {
        firstName: 'Isaac',
        lastName: 'Asimov',
        dateOfBirth: '1920-01-01T22:00:00.000Z',
        dateOfDeath: '1992-04-05T22:00:00.000Z'
      },
      {
        firstName: 'Patrick',
        lastName: 'Rothfuss',
        dateOfBirth: '1973-06-05T23:00:00.000Z'
      }
    ];
    const authorIds = [];
    const genres = [
      { name: 'Fantasy' },
      { name: 'Horror' },
      { name: 'Thriller' },
      { name: 'Western' }
    ];
    const genreIds = [];
    let books;
    beforeAll(async () => {
      const _genres = await Genre.insertMany(genres);
      _genres.forEach(({ _id }) => {
        genreIds.push(_id.toString());
      });
      const _authors = await Author.insertMany(authors);
      _authors.forEach(({ _id }) => {
        authorIds.push(_id.toString());
      });
      books = [
        {
          title: 'title 1',
          author: authorIds[0],
          summary: 'something 1',
          isbn: '978-0-575-08244-1',
          genre: [
            genreIds[0], genreIds[1]
          ]
        },
        {
          title: 'title 2',
          author: authorIds[1],
          summary: 'something 2',
          isbn: '978-0-575-08244-2',
          genre: [
            genreIds[2], genreIds[3]
          ]
        },
        {
          title: 'title 3',
          author: authorIds[2],
          summary: 'something 3',
          isbn: '978-0-575-08244-3',
          genre: [genreIds[0]]
        },
        {
          title: 'title 4',
          author: authorIds[0],
          summary: 'something 4',
          isbn: '978-0-575-08244-1',
          genre: [
            genreIds[1], genreIds[2]
          ]
        }
      ];
      const _books = await Book.insertMany(books);
      _books.forEach(({ _id }) => {
        bookIds.push(_id.toString());
      });
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should return book', (done) => {
      request
        .get(`/books/${bookIds[0]}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('book');
          expect(res.body.book.title).toBe(books.at(0).title);
          expect(res.body.book.author).toBe(books.at(0).author);
          expect(res.body.book.summary).toBe(books.at(0).summary);
          expect(res.body.book.isbn).toBe(books.at(0).isbn);
          expect(res.body.book.genre).toStrictEqual(books.at(0).genre);
          return done();
        });
    });
    test('should return book with author object and genre object(s)', (done) => {
      request
        .get(`/books/${bookIds[2]}`)
        .send({
          showAuthor: true,
          showGenre: true
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('book');
          expect(res.body.book.title).toBe(books.at(2).title);
          expect(res.body.book.author).toBeInstanceOf(Object);
          expect(res.body.book.author).toMatchObject(authors.at(2));
          expect(res.body.book.summary).toBe(books.at(2).summary);
          expect(res.body.book.isbn).toBe(books.at(2).isbn);
          expect(res.body.book.genre).toBeInstanceOf(Object);
          expect(res.body.book.genre).toMatchObject([genres.at(0)]);
          return done();
        });
    });
    test('should return book with only _id field', (done) => {
      request
        .get(`/books/${bookIds[0]}`)
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('book');
          expect(res.body.book).not.toHaveProperty('title');
          expect(res.body.book).not.toHaveProperty('author');
          expect(res.body.book).not.toHaveProperty('summary');
          expect(res.body.book).not.toHaveProperty('isbn');
          expect(res.body.book).not.toHaveProperty('genre');
          expect(res.body.book).toHaveProperty('_id');
          expect(res.body.book).not.toHaveProperty('__v');
          return done();
        });
    });
    test('should return book with omitted _id and __v field', (done) => {
      request
        .get(`/books/${bookIds[0]}`)
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('book');
          expect(res.body.book).toHaveProperty('title');
          expect(res.body.book).toHaveProperty('author');
          expect(res.body.book).toHaveProperty('summary');
          expect(res.body.book).toHaveProperty('isbn');
          expect(res.body.book).toHaveProperty('genre');
          expect(res.body.book).not.toHaveProperty('_id');
          expect(res.body.book).not.toHaveProperty('__v');
          return done();
        });
    });
  });
  describe('Create book', () => {
    const author = {
      firstName: 'Ben',
      lastName: 'Bova',
      dateOfBirth: '1932-11-07T23:00:00.000Z'
    };
    let authorId;
    const genre = { name: 'Fantasy' };
    let genreId;
    beforeAll(async () => {
      const _genre = new Genre(genre);
      await _genre.save();
      genreId = _genre._id.toString();
      const _author = new Author(author);
      await _author.save();
      authorId = _author._id.toString();
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly create book', (done) => {
      const book = {
        title: 'title 1',
        authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genreId: [
          genreId
        ]
      };
      request
        .post('/books')
        .send({
          ...book
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('title');
          expect(res.body.title).toBe(book.title);
          expect(res.body).toHaveProperty('author');
          expect(res.body.author).toBe(book.authorId);
          expect(res.body).toHaveProperty('summary');
          expect(res.body.summary).toBe(book.summary);
          expect(res.body).toHaveProperty('isbn');
          expect(res.body.isbn).toBe(book.isbn);
          expect(res.body).toHaveProperty('genre');
          expect(res.body.genre).toMatchObject(book.genreId);
          expect(res.body).toHaveProperty('_id');
          expect(res.body._id).not.toBeNull();
          expect(res.body).toHaveProperty('__v');
          expect(res.body.__v).not.toBeNull();
          return done();
        });
    });
    test('should properly create book with author and genre passed as objects', async () => {
      await Book.deleteMany({});
      const book = {
        title: 'title 1',
        author,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genre: [
          genre
        ]
      };
      await request
        .post('/books')
        .send({
          ...book
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('title');
          expect(res.body.title).toBe(book.title);
          expect(res.body).toHaveProperty('author');
          expect(res.body.author).toBe(authorId);
          expect(res.body).toHaveProperty('summary');
          expect(res.body.summary).toBe(book.summary);
          expect(res.body).toHaveProperty('isbn');
          expect(res.body.isbn).toBe(book.isbn);
          expect(res.body).toHaveProperty('genre');
          expect(res.body.genre).toMatchObject([genreId]);
          expect(res.body).toHaveProperty('_id');
          expect(res.body._id).not.toBeNull();
          expect(res.body).toHaveProperty('__v');
          expect(res.body.__v).not.toBeNull();
        });
    });
    test('should not create book because it already exists', (done) => {
      const book = {
        title: 'title 1',
        authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genreId: [
          genreId
        ]
      };
      request
        .post('/books')
        .send({
          ...book
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Book(s) already exist(s)');
          return done();
        });
    });
    test('should not create book due to empty title', (done) => {
      const book = {
        title: '',
        authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genreId: [
          genreId
        ]
      };
      request
        .post('/books')
        .send({
          ...book
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Validation Error: body: "title" is not allowed to be empty');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create book due to too long length of title', (done) => {
      const book = {
        title: 'x'.repeat(101),
        authorId,
        summary: 'something 1',
        isbn: '978-0-575-08244-1',
        genreId: [
          genreId
        ]
      };
      request
        .post('/books')
        .send({
          ...book
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "title" length must be less than or equal to 100 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create book due to invalid isbn', (done) => {
      const book = {
        title: 'title 1',
        authorId,
        summary: 'something 1',
        isbn: 'xx',
        genreId: [
          genreId
        ]
      };
      request
        .post('/books')
        .send({
          ...book
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message) // eslint-disable-next-line max-len
            .toBe('Validation Error: body: "isbn" with value "xx" fails to match the required pattern: /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
  });
  describe('Create mulitple books', () => {
    const authors = [
      {
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      },
      {
        firstName: 'Isaac',
        lastName: 'Asimov',
        dateOfBirth: '1920-01-01T22:00:00.000Z',
        dateOfDeath: '1992-04-05T22:00:00.000Z'
      },
      {
        firstName: 'Patrick',
        lastName: 'Rothfuss',
        dateOfBirth: '1973-06-05T23:00:00.000Z'
      }
    ];
    const authorIds = [];
    const genres = [
      { name: 'Fantasy' },
      { name: 'Horror' },
      { name: 'Thriller' },
      { name: 'Western' }
    ];
    const genreIds = [];
    let books;
    beforeAll(async () => {
      const _genres = await Genre.insertMany(genres);
      _genres.forEach(({ _id }) => {
        genreIds.push(_id.toString());
      });
      const _authors = await Author.insertMany(authors);
      _authors.forEach(({ _id }) => {
        authorIds.push(_id.toString());
      });
      books = [
        {
          title: 'title 1',
          authorId: authorIds[0],
          summary: 'something 1',
          isbn: '978-0-575-08244-1',
          genreId: [
            genreIds[0], genreIds[1]
          ]
        },
        {
          title: 'title 2',
          authorId: authorIds[1],
          summary: 'something 2',
          isbn: '978-0-575-08244-2',
          genreId: [
            genreIds[2], genreIds[3]
          ]
        },
        {
          title: 'title 3',
          authorId: authorIds[2],
          summary: 'something 3',
          isbn: '978-0-575-08244-3'
        },
        {
          title: 'title 4',
          authorId: authorIds[0],
          summary: 'something 4',
          isbn: '978-0-575-08244-1',
          genreId: [
            genreIds[1], genreIds[2]
          ]
        }
      ];
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly create multiple books', (done) => {
      request
        .post('/books/multiple')
        .send({
          books
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('books');
          expect(res.body.books).toBeInstanceOf(Array);
          res.body.books.forEach((book, i) => {
            expect(book).toStrictEqual(
              expect.objectContaining({
                _id: expect.any(String),
                title: books.at(i).title,
                author: books.at(i).authorId,
                summary: books.at(i).summary,
                isbn: books.at(i).isbn,
                genre: books.at(i).genreId ?? [],
                __v: expect.any(Number)
              })
            );
          });
          return done();
        });
    });
    test('should not create multiple books because they already exist', (done) => {
      request
        .post('/books/multiple')
        .send({
          books
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Book(s) already exist(s)'
            })
          );
          return done();
        });
    });
    test('should not create multiple books due to empty title', (done) => {
      const books = [
        {
          title: '',
          authorId: authorIds[0],
          summary: 'something 5',
          isbn: '978-0-575-08244-5',
          genreId: [
            genreIds[0], genreIds[1]
          ]
        },
        {
          title: '',
          authorId: authorIds[1],
          summary: 'something 6',
          isbn: '978-0-575-08244-6',
          genreId: [
            genreIds[2], genreIds[3]
          ]
        }
      ];
      request
        .post('/books/multiple')
        .send({
          books
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400, // eslint-disable-next-line max-len
              message: 'Validation Error: body: "books[0].title" is not allowed to be empty',
              errors: 'Bad Request'
            })
          );
          return done();
        });
    });
    test('should not create multiple books due to too long length of title', (done) => {
      const books = [
        {
          title: 'x'.repeat(101),
          authorId: authorIds[0],
          summary: 'something 5',
          isbn: '978-0-575-08244-5',
          genreId: [
            genreIds[0], genreIds[1]
          ]
        },
        {
          title: 'x'.repeat(101),
          authorId: authorIds[1],
          summary: 'something 6',
          isbn: '978-0-575-08244-6',
          genreId: [
            genreIds[2], genreIds[3]
          ]
        }
      ];
      request
        .post('/books/multiple')
        .send({
          books
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400, // eslint-disable-next-line max-len
              message: 'Validation Error: body: "books[0].title" length must be less than or equal to 100 characters long',
              errors: 'Bad Request'
            })
          );
          return done();
        });
    });
    test('should not create multiple books due to invalid isbn', (done) => {
      const books = [
        {
          title: 'title 5',
          authorId: authorIds[0],
          summary: 'something 5',
          isbn: 'xx',
          genreId: [
            genreIds[0], genreIds[1]
          ]
        },
        {
          title: 'title 6',
          authorId: authorIds[1],
          summary: 'something 6',
          isbn: 'xx',
          genreId: [
            genreIds[2], genreIds[3]
          ]
        }
      ];
      request
        .post('/books/multiple')
        .send({
          books
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400, // eslint-disable-next-line max-len
              message: 'Validation Error: body: "books[0].isbn" with value "xx" fails to match the required pattern: /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/',
              errors: 'Bad Request'
            })
          );
          return done();
        });
    });
  });
  describe('Delete book', () => {
    const author = {
      firstName: 'Ben',
      lastName: 'Bova',
      dateOfBirth: '1932-11-07T23:00:00.000Z'
    };
    let authorId;
    const genre = { name: 'Fantasy' };
    let genreId;
    let book;
    let bookId;
    beforeAll(async () => {
      const _genre = new Genre(genre);
      await _genre.save();
      genreId = _genre._id.toString();
      const _author = new Author(author);
      await _author.save();
      authorId = _author._id.toString();
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
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly delete book', (done) => {
      request
        .delete(`/books/${bookId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Deleted book');
          expect(res.body).toHaveProperty('deletedBook',
            expect.objectContaining({
              _id: expect.any(String),
              title: book.title,
              author: authorId,
              summary: book.summary,
              isbn: book.isbn,
              genre: [
                genreId
              ],
              __v: expect.any(Number)
            })
          );
          return done();
        });
    });
    test('should not delete book because that book no longer exists ', (done) => {
      request
        .delete(`/books/${bookId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe(`Cannot find book with id ${bookId}`);
          return done();
        });
    });
    test('should not delete book due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      request
        .delete(`/books/${invalidId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message) // eslint-disable-next-line max-len
            .toBe(`Validation Error: params: "id" with value "${invalidId}" fails to match the required pattern: /^[a-fA-F0-9]{24}$/`);
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
  });
  describe('Delete multiple books', () => {
    const bookIds = [];
    const authors = [
      {
        firstName: 'Ben',
        lastName: 'Bova',
        dateOfBirth: '1932-11-07T23:00:00.000Z'
      },
      {
        firstName: 'Isaac',
        lastName: 'Asimov',
        dateOfBirth: '1920-01-01T22:00:00.000Z',
        dateOfDeath: '1992-04-05T22:00:00.000Z'
      },
      {
        firstName: 'Patrick',
        lastName: 'Rothfuss',
        dateOfBirth: '1973-06-05T23:00:00.000Z'
      }
    ];
    const authorIds = [];
    const genres = [
      { name: 'Fantasy' },
      { name: 'Horror' },
      { name: 'Thriller' },
      { name: 'Western' }
    ];
    const genreIds = [];
    let books;
    beforeAll(async () => {
      const _genres = await Genre.insertMany(genres);
      _genres.forEach(({ _id }) => {
        genreIds.push(_id.toString());
      });
      const _authors = await Author.insertMany(authors);
      _authors.forEach(({ _id }) => {
        authorIds.push(_id.toString());
      });
      books = [
        {
          title: 'title 1',
          author: authorIds[0],
          summary: 'something 1',
          isbn: '978-0-575-08244-1',
          genre: [
            genreIds[0], genreIds[1]
          ]
        },
        {
          title: 'title 2',
          author: authorIds[1],
          summary: 'something 2',
          isbn: '978-0-575-08244-2',
          genre: [
            genreIds[2], genreIds[3]
          ]
        },
        {
          title: 'title 3',
          author: authorIds[2],
          summary: 'something 3',
          isbn: '978-0-575-08244-3',
          genre: [genreIds[0]]
        },
        {
          title: 'title 4',
          author: authorIds[0],
          summary: 'something 4',
          isbn: '978-0-575-08244-1',
          genre: [
            genreIds[1], genreIds[2]
          ]
        }
      ];
      const _books = await Book.insertMany(books);
      _books.forEach(({ _id }) => {
        bookIds.push(_id.toString());
      });
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should properly delete multiple books', (done) => {
      request
        .delete('/books/multiple')
        .send({
          ids: bookIds
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              message: 'Deleted books',
              deletedCount: bookIds.length
            })
          );
          return done();
        });
    });
    test('should not delete books because that books no longer exist ', (done) => {
      request
        .delete('/books/multiple')
        .send({
          ids: bookIds
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404,
              message: `Cannot find book(s) with id(s) ${bookIds.join()}`
            })
          );
          return done();
        });
    });
    test('should not delete books due to validation error ', (done) => {
      request
        .delete('/books/multiple')
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
  describe('Update book', () => {
    const author = {
      firstName: 'Ben',
      lastName: 'Bova',
      dateOfBirth: '1932-11-07T23:00:00.000Z'
    };
    let authorId;
    const genre = { name: 'Fantasy' };
    let genreId;
    let book;
    let bookId;
    beforeAll(async () => {
      const _genre = new Genre(genre);
      await _genre.save();
      genreId = _genre._id.toString();
      const _author = new Author(author);
      await _author.save();
      authorId = _author._id.toString();
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
    });
    afterAll(async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      await Genre.deleteMany({});
    });
    test('should not update book', (done) => {
      request
        .patch(`/books/${bookId}`)
        .send({
          title: book.title
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Book(s) already exist(s)'
            })
          );
          return done();
        });
    });
    test('should properly update book', (done) => {
      const newTitle = 'newTitle';
      request
        .patch(`/books/${bookId}`)
        .send({
          title: newTitle
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              _id: expect.any(String),
              title: newTitle,
              author: authorId,
              summary: book.summary,
              isbn: book.isbn,
              genre: [
                genreId
              ],
              __v: expect.any(Number)
            })
          );
          return done();
        });
    });
    test('should not update book due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      const newTitle = 'newTitle';
      request
        .patch(`/books/${invalidId}`)
        .send({
          title: newTitle
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
    test('should not update book because cannot find book', (done) => {
      const notFoundId = '63091e5e4ec3fbc5c720db4c';
      const newTitle = 'newTitle';
      request
        .patch(`/books/${notFoundId}`)
        .send({
          title: newTitle
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404, // eslint-disable-next-line max-len
              message: `Cannot find book with id ${notFoundId}`
            })
          );
          return done();
        });
    });
  });
});
