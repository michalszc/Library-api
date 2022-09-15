const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const { bookList, bookDetail, bookCreate, bookDelete } = require('../controllers/book-controller');
const { getAuthorAndGenre, getBook } = require('../middlewares/book-middleware');
const validators = require('../validations/book-validation');
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

/// BOOK ROUTES ///

// /books - startpoint of every routes

/**
 * @api {GET} /books List books
 * @apiDescription Get a list of all books
 * @apiVersion 1.0.0
 * @apiName ListBooks
 * @apiGroup Books
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String} [title] This field allows to search all books with that title.
 * @apiBody {String} [authorId] This field allows to search all books with that author ID. It is not allowed to use with "author" property.
 * @apiBody {Object} [author] This field allows to search all books with that author. Allowed object properties are: firstName, lastName, dateOfBirth, dateOfDeath. Dates fields are object  with allowed properties:  e (equal), gt (grather than), gte (grather than or equal), lt (less than), lte (less than or equal) and allowed properties values are dates in format YYYY/MM/DD or MM/DD/YYYY. It is not allowed to use with "authorId" property.
 * @apiBody {String} [summary] This field allows to search all books with that summary.
 * @apiBody {String} [isbn] This field allows to search all books with that International Standard Book Number
 * @apiBody {String} [genreId] This field allows to search all books with that genre ID. It is not allowed to use with "genre" property.
 * @apiBody {Object} [genre] This field allows to search all books with that genre. Allowed object property is name. It is not allowed to use with "genre" property.
 * @apiBody {Object} [sort] Sort list of authors. Allowed object properties are: _id, title, author, summary, isbn, genre. Allowed properties values are: ascending, asc, 1, descending, desc, -1.
 * @apiBody {Number} [skip] This field allows to omit first results. Minimum value 0.
 * @apiBody {Number} [limit] This field allows you to limit the number of results. Minimum value 0.
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, title, author, summary, isbn, genre. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, title, author, summary, isbn, genre. It is not allowed to use with "only" property.
 *
 * @apiSuccess {Object[]} books List of books
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *      "books": [
 *          {
 *          "_id": "631cb452ba13a425d94af3f5",
 *          "title": "The Last Wish",
 *          "author": {
 *              "_id": "63111ec1d2c560f45b865478",
 *              "firstName": "Andrzej",
 *              "lastName": "Sapkowski",
 *              "dateOfBirth": "1948-06-20T22:00:00.000Z",
 *              "__v": 0
 *          },
 *          "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *          "isbn": "978-0-575-08244-1",
 *          "genre": [
 *              {
 *              "_id": "62fd5e7e3037984b1b5effb2",
 *              "name": "Fantasy",
 *              "__v": 0
 *              }
 *          ],
 *          "__v": 0
 *          }
 *      ]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"limit\" must be greater than or equal to 0",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/', validate(validators.bookList), bookList);

/**
 * @api {GET} /books/:id Get book
 * @apiDescription Request for one specific book
 * @apiVersion 1.0.0
 * @apiName GetBook
 * @apiGroup Books
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, title, author, summary, isbn, genre. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, title, author, summary, isbn, genre. It is not allowed to use with "only" property.
 *
 * @apiParam {String{24}} id Book id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {Object} book Requested book
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "book": {
 *        "_id": "631cb452ba13a425d94af3f5",
 *        "title": "The Last Wish",
 *        "author": "63111ec1d2c560f45b865478",
 *        "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *        "isbn": "978-0-575-08244-1",
 *        "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *        ],
 *        "__v": 0
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
 *    "message": "Cannot find book with id 63111ec1d2c560f45b86547e"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/:id', validate(validators.bookDetail), getBook, bookDetail);

/**
 * @api {POST} /books Create book
 * @apiDescription Request for creating book
 * @apiVersion 1.0.0
 * @apiName CreateBook
 * @apiGroup Books
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{1.100}} title  Title of the book
 * @apiBody {String{24}} authorId  Author id. It is not allowed to use with "author" property.
 * @apiBody {Object} author  Author object must include firstName, lastName, dateOfBirth and optionally dateOfDeath. It is not allowed to use with "authorId" property.
 * @apiBody {String{1.500}} summary  Summary of the book
 * @apiBody {String{10,13}} isbn  International Standard Book Number
 * @apiBody {String{24}} [genreId]  Genre id. It is not allowed to use with "genre" property.
 * @apiBody {Object} [genre]  Genre object must include name. It is not allowed to use with "genreId" property.
 *
 * @apiSuccess {String{1.100}} title  Title of the book
 * @apiSuccess {String} author  Author id
 * @apiSuccess {String{1.500}} summary  Summary of the bookk
 * @apiSuccess {String{10,13}} isbn  International Standard Book Number
 * @apiSuccess {String[]} genre  Array of book genres id
 * @apiSuccess {String} _id Id of created book
 * @apiSuccess {Number} __v versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *  "title": "The Last Wish",
 *  "author": "63111ec1d2c560f45b865478",
 *  "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *  "isbn": "978-0-575-08244-1",
 *  "genre": [
 *      "62fd5e7e3037984b1b5effb2"
 *  ],
 *  "_id": "631cb452ba13a425d94af3f5",
 *  "__v": 0
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or book existence
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"value\" must contain at least one of [author, authorId]",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Book existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Book(s) already exist(s)"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/', validate(validators.bookCreate), getAuthorAndGenre, bookCreate);

/**
 * @api {DELETE} /books/:id Delete book
 * @apiDescription Request to delete book
 * @apiVersion 1.0.0
 * @apiName DeleteBook
 * @apiGroup Books
 *
 * @apiParam {String{24}} id Book id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {String} message Deleted book
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "message": "Deleted book",
 *    "deletedBook": {
 *        "_id": "631cb452ba13a425d94af3f5",
 *        "title": "The Last Wish",
 *        "author": "63111ec1d2c560f45b865478",
 *        "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *        "isbn": "978-0-575-08244-1",
 *        "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *        ],
 *        "__v": 0
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
 *    "message": "Cannot find book with id 63111d41a21bf378dcc80c1b"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/:id', validate(validators.bookDelete), getBook, bookDelete);

// PATCH request to update book
router.patch('/:id', tmp);

module.exports = router;
