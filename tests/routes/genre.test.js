const { describe, expect, test, beforeAll } = require('@jest/globals');
const app = require('../../src/config/express');
const supertest = require('supertest');
const mongoose = require('../../src/config/mongoose');
const Genre = require('../../src/api/models/genre-model');
const request = supertest(app);

describe('GENRE ROUTES', () => {
  beforeAll(async () => {
    await mongoose.connect();
  });
  describe('List genres', () => {
    const genres = [
      { name: 'Fantasy' },
      { name: 'Horror' },
      { name: 'Thriller' },
      { name: 'Western' }
    ];
    beforeAll(() => {
      Genre.insertMany(genres);
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
});
