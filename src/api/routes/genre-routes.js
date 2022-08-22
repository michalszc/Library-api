const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const { genreList, genreDetail, genreCreate, genreDelete, genreUpdate } = require('../controllers/genre-controller');
const { getGenre } = require('../middlewares/genre-middleware');
const validators = require('../validations/genre-validation');

/// GENRE ROUTES ///

// /genres - startpoint of every routes

/**
 * @api {GET} /genres List genres
 * @apiDescription Get a list of all genres
 * @apiVersion 1.0.0
 * @apiName ListGenres
 * @apiGroup Genres
 *
 * @apiSuccess {String[]} Genres List of genres
 * 
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  [
 *     "Fantasy",
 *     "Horror"
 *  ]
 * 
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * 
 * @apiErrorExample {json} Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/', genreList);

// POST request for creating a genre
/**
 * @api {POST} /genres/create Create a genre
 * @apiDescription Request for creating a genre
 * @apiVersion 1.0.0
 * @apiName CreateGenre
 * @apiGroup Genres
 *
 * @apiHeader {String} Content-Type=application/json
 * 
 * @apiBody {String{3.100}} name Genre name
 * 
 * @apiSuccess {Object} Genre Created genre
 * 
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *    "name": "Fantasy",
 *    "_id": "6303e5462019452162263dfa",
 *    "__v": 0
 *  }
 * 
 * @apiError BadRequest the server cannot or will not process the request due to something that is perceived to be a client error
 * @apiErrorExample {json} Bad Request response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Genre already exists"
 *  }
 * 
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/create', validate(validators.genreCreate), genreCreate);

// Use middlewares
router.route('/:id')
  .get(validate(validators.genreDetail), getGenre)
  .delete(validate(validators.genreDelete), getGenre)
  .patch(validate(validators.genreUpdate), getGenre);

// GET request for one genre
router.get('/:id', genreDetail);

// DELETE request to delete genre
router.delete('/:id', genreDelete);

// PATCH request to update genre
router.patch('/:id', genreUpdate);

module.exports = router;
