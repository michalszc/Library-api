const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const {
  bookInstanceList,
  bookInstanceDetail,
  bookInstanceCreate,
  bookInstanceDelete
} = require('../controllers/bookInstance-controller');
const { getBook, getBookInstance } = require('../middlewares/bookInstance-middleware');
const validators = require('../validations/bookInstance-validation');
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

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
 * @apiSuccess {Object[]} genres List of genres
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "bookInsances": []
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
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
 * @api {POST} /bookinstances Create book instance
 * @apiDescription Request for creating book instance
 * @apiVersion 1.0.0
 * @apiName CreateBookInstance
 * @apiGroup BookInstances
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{24}} bookId ID of the book. It is not allowed to use with "book" property.
 * @apiBody {Object} book Book object must include title, author (or authorId), summary, isbn and optionally genre (or genreId). It is not allowed to use with "book" property.
 * @apiBody {String{3.100} publisher Publisher of the book
 * @apiBody {String} status Status of the book. Allowed values are: Available, Maintenance, Loaned, Reserved.
 * @apiBody {String} back=2022/12/12 Date when the book will be available again in format YYYY/MM/DD or MM/DD/YYYY.
 *
 *
 * @apiSuccess {String{24}} book ID of the book
 * @apiSuccess {String{3.100} publisher Publisher of the book
 * @apiSuccess {String} status Status of the book
 * @apiSuccess {String} back Date when the book will be available again
 * @apiSuccess {String} _id Id of created book instance
 * @apiSuccess {Number} __v versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *     "book": "6330168f90a882c473195243",
 *     "publisher": "Orbit",
 *     "status": "Available",
 *     "back": "2022-10-01T17:34:26.282Z",
 *     "_id": "63387a22c9e5146eae30c150",
 *     "__v": 0
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or book instance existence
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
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "message": "Deleted book instance",
 *    "deletedBookInstance": {
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

// PATCH request to update book instance
router.patch('/:id', tmp);

module.exports = router;
