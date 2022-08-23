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
 * @apiSuccess {String[]} genres List of genres
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "genres": [
 *      "Fantasy",
 *      "Horror",
 *      "Thriller"
 *    ]
 *  }
 * 
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/', genreList);

/**
 * @api {POST} /genres/create Create a genre
 * @apiDescription Request for creating a genre
 * @apiVersion 1.0.0
 * @apiName CreateGenre
 * @apiGroup Genres
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{3.100}} name=Fantasy Genre name
 * 
 * @apiSuccess {String} name Name of created genre
 * @apiSuccess {String} _id Id of created genre
 * @apiSuccess {Number} __v versionKey
 * 
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *    "name": "Fantasy",
 *    "_id": "6303e5462019452162263dfa",
 *    "__v": 0
 *  }
 * 
 * @apiError BadRequest The server cannot or will not process the request due to validation error or genre existence
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"name\" is not allowed to be empty",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Genre existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Genre already exists"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/create', validate(validators.genreCreate), genreCreate);

// Use middlewares
router.route('/:id')
  .get(validate(validators.genreDetail), getGenre)
  .delete(validate(validators.genreDelete), getGenre)
  .patch(validate(validators.genreUpdate), getGenre);

/**
 * @api {GET} /genres/:id Get genre
 * @apiDescription Request for one specific genre
 * @apiVersion 1.0.0
 * @apiName GetGenre
 * @apiGroup Genres
 * 
 * @apiParam {String{24}} id Genre id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 * 
 * @apiSuccess {Object} genre Requested genre
 * @apiSuccess {String[]} listOfBooks List of books with this genre
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "genre": {
 *      "_id": "62fd5e7e3037984b1b5effb2",
 *      "name": "Fantasy",
 *      "__v": 0
 *    },
 *    "listOfBooks": null
 *  }
 * 
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: params: \"id\" with value \"62fd5e7e3037984b1b5effbg\" fails to match the required pattern: /^[a-fA-F0-9]{24}$/",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find genre"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/:id', genreDetail);

/**
 * @api {DELETE} /genres/:id Delete genre
 * @apiDescription Request to delete genre
 * @apiVersion 1.0.0
 * @apiName DeleteGenre
 * @apiGroup Genres
 * 
 * @apiParam {String{24}} id Genre id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 * 
 * @apiSuccess {String} message Deleted genre
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *     "message": "Deleted genre"
 *  }
 * 
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: params: \"id\" with value \"62fd5e7e3037984b1b5effbg\" fails to match the required pattern: /^[a-fA-F0-9]{24}$/",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find genre"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/:id', genreDelete);

/**
 * @api {PATCH} /genres/:id Update genre
 * @apiDescription Request to update genre
 * @apiVersion 1.0.0
 * @apiName UpdateGenre
 * @apiGroup Genres
 * 
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{3.100}} name=Fantasy Genre name
 * 
 * @apiParam {String{24}} id Genre id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 * 
 * @apiSuccess {String} name Name of updated genre
 * @apiSuccess {String} _id Id of updated genre
 * @apiSuccess {Number} __v versionKey
 * 
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "name": "Fantasy",
 *    "_id": "6303e5462019452162263dfa",
 *    "__v": 0
 *  }
 * 
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: params: \"id\" with value \"62fd5e7e3037984b1b5effbg\" fails to match the required pattern: /^[a-fA-F0-9]{24}$/",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find genre"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/:id', genreUpdate);

module.exports = router;
