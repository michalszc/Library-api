const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const app = require('../../src/config/express');
const supertest = require('supertest');
const mongoose = require('../../src/config/mongoose');
const Author = require('../../src/api/models/author-model');
const request = supertest(app);
const { has } = require('lodash');

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
  describe('Create author', () => {
    afterAll(async () => {
      await Author.deleteMany({});
    });
    test('should properly create author', (done) => {
      const author = {
        firstName: 'mockFirstName',
        lastName: 'mockLastName',
        dateOfBirth: '1954/10/14',
        dateOfDeath: '2004/04/22'
      };
      request
        .post('/authors')
        .send({
          ...author
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('firstName');
          expect(res.body.firstName).toBe(author.firstName);
          expect(res.body).toHaveProperty('lastName');
          expect(res.body.lastName).toBe(author.lastName);
          expect(res.body).toHaveProperty('dateOfBirth');
          expect(res.body.dateOfBirth).toBe(new Date(author.dateOfBirth).toISOString());
          expect(res.body).toHaveProperty('dateOfDeath');
          expect(res.body.dateOfDeath).toBe(new Date(author.dateOfDeath).toISOString());
          expect(res.body).toHaveProperty('_id');
          expect(res.body._id).not.toBeNull();
          expect(res.body).toHaveProperty('__v');
          expect(res.body.__v).not.toBeNull();
          return done();
        });
    });
    test('should not create author because it already exists', (done) => {
      const author = {
        firstName: 'mockFirstName',
        lastName: 'mockLastName',
        dateOfBirth: '1954/10/14',
        dateOfDeath: '2004/04/22'
      };
      request
        .post('/authors')
        .send({
          ...author
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Author(s) already exist(s)');
          return done();
        });
    });
    test('should not create author due to empty firstName', (done) => {
      const author = {
        firstName: '',
        lastName: 'mockLastName',
        dateOfBirth: '1954/10/14',
        dateOfDeath: '2004/04/22'
      };
      request
        .post('/authors')
        .send({
          ...author
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Validation Error: body: "firstName" is not allowed to be empty');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create author due to too short length of firstName', (done) => {
      const author = {
        firstName: 'xx',
        lastName: 'mockLastName',
        dateOfBirth: '1954/10/14',
        dateOfDeath: '2004/04/22'
      };
      request
        .post('/authors')
        .send({
          ...author
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "firstName" length must be at least 3 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create author due to too long length of firstName', (done) => {
      const author = {
        firstName: 'x'.repeat(101),
        lastName: 'mockLastName',
        dateOfBirth: '1954/10/14',
        dateOfDeath: '2004/04/22'
      };
      request
        .post('/authors')
        .send({
          ...author
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "firstName" length must be less than or equal to 100 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
  });
  describe('Create mulitple authors', () => {
    const authors = [
      {
        firstName: 'mockFirstName1',
        lastName: 'mockLastName1',
        dateOfBirth: '1954/10/14',
        dateOfDeath: '2004/04/22'
      },
      {
        firstName: 'mockFirstName2',
        lastName: 'mockLastName2',
        dateOfBirth: '1984/08/15'
      },
      {
        firstName: 'mockFirstName3',
        lastName: 'mockLastName3',
        dateOfBirth: '1882/04/09',
        dateOfDeath: '1945/10/12'
      }
    ];
    afterAll(async () => {
      await Author.deleteMany({});
    });
    test('should properly create multiple authors', (done) => {
      request
        .post('/authors/multiple')
        .send({
          authors
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('authors');
          expect(res.body.authors).toBeInstanceOf(Array);
          res.body.authors.forEach((author, i) => {
            expect(author).toHaveProperty('firstName');
            expect(author.firstName).toBe(authors.at(i).firstName);
            expect(author).toHaveProperty('lastName');
            expect(author.lastName).toBe(authors.at(i).lastName);
            expect(author).toHaveProperty('dateOfBirth');
            expect(author.dateOfBirth).toBe(new Date(authors.at(i).dateOfBirth).toISOString());
            if (has(authors.at(i), 'dateOfDeath')) {
              expect(author).toHaveProperty('dateOfDeath');
              expect(author.dateOfDeath).toBe(new Date(authors.at(i).dateOfDeath).toISOString());
            }
            expect(author).toHaveProperty('_id');
            expect(author._id).not.toBeNull();
            expect(author).toHaveProperty('__v');
            expect(author.__v).not.toBeNull();
          });
          return done();
        });
    });
    test('should not create multiple authors because they already exist', (done) => {
      request
        .post('/authors/multiple')
        .send({
          authors
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Author(s) already exist(s)');
          return done();
        });
    });
    test('should not create multiple authors due to empty firstName', (done) => {
      const authors = [
        {
          firstName: '',
          lastName: 'mockLastName1',
          dateOfBirth: '1954/10/14',
          dateOfDeath: '2004/04/22'
        },
        {
          firstName: '',
          lastName: 'mockLastName2',
          dateOfBirth: '1984/08/15'
        }
      ];
      request
        .post('/authors/multiple')
        .send({
          authors
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message) // eslint-disable-next-line max-len
            .toBe('Validation Error: body: "authors[0].firstName" is not allowed to be empty');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create multiple authors due to too short length of firstName', (done) => {
      const authors = [
        {
          firstName: 'xx',
          lastName: 'mockLastName1',
          dateOfBirth: '1954/10/14',
          dateOfDeath: '2004/04/22'
        },
        {
          firstName: 'xx',
          lastName: 'mockLastName2',
          dateOfBirth: '1984/08/15'
        }
      ];
      request
        .post('/authors/multiple')
        .send({
          authors
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "authors[0].firstName" length must be at least 3 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create multiple authors due to too long length of firstName', (done) => {
      const authors = [
        {
          firstName: 'x'.repeat(101),
          lastName: 'mockLastName1',
          dateOfBirth: '1954/10/14',
          dateOfDeath: '2004/04/22'
        },
        {
          firstName: 'x'.repeat(101),
          lastName: 'mockLastName2',
          dateOfBirth: '1984/08/15'
        }
      ];
      request
        .post('/authors/multiple')
        .send({
          authors
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message) // eslint-disable-next-line max-len
            .toBe('Validation Error: body: "authors[0].firstName" length must be less than or equal to 100 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
  });
  describe('Delete author', () => {
    let _id;
    const author = {
      firstName: 'mockFirstName',
      lastName: 'mockLastName',
      dateOfBirth: '1954/10/14',
      dateOfDeath: '2004/04/22'
    };
    beforeAll(async () => {
      const _author = new Author(author);
      await _author.save();
      _id = _author._id.toString();
    });
    afterAll(async () => {
      await Author.deleteMany({});
    });
    test('should properly delete author', (done) => {
      request
        .delete(`/authors/${_id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Deleted author');
          expect(res.body).toHaveProperty('deletedAuthor');
          expect(res.body.deletedAuthor).toHaveProperty('_id');
          expect(res.body.deletedAuthor._id).toBe(_id);
          expect(res.body.deletedAuthor).toHaveProperty('firstName');
          expect(res.body.deletedAuthor.firstName).toBe(author.firstName);
          expect(res.body.deletedAuthor).toHaveProperty('lastName');
          expect(res.body.deletedAuthor.lastName).toBe(author.lastName);
          expect(res.body.deletedAuthor).toHaveProperty('dateOfBirth');
          expect(res.body.deletedAuthor.dateOfBirth).toBe(new Date(author.dateOfBirth).toISOString());
          expect(res.body.deletedAuthor).toHaveProperty('dateOfDeath');
          expect(res.body.deletedAuthor.dateOfDeath).toBe(new Date(author.dateOfDeath).toISOString());
          expect(res.body.deletedAuthor).toHaveProperty('__v');
          return done();
        });
    });
    test('should not delete author because that author no longer exists ', (done) => {
      request
        .delete(`/authors/${_id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe(`Cannot find author with id ${_id}`);
          return done();
        });
    });
    test('should not delete author due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      request
        .delete(`/authors/${invalidId}`)
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
  describe('Update author', () => {
    let _id;
    const author = {
      firstName: 'mockFirstName',
      lastName: 'mockLastName',
      dateOfBirth: '1954/10/14',
      dateOfDeath: '2004/04/22'
    };
    beforeAll(async () => {
      const _author = new Author(author);
      await _author.save();
      _id = _author._id.toString();
    });
    afterAll(async () => {
      await Author.deleteMany({});
    });
    test('should not update author', (done) => {
      request
        .patch(`/authors/${_id}`)
        .send({
          firstName: author.firstName
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Author(s) already exist(s)');
          return done();
        });
    });
    test('should properly update author', (done) => {
      const firstName = 'new';
      request
        .patch(`/authors/${_id}`)
        .send({
          firstName
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('firstName');
          expect(res.body.firstName).not.toBe(author.firstName);
          expect(res.body.firstName).toBe(firstName);
          expect(res.body).toHaveProperty('lastName');
          expect(res.body.lastName).toBe(author.lastName);
          expect(res.body).toHaveProperty('dateOfBirth');
          expect(res.body.dateOfBirth).toBe(new Date(author.dateOfBirth).toISOString());
          expect(res.body).toHaveProperty('dateOfDeath');
          expect(res.body.dateOfDeath).toBe(new Date(author.dateOfDeath).toISOString());
          expect(res.body).not.toHaveProperty('listOfBooks');
          return done();
        });
    });
    test('should not update author due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      const firstName = 'new';
      request
        .patch(`/authors/${invalidId}`)
        .send({
          firstName
        })
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
    test('should not update author because cannot find author', (done) => {
      const notFoundId = '63091e5e4ec3fbc5c720db4c';
      const firstName = 'new';
      request
        .patch(`/authors/${notFoundId}`)
        .send({
          firstName
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe(`Cannot find author with id ${notFoundId}`);
          return done();
        });
    });
  });
});
