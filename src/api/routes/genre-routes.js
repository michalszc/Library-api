const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const {
  genreList,
  genreDetail,
  genreCreate,
  genreCreateMany,
  genreDelete,
  genreDeleteMany,
  genreUpdate,
  genreUpdateMany
} = require('../controllers/genre-controller');
const { getGenre, checkExistence } = require('../middlewares/genre-middleware');
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
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String} [name] This field allows to search all genres matching that name.
 * @apiBody {Object} [sort] Sort list of genres. Allowed object properties are:  _id, name. Allowed properties values are: ascending, asc, 1, descending, desc, -1.
 * @apiBody {Number} [skip] This field allows to omit first results. Minimum value 0.
 * @apiBody {Number} [limit] This field allows you to limit the number of results. Minimum value 0.
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, name. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, name. It is not allowed to use with "only" property.
 *
 * @apiSuccess {Object[]} genres List of genres
 * @apiSuccess {String} genres[_id] Id of genre
 * @apiSuccess {String} genres[name] Name of genre
 * @apiSuccess {Number} genres[__v] versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "genres": [
 *      {
 *        "_id": "62fd5e7e3037984b1b5effb2",
 *        "name": "Fantasy",
 *        "__v": 0
 *      },
 *      {
 *        "_id": "62fe03a56c3b6bf22e73f6e0",
 *        "name": "Horror",
 *        "__v": 0
 *      },
 *      {
 *        "_id": "63068a86b343e556c192d9a4",
 *        "name": "Thriller",
 *        "__v": 0
 *      },
 *      {
 *        "_id": "63052941a306a85f5157d0cc",
 *        "name": "Western",
 *        "__v": 0
 *      }
 *    ]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"sort.name\" must be one of [1, -1, ascending, asc, descending, desc]",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/', validate(validators.genreList), genreList);

