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
          expect(res.body).toHaveProperty('genres');
          expect(res.body.genres).toBeInstanceOf(Array);
          expect(res.body.genres).toHaveLength(genres.length);
          res.body.genres.forEach((genre, i) => {
            expect(genre).toMatchObject({
              _id: expect.any(String),
              name: genres.at(i).name,
              __v: expect.any(Number)
            });
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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              genres: [{
                _id: expect.any(String),
                name: 'Fantasy',
                __v: expect.any(Number)
              }]
            })
          );

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              genres: [{
                _id: expect.any(String),
                name: 'Horror',
                __v: expect.any(Number)
              }, {
                _id: expect.any(String),
                name: 'Thriller',
                __v: expect.any(Number)
              }]
            })
          );

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
          expect(res.body).toHaveProperty('genres');
          expect(res.body.genres).toBeInstanceOf(Array);
          expect(res.body.genres).toHaveLength(genres.length);
          const reversedGenres = genres.reverse();
          res.body.genres.forEach((genre, i) => {
            expect(genre).toMatchObject({
              _id: expect.any(String),
              name: reversedGenres.at(i).name,
              __v: expect.any(Number)
            });
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
          expect(res.body).toHaveProperty('genres');
          expect(res.body.genres).toBeInstanceOf(Array);
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
          expect(res.body).toHaveProperty('genres');
          expect(res.body.genres).toBeInstanceOf(Array);
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
          expect(res).toHaveProperty('body.genre',
            expect.objectContaining({
              _id: expect.any(String),
              name: genreName,
              __v: expect.any(Number)
            })
          );

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              genre: {
                _id: expect.any(String),
                name: genreName,
                __v: expect.any(Number)
              },
              listOfBooks: []
            })
          );

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
          expect(res).toHaveProperty('body.genre',
            expect.objectContaining({
              _id: expect.any(String),
              name,
              __v: expect.any(Number)
            })
          );

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: `Genre(s) with name(s) ${name} already exist(s)`
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "name" is not allowed to be empty',
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "name" length must be at least 3 characters long',
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "name" length must be less than or equal to 100 characters long',
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body.genres');
          expect(res.body.genres).toBeInstanceOf(Array);
          res.body.genres.forEach((genre, i) => {
            expect(genre).toMatchObject({
              _id: expect.any(String),
              name: names[i],
              __v: expect.any(Number)
            });
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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: `Genre(s) with name(s) ${names.join()} already exist(s)`
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "names" must contain at least 1 items',
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "names[0]" length must be at least 3 characters long',
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400, // eslint-disable-next-line max-len
              message: 'Validation Error: body: "names[0]" length must be less than or equal to 100 characters long',
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              genre: {
                _id,
                name: genreName,
                __v: expect.any(Number)
              },
              message: 'Deleted genre'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404,
              message: `Cannot find genre with id ${_id}`
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400, // eslint-disable-next-line max-len
              message: `Validation Error: params: "id" with value "${invalidId}" fails to match the required pattern: /^[a-fA-F0-9]{24}$/`,
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              message: 'Deleted genres',
              deletedCount: ids.length
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404,
              message: `Cannot find genre(s) with id(s) ${ids.join()}`
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "ids" must contain at least 1 items',
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Genre(s) with name(s) Fantasy already exist(s)'
            }));

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
          expect(res).toHaveProperty('body.genre',
            expect.objectContaining({
              _id,
              name,
              __v: expect.any(Number)
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400, // eslint-disable-next-line max-len
              message: `Validation Error: params: "id" with value "${invalidId}" fails to match the required pattern: /^[a-fA-F0-9]{24}$/`,
              errors: 'Bad Request'
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404,
              message: `Cannot find genre with id ${notFoundId}`
            }));

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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              updateCount: 0
            }));

          return done();
        });
    });
    test('should properly update multiple genres', (done) => {
      const _genres = ids
        .map(({ _id, name }) => ({ id: _id.toString(), name: name + '_' }));
      request
        .patch('/genres/multiple')
        .send({
          genres: _genres
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              genres: _genres,
              updateCount: ids.length
            }));

          return done();
        });
    });
    test('should not update multiple genres due to validation error ', (done) => {
      request
        .patch('/genres/multiple')
        .send({
          genres: []
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 400,
              message: 'Validation Error: body: "genres" must contain at least 1 items',
              errors: 'Bad Request'
            }));

          return done();
        });
    });
    test('should not update multiple genres because cannot find genre', (done) => {
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
          expect(res).toHaveProperty('body',
            expect.objectContaining({
              code: 404,
              message: `Cannot find genre(s) with id(s) ${genres.map(({ id }) => id).join()}`
            }));

          return done();
        });
    });
  });
});
