const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const app = require('../../src/config/express');
const supertest = require('supertest');
const mongoose = require('../../src/config/mongoose');
const Author = require('../../src/api/models/author-model');
const Book = require('../../src/api/models/book-model');
const BookInstance = require('../../src/api/models/bookinstance-model');
const Genre = require('../../src/api/models/genre-model');
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
          });
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
                expect(res.body.bookInstances).toHaveLength(2);
                res.body.bookInstances.forEach((bookInstance, i) => {
                    expect(bookInstance).toMatchObject({
                        _id: expect.any(String),
                        book: bookInstances.at(i+1).book,
                        publisher: bookInstances.at(i+1).publisher,
                        status: bookInstances.at(i+1).status,
                        back: bookInstances.at(i+1).back ?? expect.any(String),
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
                expect(res.body.bookInstances).toHaveLength(bookInstances.length);
                const sortedBookInstances = bookInstances.slice().sort((a,b) => {
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
});