/**
 * @api {GET} /genres/:id Get genre
 * @apiDescription Request for one specific genre
 * @apiVersion 1.0.0
 * @apiName GetGenre
 * @apiGroup Genres
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, name. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, name. It is not allowed to use with "only" property.
 * @apiBody {Boolean} [showBookList] This field allows you to show list of books with that genre. Default is false.
 *
 * @apiParam {String{24}} id Genre id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {Object} genre Requested genre
 * @apiSuccess {String} genres[_id] Id of genre
 * @apiSuccess {String} genres[name] Name of genre
 * @apiSuccess {Number} genres[__v] versionKey
 * @apiSuccess {Object[]} listOfBooks List of books with this genre
 * @apiSuccess {String} listOfBooks[_id] Id of book
 * @apiSuccess {String{1.100}} listOfBooks[title]  Title of the book
 * @apiSuccess {String} listOfBooks[author] Author id
 * @apiSuccess {String{1.500}} listOfBooks[summary]  Summary of the bookk
 * @apiSuccess {String{10,13}} listOfBooks[isbn]  International Standard Book Number
 * @apiSuccess {Number} listOfBooks[__v] versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "genre": {
 *      "_id": "62fd5e7e3037984b1b5effb2",
 *      "name": "Fantasy",
 *      "__v": 0
 *    },
 *    "listOfBooks": [{
 *       "_id": "63301675b39f89e97d14db2b",
 *       "title": "The Witcher: Sword of Destiny",
 *       "author": "63111ec1d2c560f45b865478",
 *       "summary": "Geralt of Rivia is a Witcher, a man whose magic powers andifelong training have made him a brilliant fighter and a mercilessssassin. Yet he is no ordinary killer: he hunts the vile fiends thatavage the land and attack the innocent. But not everything monstroulooking is evil; not everything fair is good . . . and in every fairy talehere is a grain of truth.",
 *       "isbn": "9780316389709",
 *       "__v": 0
 *     }]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
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
 *    "message": "Cannot find genre with id 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/:id', validate(validators.genreDetail), getGenre, genreDetail);

/**
 * @api {POST} /genres/multiple Create multiple genres
 * @apiDescription Request for creating multiple genres
 * @apiVersion 1.0.0
 * @apiName CreateManyGenres
 * @apiGroup Genres
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} names Genres names
 *
 * @apiSuccess {Object[]} genres Created genres
 * @apiSuccess {String} genres[_id] Id of created genre
 * @apiSuccess {String} genres[name] Name of created genre
 * @apiSuccess {Number} genres[__v] versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *    "genres": [
 *      {
 *        "name": "Fantasy",
 *        "_id": "6307cd8fc79812e636963da7",
 *        "__v": 0
 *      },
 *      {
 *        "name": "Western",
 *        "_id": "6307cd8fc79812e636963da8",
 *        "__v": 0
 *      }
 *    ]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or genre existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"names\" must contain at least 1 items",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Genre existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Genre(s) with name(s) Fantasy, Western already exist(s)"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/multiple', validate(validators.genreCreateMany), genreCreateMany);

/**
 * @api {POST} /genres Create a genre
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
 *    "genre": {
 *      "name": "Fantasy",
 *      "_id": "6303e5462019452162263dfa",
 *      "__v": 0
 *    }
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or genre existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
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
 *    "message": "Genre(s) with name(s) Fantasy already exist(s)"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/', validate(validators.genreCreate), genreCreate);

/**
 * @api {DELETE} /genres/multiple Delete multiple genres
 * @apiDescription Request to delete multiple genres
 * @apiVersion 1.0.0
 * @apiName DeleteManyGenres
 * @apiGroup Genres
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} ids Genres ids
 *
 *
 * @apiSuccess {String} message Deleted genres
 * @apiSuccess {Number} deletedCount Number of deleted genres
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *     "message": "Deleted genres"
 *     "deletedCount": 2
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"ids\" must contain at least 1 items",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find genre(s) with id(s) 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/multiple', validate(validators.genreDeleteMany), checkExistence, genreDeleteMany);

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
 * @apiSuccess {Object} deletedGenre Deleted genre
 * @apiSuccess {String} deletedGenre[_id] Id of deleted genre
 * @apiSuccess {String} deletedGenre[name] Name of deleted genre
 * @apiSuccess {Number} deletedGenre[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "message": "Deleted genre",
 *    "genre": {
 *      "_id": "62fd5e7e3037984b1b5effb2",
 *      "name": "Fantasy",
 *      "__v": 0
 *     }
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
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
 *    "message": "Cannot find genre with id 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/:id', validate(validators.genreDelete), getGenre, genreDelete);

/**
 * @api {PATCH} /genres/multiple Update multiple genres
 * @apiDescription Request to update multiple genres
 * @apiVersion 1.0.0
 * @apiName UpdateManyGenres
 * @apiGroup Genres
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {Object[]} genres Genres to update
 * @apiSuccess {String} genres[_id] Id of genre
 * @apiSuccess {String} genres[name] New genre name
 *
 * @apiSuccess {Object[]} genres Updated genres
 * @apiSuccess {String} genres[_id] Id of genre
 * @apiSuccess {String} genres[name] Name of updated genre
 * @apiSuccess {Number} updateCount Number of updated genres
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "genres": [
 *      {
 *        "id": "6307c2cee81191f838834f43",
 *        "name": "Fantasy"
 *      },
 *      {
 *        "id": "6307c5dbbd3d453ab54914de",
 *        "name": "Western"
 *      }
 *    ],
 *    "updateCount": 2
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"genres\" must contain at least 1 items",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find genre(s) with id(s) 6307c2ceee1191f838834f43"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/multiple', validate(validators.genreUpdateMany), checkExistence, genreUpdateMany);

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
 *    "genre": {
 *      "name": "Fantasy",
 *      "_id": "6303e5462019452162263dfa",
 *      "__v": 0
 *    }
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
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
 *    "message": "Cannot find genre with id 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/:id', validate(validators.genreUpdate), getGenre, genreUpdate);

module.exports = router;
