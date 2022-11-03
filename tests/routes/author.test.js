const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const app = require('../../src/config/express');
const supertest = require('supertest');
const mongoose = require('../../src/config/mongoose');
const Author = require('../../src/api/models/author-model');
const request = supertest(app);

describe('AUTHOR ROUTES', () => {
  let mongodb, connection;
  beforeAll(async () => {
    ({ connection, mongodb } = await mongoose.connect());
  });
  afterAll(async () => {
    await connection.disconnect();
    await mongodb.stop();
  });
  describe('List authors', () => {
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
    beforeAll(async () => {
      await Author.insertMany(authors);
    });
    afterAll(async () => {
      await Author.deleteMany({});
    });
    test('should return full list of authors', (done) => {
      request
        .get('/authors')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('authors');
          expect(res.body.authors).toHaveLength(authors.length);
          res.body.authors.forEach(({ firstName, lastName, dateOfBirth, dateOfDeath }, i) => {
            expect(authors.at(i).firstName).toBe(firstName);
            expect(authors.at(i).lastName).toBe(lastName);
            expect(authors.at(i).dateOfBirth).toBe(dateOfBirth);
            if (dateOfDeath) {
              expect(authors.at(i).dateOfDeath).toBe(dateOfDeath);
            } else {
              expect(authors.at(i)).not.toHaveProperty('dateOfDeath');
            }
          });
          return done();
        });
    });
    test('should return list of authors which match the passed firstName', (done) => {
      request
        .get('/authors')
        .send({
          firstName: 'Ben'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.authors).toHaveLength(1);
          expect(res.body.authors[0].firstName).toBe('Ben');
          return done();
        });
    });
    test('should return list of authors with limited number of result to 2 and skipped first result', (done) => {
      request
        .get('/authors')
        .send({
          skip: 1,
          limit: 2
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.authors).toHaveLength(2);
          expect(res.body.authors[0].firstName).toBe(authors.at(1).firstName);
          expect(res.body.authors[1].firstName).toBe(authors.at(2).firstName);
          return done();
        });
    });
    test('should return list of authors sorted descending by firstName', (done) => {
      request
        .get('/authors')
        .send({
          sort: {
            firstName: -1
          }
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.authors).toHaveLength(authors.length);
          const reversedAuthors = authors.reverse();
          res.body.authors.forEach(({ firstName }, i) => {
            expect(firstName).toBe(reversedAuthors.at(i).firstName);
          });
          return done();
        });
    });
    test('should return list of authors with only _id field', (done) => {
      request
        .get('/authors')
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.authors).toHaveLength(authors.length);
          res.body.authors.forEach((author) => {
            expect(author).toHaveProperty('_id');
            expect(author).not.toHaveProperty('firstName');
            expect(author).not.toHaveProperty('lastName');
            expect(author).not.toHaveProperty('dateOfBirth');
            expect(author).not.toHaveProperty('dateOfDeath');
            expect(author).not.toHaveProperty('__v');
          });
          return done();
        });
    });
    test('should return list of authors with omitted _id and __v field', (done) => {
      request
        .get('/authors')
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.authors).toHaveLength(authors.length);
          res.body.authors.forEach((author) => {
            expect(author).not.toHaveProperty('_id');
            expect(author).toHaveProperty('firstName');
            expect(author).toHaveProperty('lastName');
            expect(author).toHaveProperty('dateOfBirth');
            expect(author).not.toHaveProperty('__v');
          });
          return done();
        });
    });
  });
  describe('Get author', () => {
    let _id;
    const author = {
      firstName: 'Isaac',
      lastName: 'Asimov',
      dateOfBirth: '1920-01-01T22:00:00.000Z',
      dateOfDeath: '1992-04-05T22:00:00.000Z'
    };
    beforeAll(async () => {
      const _author = new Author(author);
      await _author.save();
      _id = _author._id.toString();
    });
    afterAll(async () => {
      await Author.deleteMany({});
    });
    test('should return specific author', (done) => {
      request
        .get(`/authors/${_id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('author');
          expect(res.body.author).toHaveProperty('firstName');
          expect(res.body.author.firstName).toBe(author.firstName);
          expect(res.body.author).toHaveProperty('lastName');
          expect(res.body.author.lastName).toBe(author.lastName);
          expect(res.body.author).toHaveProperty('dateOfBirth');
          expect(res.body.author.dateOfBirth).toBe(author.dateOfBirth);
          expect(res.body.author).toHaveProperty('dateOfDeath');
          expect(res.body.author.dateOfDeath).toBe(author.dateOfDeath);
          expect(res.body).not.toHaveProperty('listOfBooks');
          return done();
        });
    });
    test('should return author with list of books written by this author', (done) => {
      request
        .get(`/authors/${_id}`)
        .send({
          showBookList: true
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('author');
          expect(res.body).toHaveProperty('listOfBooks');
          expect(res.body.listOfBooks).toStrictEqual([]);
          return done();
        });
    });
    test('should return author with only _id field', (done) => {
      request
        .get(`/authors/${_id}`)
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('author');
          expect(res.body.author).toHaveProperty('_id');
          expect(res.body.author).not.toHaveProperty('__v');
          expect(res.body.author).not.toHaveProperty('firstName');
          expect(res.body.author).not.toHaveProperty('lastName');
          expect(res.body.author).not.toHaveProperty('dateOfBirth');
          expect(res.body.author).not.toHaveProperty('dateOfDeath');
          expect(res.body.author).not.toHaveProperty('dateOfDeath');
          expect(res.body).not.toHaveProperty('listOfBooks');
          return done();
        });
    });
    test('should return author with omitted _id and __v field', (done) => {
      request
        .get(`/authors/${_id}`)
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('author');
          expect(res.body.author).not.toHaveProperty('_id');
          expect(res.body.author).not.toHaveProperty('__v');
          expect(res.body.author).toHaveProperty('firstName');
          expect(res.body.author).toHaveProperty('lastName');
          expect(res.body.author).toHaveProperty('dateOfBirth');
          expect(res.body.author).toHaveProperty('dateOfDeath');
          expect(res.body.author).toHaveProperty('dateOfDeath');
          expect(res.body).not.toHaveProperty('listOfBooks');
          return done();
        });
    });
  });
});
