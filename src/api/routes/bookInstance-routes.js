const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const {
  bookInstanceList,
  bookInstanceDetail,
  bookInstanceCreateMany,
  bookInstanceCreate,
  bookInstanceDeleteMany,
  bookInstanceDelete,
  bookInstanceUpdateMany,
  bookInstanceUpdate
} = require('../controllers/bookInstance-controller');
const {
  getBookMultiple,
  getBook,
  getBookInstance,
  checkExistence
} = require('../middlewares/bookInstance-middleware');
const validators = require('../validations/bookInstance-validation');

/// BOOKINSTANCE ROUTES ///

// /bookinstances - startpoint of every routes

/**
 * @api {GET} /bookinstances List book instances
 * @apiDescription Get a list of all book instances
 * @apiVersion 1.0.0
 * @apiName ListBookInstances
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{24}} [bookId] This field allows to search all book instances with that book ID. It is not allowed to use with "book" property.
 * @apiBody {Object} [book] This field allows to search all book instances with that book. Book object must include title, author (or authorId), summary, isbn and optionally genre (or genreId). It is not allowed to use with "bookId" property.
 * @apiBody {String} [publisher] This field allows to search all book instances with that publisher.
 * @apiBody {String} [status] This field allows to search all book instances with that status.
 * @apiBody {Object} [back] This field allows to search all book instances with date when the book will be available again. Allowed object properties are:  e (equal), gt (grather than), gte (grather than or equal), lt (less than), lte (less than or equal). Allowed properties values are dates in format YYYY/MM/DD or MM/DD/YYYY.
 * @apiBody {Object} [sort] Sort list of book instances. Allowed object properties are:  _id, book, publisher, status, back. Allowed properties values are: ascending, asc, 1, descending, desc, -1.
 * @apiBody {Number} [skip] This field allows to omit first results. Minimum value 0.
 * @apiBody {Number} [limit] This field allows you to limit the number of results. Minimum value 0.
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, book, publisher, status, back. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, book, publisher, status, back. It is not allowed to use with "only" property.
 * @apiBody {Boolean} [showBook] This field allows you to show the book's object. If this field is not passed or value is false, it only shows the book  ID.
 * @apiBody {Boolean} [showAuthor] This field allows you to show the author's object. It also set showBook to true. If this field is not passed or value is false, it only shows the author ID.
 * @apiBody {Boolean} [showGenre] This field allows you to show the genre object. It also set showBook to true. If this field is not passed or the value is false, it only shows the genre ID.
 *
 * @apiSuccess {Object[]} bookInstances List of book instances
 * @apiSuccess {String{24}|Object} bookInstances[book] ID of the book or book object
 * @apiSuccess {String{3.100}} bookInstances[publisher] Publisher of the book
 * @apiSuccess {String} bookInstances[status] Status of the book
 * @apiSuccess {String} bookInstances[back] Date when the book will be available again
 * @apiSuccess {String} bookInstances[_id] Id of book instance
 * @apiSuccess {Number} bookInstances[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "bookInstances": [
 *        {
 *          "_id": "63387a22c9e5146eae30c150",
 *          "book": "6330168f90a882c473195243",
 *          "publisher": "Orbit",
 *          "status": "Available",
 *          "back": "2022-10-01T17:34:26.282Z",
 *          "__v": 0
 *        },
 *        {
 *          "_id": "6339ac152607dc57ba02a822",
 *          "book": "63237c1c3c5be131031920f1",
 *          "publisher": "Orbit",
 *          "status": "Available",
 *          "back": "2022-10-02T15:19:49.457Z",
 *          "__v": 0
 *        }
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
router.get('/', validate(validators.bookInstanceList), getBook, bookInstanceList);

/**
 * @api {GET} /bookinstances/:id Get book instance
 * @apiDescription Request for one specific book instance
 * @apiVersion 1.0.0
 * @apiName GetBookInstance
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, book, publisher, status, back. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, book, publisher, status, back. It is not allowed to use with "only" property.
 * @apiBody {Boolean} [showBook] This field allows you to show the book's object. If this field is not passed or value is false, it only shows the book  ID.
 * @apiBody {Boolean} [showAuthor] This field allows you to show the author's object. It also set showBook to true. If this field is not passed or value is false, it only shows the author ID.
 * @apiBody {Boolean} [showGenre] This field allows you to show the genre object. It also set showBook to true. If this field is not passed or the value is false, it only shows the genre ID.
 *
 * @apiParam {String{24}} id Book instance id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {Object} bookInstance Requested book instance
 * @apiSuccess {String{24}|Object} bookInstances[book] ID of the book or book object
 * @apiSuccess {String{3.100}} bookInstances[publisher] Publisher of the book
 * @apiSuccess {String} bookInstances[status] Status of the book
 * @apiSuccess {String} bookInstances[back] Date when the book will be available again
 * @apiSuccess {String} bookInstances[_id] Id of book instance
 * @apiSuccess {Number} bookInstances[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "bookInstance": {
 *      "_id": "63387a22c9e5146eae30c150",
 *      "book": "6330168f90a882c473195243",
 *      "publisher": "Orbit",
 *      "status": "Available",
 *      "back": "2022-10-01T17:34:26.282Z",
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
 *    "message": "Cannot find book instance with id 63111ec1d2c560f45b86547e"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/:id', validate(validators.bookInstanceDetail), getBookInstance, bookInstanceDetail);

/**
 * @api {POST} /bookinstances/multiple Create multiple book instances
 * @apiDescription Request for creating multiple book instances
 * @apiVersion 1.0.0
 * @apiName CreateManyBookInstances
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {Object[]} bookInstances Array of book objects.
 * @apiBody {String{24}} bookInstances[bookId] ID of the book. It is not allowed to use with "book" property.
 * @apiBody {Object} bookInstances[book] Book object must include title, author (or authorId), summary, isbn and optionally genre (or genreId). It is not allowed to use with "book" property.
 * @apiBody {String{3.100}} bookInstances[publisher] Publisher of the book
 * @apiBody {String} bookInstances[status] Status of the book. Allowed values are: Available, Maintenance, Loaned, Reserved.
 * @apiBody {String} bookInstances[back] Date when the book will be available again in format YYYY/MM/DD or MM/DD/YYYY.
 *
 * @apiSuccess {Object[]} bookInstances Created book instances
 * @apiSuccess {String{24}} bookInstances[book] ID of the book
 * @apiSuccess {String{3.100}} bookInstances[publisher] Publisher of the book
 * @apiSuccess {String} bookInstances[status] Status of the book
 * @apiSuccess {String} bookInstances[back] Date when the book will be available again
 * @apiSuccess {String} bookInstances[_id] Id of created book instance
 * @apiSuccess {Number} bookInstances[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *    "bookInstances": [
 *      {
 *          "book": "63237c1c3c5be131031920f1",
 *          "publisher": "Orbit",
 *          "status": "Available",
 *          "_id": "6342fd21ece87313c996bd56",
 *          "back": "2022-10-09T16:56:01.059Z",
 *          "__v": 0
 *      },
 *      {
 *          "book": "631f83cb80077376df36bd7f",
 *          "publisher": "Orbit",
 *          "status": "Available",
 *          "_id": "6342fd21ece87313c996bd57",
 *          "back": "2022-10-09T16:56:01.060Z",
 *          "__v": 0
 *      }
 *    ]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or book instance existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"bookInstances[0].publisher\" is required",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Book existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Book instance(s) already exist(s)"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/multiple', validate(validators.bookInstanceCreateMany), getBookMultiple, bookInstanceCreateMany);

/**
 * @api {POST} /bookinstances Create book instance
 * @apiDescription Request for creating book instance
 * @apiVersion 1.0.0
 * @apiName CreateBookInstance
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{24}} bookId ID of the book. It is not allowed to use with "book" property.
 * @apiBody {Object} book Book object must include title, author (or authorId), summary, isbn and optionally genre (or genreId). It is not allowed to use with "book" property.
 * @apiBody {String{3.100}} publisher Publisher of the book
 * @apiBody {String} status Status of the book. Allowed values are: Available, Maintenance, Loaned, Reserved.
 * @apiBody {String} back=2022/12/12 Date when the book will be available again in format YYYY/MM/DD or MM/DD/YYYY.
 *
 *
 * @apiSuccess {String{24}} book ID of the book
 * @apiSuccess {String{3.100}} publisher Publisher of the book
 * @apiSuccess {String} status Status of the book
 * @apiSuccess {String} back Date when the book will be available again
 * @apiSuccess {String} _id Id of created book instance
 * @apiSuccess {Number} __v versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *    "bookInstance": {
 *     "book": "6330168f90a882c473195243",
 *     "publisher": "Orbit",
 *     "status": "Available",
 *     "back": "2022-10-01T17:34:26.282Z",
 *     "_id": "63387a22c9e5146eae30c150",
 *     "__v": 0
 *    }
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or book instance existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"publisher\" is not allowed to be empty",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Book existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Book instance(s) already exist(s)"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/', validate(validators.bookInstanceCreate), getBook, bookInstanceCreate);

/**
 * @api {DELETE} /bookinstances/multiple Delete multiple book instances
 * @apiDescription Request to delete multiple book instances
 * @apiVersion 1.0.0
 * @apiName DeleteManyBookInstances
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} ids Book instances ids
 *
 *
 * @apiSuccess {String} message Deleted book instances
 * @apiSuccess {Number} deletedCount Number of deleted book instances
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *     "message": "Deleted book instances"
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
 *    "message": "Cannot find book instance(s) with id(s) 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/multiple', validate(validators.bookInstanceDeleteMany), checkExistence, bookInstanceDeleteMany);

/**
 * @api {DELETE} /bookinstances/:id Delete book instance
 * @apiDescription Request to delete book
 * @apiVersion 1.0.0
 * @apiName DeleteBookInstance
 * @apiGroup BookInstances
 *
 * @apiParam {String{24}} id Book instance id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {String} message Deleted book instance
 * @apiSuccess {Object} deletedBook Object of deleted book instance
 * @apiSuccess {String{24}} deletedBook[book] ID of the book
 * @apiSuccess {String{3.100}} deletedBook[publisher] Publisher of the book
 * @apiSuccess {String} deletedBook[status] Status of the book
 * @apiSuccess {String} deletedBook[back] Date when the book will be available again
 * @apiSuccess {String} deletedBook[_id] Id of deleted book instance
 * @apiSuccess {Number} deletedBook[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "message": "Deleted book instance",
 *    "bookInstance": {
 *      "_id": "63387a22c9e5146eae30c150",
 *      "book": "6330168f90a882c473195243",
 *      "publisher": "Orbit",
 *      "status": "Available",
 *      "back": "2022-10-01T17:34:26.282Z",
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
 *    "message": "Cannot find book instance with id 63111ec1d2c560f45b86547e"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/:id', validate(validators.bookInstanceDelete), getBookInstance, bookInstanceDelete);

/**
 * @api {PATCH} /bookinstances/multiple Update multiple book instances
 * @apiDescription Request to update multiple book instances
 * @apiVersion 1.0.0
 * @apiName UpdateManyBookInstances
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {Object[]} bookInstances Book instances to update. One object must include id and at least one of the following fields book (or bookId), publisher, status, back.
 * @apiBody {String{24}} [bookInstances[bookId]] ID of the book. It is not allowed to use with "book" property.
 * @apiBody {Object} [bookInstances[book]] Book object must include title, author (or authorId), summary, isbn and optionally genre (or genreId). It is not allowed to use with "book" property.
 * @apiBody {String{3.100}} [bookInstances[publisher]] Publisher of the book
 * @apiBody {String} [bookInstances[status]] Status of the book. Allowed values are: Available, Maintenance, Loaned, Reserved.
 * @apiBody {String} [bookInstances[back]] Date when the book will be available again in format YYYY/MM/DD or MM/DD/YYYY.
 *
 * @apiSuccess {Object[]} bookInstances Updated book instances
 * @apiSuccess {String{24}} [bookInstances[book]] ID of the book
 * @apiSuccess {String{3.100}} [bookInstances[publisher]] Publisher of the book
 * @apiSuccess {String} [bookInstances[status]] Status of the book
 * @apiSuccess {String} [bookInstances[back]] Date when the book will be available again
 * @apiSuccess {String} bookInstances[_id] Id of created book instance
 * @apiSuccess {Number} bookInstances[__v] versionKey
 * @apiSuccess {Number} updateCount Number of updated book instances
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "bookInstances": [
 *      {
 *        "id": "633dc60d223aa222257c957d",
 *        "publisher": "Orbit"
 *      },
 *      {
 *        "id": "633dc60c223aa222257c9577",
 *        "publisher": "Orbit"
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
 *    "message": "Validation Error: body: \"bookInstances[0].id\" is required",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find book instance(s) with id(s) 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/multiple', validate(validators.bookInstanceUpdateMany), checkExistence, bookInstanceUpdateMany);

/**
 * @api {PATCH} /bookinstances/:id Update book instance
 * @apiDescription Request to update book instance
 * @apiVersion 1.0.0
 * @apiName UpdateBookInstance
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{24}} bookId ID of the book. It is not allowed to use with "book" property.
 * @apiBody {Object} book Book object must include title, author (or authorId), summary, isbn and optionally genre (or genreId). It is not allowed to use with "book" property.
 * @apiBody {String{3.100}} publisher Publisher of the book
 * @apiBody {String} status Status of the book. Allowed values are: Available, Maintenance, Loaned, Reserved.
 * @apiBody {String} back=2022/12/12 Date when the book will be available again in format YYYY/MM/DD or MM/DD/YYYY.
 *
 * @apiParam {String{24}} id Book id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {String{24}} book ID of the book
 * @apiSuccess {String{3.100}} publisher Publisher of the book
 * @apiSuccess {String} status Status of the book
 * @apiSuccess {String} back Date when the book will be available again
 * @apiSuccess {String} _id Id of created book instance
 * @apiSuccess {Number} __v versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "bookInstance": {
 *     "book": "6330168f90a882c473195243",
 *     "publisher": "Orbit",
 *     "status": "Available",
 *     "back": "2022-10-01T17:34:26.282Z",
 *     "_id": "63387a22c9e5146eae30c150",
 *     "__v": 0
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
 *    "message": "Cannot find book instance with id 63111ec1d2c560f45b86547e"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/:id', validate(validators.bookInstanceUpdate), getBook, getBookInstance, bookInstanceUpdate);

module.exports = router;
