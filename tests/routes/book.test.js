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
});
