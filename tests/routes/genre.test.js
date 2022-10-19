const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const app = require('../../src/config/express');
const supertest = require('supertest');
const mongoose = require('../../src/config/mongoose');
const Genre = require('../../src/api/models/genre-model');
const request = supertest(app);

describe('GENRE ROUTES', () => {
  let mongodb, connection;
  beforeAll(async () => {
    ({ connection, mongodb } = await mongoose.connect());
  });
  afterAll(async () => {
    await connection.disconnect();
    await mongodb.stop();
  });
  describe('List genres', () => {
    const genres = [
      { name: 'Fantasy' },
      { name: 'Horror' },
      { name: 'Thriller' },
      { name: 'Western' }
    ];
    beforeAll(async () => {
      await Genre.insertMany(genres);
    });
    afterAll(async () => {
      await Genre.deleteMany({});
    });
    test('should return full list of genres', (done) => {
      request
        .get('/genres')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.genres).toHaveLength(genres.length);
          res.body.genres.forEach(({ name }, i) => {
            expect(name).toBe(genres.at(i).name);
          });
          return done();
        });
    });
    test('should return list of genres which match the passed name', (done) => {
      request
        .get('/genres')
        .send({
          name: 'Fan'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.genres).toHaveLength(1);
          expect(res.body.genres[0].name).toBe('Fantasy');
          return done();
        });
    });
    test('should return list of genres with limited number of result to 2 and skipped first result', (done) => {
      request
        .get('/genres')
        .send({
          skip: 1,
          limit: 2
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.genres).toHaveLength(2);
          expect(res.body.genres[0].name).toBe('Horror');
          expect(res.body.genres[1].name).toBe('Thriller');
          return done();
        });
    });
    test('should return list of genres sorted descending by name', (done) => {
      request
        .get('/genres')
        .send({
          sort: {
            name: -1
          }
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.genres).toHaveLength(genres.length);
          const reversedGenres = genres.reverse();
          res.body.genres.forEach(({ name }, i) => {
            expect(name).toBe(reversedGenres.at(i).name);
          });
          return done();
        });
    });
    test('should return list of genres with only _id field', (done) => {
      request
        .get('/genres')
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.genres).toHaveLength(genres.length);
          res.body.genres.forEach((genre) => {
            expect(Object.hasOwn(genre, '_id')).toBe(true);
            expect(Object.hasOwn(genre, 'name')).toBe(false);
            expect(Object.hasOwn(genre, '__v')).toBe(false);
          });
          return done();
        });
    });
    test('should return list of genres with omitted _id and __v field', (done) => {
      request
        .get('/genres')
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.genres).toHaveLength(genres.length);
          res.body.genres.forEach((genre) => {
            expect(Object.hasOwn(genre, '_id')).toBe(false);
            expect(Object.hasOwn(genre, 'name')).toBe(true);
            expect(Object.hasOwn(genre, '__v')).toBe(false);
          });
          return done();
        });
    });
  });
  describe('Get genre', () => {
    let _id;
    const genreName = 'Biography';
    beforeAll(async () => {
      const genre = new Genre({
        name: genreName
      });
      await genre.save();
      _id = genre._id.toString();
    });
    afterAll(async () => {
      await Genre.deleteMany({});
    });
    test('should return genre', (done) => {
      request
        .get(`/genres/${_id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('genre');
          expect(res.body.genre).toHaveProperty('name');
          expect(res.body.genre.name).toBe(genreName);
          return done();
        });
    });
    test('should return genre with list of books in this genre', (done) => {
      request
        .get(`/genres/${_id}`)
        .send({
          showBookList: true
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('genre');
          expect(res.body.genre).toHaveProperty('name');
          expect(res.body.genre.name).toBe(genreName);
          expect(res.body).toHaveProperty('listOfBooks');
          expect(res.body.listOfBooks).toStrictEqual([]);
          return done();
        });
    });
    test('should return genre with only _id field', (done) => {
      request
        .get(`/genres/${_id}`)
        .send({
          only: ['_id']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('genre');
          expect(Object.hasOwn(res.body.genre, '_id')).toBe(true);
          expect(Object.hasOwn(res.body.genre, 'name')).toBe(false);
          expect(Object.hasOwn(res.body.genre, '__v')).toBe(false);
          return done();
        });
    });
    test('should return genre with omitted _id and __v field', (done) => {
      request
        .get(`/genres/${_id}`)
        .send({
          omit: ['_id', '__v']
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('genre');
          expect(Object.hasOwn(res.body.genre, '_id')).toBe(false);
          expect(Object.hasOwn(res.body.genre, 'name')).toBe(true);
          expect(Object.hasOwn(res.body.genre, '__v')).toBe(false);
          return done();
        });
    });
  });
  describe('Create genre', () => {
    test('should properly create a genre', (done) => {
      const name = 'Fantasy';
      request
        .post('/genres')
        .send({
          name
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('name');
          expect(res.body.name).toBe(name);
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('__v');
          return done();
        });
    });
    test('should not create a genre because it already exists', (done) => {
      const name = 'Fantasy';
      request
        .post('/genres')
        .send({
          name
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Genre(s) with name(s) Fantasy already exist(s)');
          return done();
        });
    });
    test('should not create a genre due to empty name', (done) => {
      const name = '';
      request
        .post('/genres')
        .send({
          name
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Validation Error: body: "name" is not allowed to be empty');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create a genre due to too short length of name', (done) => {
      const name = 'xx';
      request
        .post('/genres')
        .send({
          name
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "name" length must be at least 3 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create a genre due to too long length of name', (done) => {
      const name = 'x'.repeat(101);
      request
        .post('/genres')
        .send({
          name
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "name" length must be less than or equal to 100 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
  });
});
