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
            expect(genre).toHaveProperty('_id');
            expect(genre).not.toHaveProperty('name');
            expect(genre).not.toHaveProperty('__v');
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
            expect(genre).not.toHaveProperty('_id');
            expect(genre).toHaveProperty('name');
            expect(genre).not.toHaveProperty('__v');
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
          expect(res.body.genre).toHaveProperty('_id');
          expect(res.body.genre).not.toHaveProperty('name');
          expect(res.body.genre).not.toHaveProperty('__v');
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
          expect(res.body.genre).not.toHaveProperty('_id');
          expect(res.body.genre).toHaveProperty('name');
          expect(res.body.genre).not.toHaveProperty('__v');
          return done();
        });
    });
  });
  describe('Create genre', () => {
    afterAll(async () => {
      await Genre.deleteMany({});
    });
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
  describe('Create mulitple genres', () => {
    afterAll(async () => {
      await Genre.deleteMany({});
    });
    test('should properly create multiple genres', (done) => {
      const names = ['Fantasy', 'Horror', 'Western', 'Thriller'];
      request
        .post('/genres/multiple')
        .send({
          names
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toBeInstanceOf(Array);
          res.body.forEach((genre, i) => {
            expect(genre).toHaveProperty('name');
            expect(genre.name).toBe(names[i]);
            expect(genre).toHaveProperty('_id');
            expect(genre).toHaveProperty('__v');
          });
          return done();
        });
    });
    test('should not create multiple genres because they already exist', (done) => {
      const names = ['Fantasy', 'Horror', 'Western', 'Thriller'];
      request
        .post('/genres/multiple')
        .send({
          names
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe(`Genre(s) with name(s) ${names.join()} already exist(s)`);
          return done();
        });
    });
    test('should not create multiple genres due to empty names', (done) => {
      const names = [];
      request
        .post('/genres/multiple')
        .send({
          names
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Validation Error: body: "names" must contain at least 1 items');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create multiple genres due to too short length of name', (done) => {
      const names = ['xx'];
      request
        .post('/genres/multiple')
        .send({
          names
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "names[0]" length must be at least 3 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not create multiple genres due to too long length of name', (done) => {
      const names = ['x'.repeat(101)];
      request
        .post('/genres/multiple')
        .send({
          names
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "names[0]" length must be less than or equal to 100 characters long');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
  });
  describe('Delete genre', () => {
    let _id;
    const genreName = 'Fantasy';
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
    test('should properly delete genre', (done) => {
      request
        .delete(`/genres/${_id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Deleted genre');
          expect(res.body).toHaveProperty('deletedGenre');
          expect(res.body.deletedGenre).toHaveProperty('_id');
          expect(res.body.deletedGenre._id).toBe(_id);
          expect(res.body.deletedGenre).toHaveProperty('name');
          expect(res.body.deletedGenre.name).toBe(genreName);
          expect(res.body.deletedGenre).toHaveProperty('__v');
          return done();
        });
    });
    test('should not delete genre because that genre no longer exists ', (done) => {
      request
        .delete(`/genres/${_id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe(`Cannot find genre with id ${_id}`);
          return done();
        });
    });
    test('should not delete genre due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      request
        .delete(`/genres/${invalidId}`)
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
  describe('Delete multiple genres', () => {
    const ids = [];
    beforeAll(async () => {
      const genres = await Genre.insertMany([
        { name: 'Fantasy' },
        { name: 'Horror' },
        { name: 'Thriller' },
        { name: 'Western' }
      ]);
      genres.forEach(({ _id }) => {
        ids.push(_id);
      });
    });
    afterAll(async () => {
      await Genre.deleteMany({});
    });
    test('should properly delete multiple genres', (done) => {
      request
        .delete('/genres/multiple')
        .send({
          ids
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Deleted genres');
          expect(res.body).toHaveProperty('deletedCount');
          expect(res.body.deletedCount).toBe(ids.length);
          return done();
        });
    });
    test('should not delete genres because that genres no longer exist ', (done) => {
      request
        .delete('/genres/multiple')
        .send({
          ids
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe(`Cannot find genre(s) with id(s) ${ids.join()}`);
          return done();
        });
    });
    test('should not delete genres due to validation error ', (done) => {
      request
        .delete('/genres/multiple')
        .send({
          ids: []
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "ids" must contain at least 1 items');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
  });
  describe('Update genre', () => {
    let _id;
    const genreName = 'Fantasy';
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
    test('should not update genre', (done) => {
      request
        .patch(`/genres/${_id}`)
        .send({
          name: genreName
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
    test('should properly update genre', (done) => {
      const name = 'Horror';
      request
        .patch(`/genres/${_id}`)
        .send({
          name
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body._id).toBe(_id);
          expect(res.body).toHaveProperty('name');
          expect(res.body.name).toBe(name);
          expect(res.body).toHaveProperty('__v');
          return done();
        });
    });
    test('should not update genre due to validation error ', (done) => {
      const invalidId = '62fd5e7e3037984b1b5effbg';
      const name = 'Western';
      request
        .patch(`/genres/${invalidId}`)
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
          expect(res.body.message) // eslint-disable-next-line max-len
            .toBe(`Validation Error: params: "id" with value "${invalidId}" fails to match the required pattern: /^[a-fA-F0-9]{24}$/`);
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not update genre because cannot find genre', (done) => {
      const notFoundId = '63091e5e4ec3fbc5c720db4c';
      const name = 'Western';
      request
        .patch(`/genres/${notFoundId}`)
        .send({
          name
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe(`Cannot find genre with id ${notFoundId}`);
          return done();
        });
    });
  });
  describe('Update multiple genres', () => {
    const ids = [];
    beforeAll(async () => {
      const genres = await Genre.insertMany([
        { name: 'Fantasy' },
        { name: 'Horror' },
        { name: 'Thriller' },
        { name: 'Western' }
      ]);
      genres.forEach(({ _id, name }) => {
        ids.push({ _id, name });
      });
    });
    afterAll(async () => {
      await Genre.deleteMany({});
    });
    test('should not update multiple genres', (done) => {
      request
        .patch('/genres/multiple')
        .send({
          genres: ids.map(({ _id, name }) => ({ id: _id, name }))
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('updateCount');
          expect(res.body.updateCount).toBe(0);
          return done();
        });
    });
    test('should properly update multiple genres', (done) => {
      request
        .patch('/genres/multiple')
        .send({
          genres: ids.map(({ _id, name }) => ({ id: _id, name: name + '_' }))
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveProperty('genres');
          res.body.genres.forEach(({ name }, i) => {
            expect(name).not.toBe(ids[i].name);
          });
          expect(res.body).toHaveProperty('updateCount');
          expect(res.body.updateCount).toBe(ids.length);
          return done();
        });
    });
    test('should not multiple genres due to validation error ', (done) => {
      request
        .patch('/genres/multiple')
        .send({
          genres: []
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(400);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe('Validation Error: body: "genres" must contain at least 1 items');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toBe('Bad Request');
          return done();
        });
    });
    test('should not multiple genres because cannot find genre', (done) => {
      const genres = ids.map(({ _id, name }) =>
        ({ id: _id.toString().replace(/[a-c]/, 'd'), name: name + '_' })
      );
      request
        .patch('/genres/multiple')
        .send({
          genres
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(res => {
          expect(res.body).toHaveProperty('code');
          expect(res.body.code).toBe(404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message)
            .toBe(`Cannot find genre(s) with id(s) ${genres.map(({ id }) => id).join()}`);
          return done();
        });
    });
  });
});
