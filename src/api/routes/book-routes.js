const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const {
  bookList,
  bookDetail,
  bookCreateMany,
  bookCreate,
  bookDeleteMany,
  bookDelete,
  bookUpdateMany,
  bookUpdate
} = require('../controllers/book-controller');
const {
  getAuthorAndGenre,
  getAuthorAndGenreMultiple,
  getBook,
  checkExistence
} = require('../middlewares/book-middleware');
const validators = require('../validations/book-validation');

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
 * @apiBody {String} [genreId] This field allows to search all books with that genre Id. It is allowed ti pass Genre id or array of Genre id. It is not allowed to use with "genre" property.
 * @apiBody {Object} [genre] This field allows to search all books with that genre. It is allowed to pass Genre object or array of Genre objects. Object must include name property. It is not allowed to use with "genre" property.
 * @apiBody {Object} [sort] Sort list of authors. Allowed object properties are: _id, title, author, summary, isbn, genre. Allowed properties values are: ascending, asc, 1, descending, desc, -1.
 * @apiBody {Number} [skip] This field allows to omit first results. Minimum value 0.
 * @apiBody {Number} [limit] This field allows you to limit the number of results. Minimum value 0.
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, title, author, summary, isbn, genre. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, title, author, summary, isbn, genre. It is not allowed to use with "only" property.
 * @apiBody {Boolean} [showAuthor] This field allows you to show the author's object. If this field is not passed or value is false, it only shows the author ID.
 * @apiBody {Boolean} [showGenre] This field allows you to show the genre object. If this field is not passed or the value is false, it only shows the genre ID.
 *
 * @apiSuccess {Object[]} books List of books
 * @apiSuccess {String{1.100}} books[title]  Title of the book
 * @apiSuccess {String|Object} books[author]  Author object or id
 * @apiSuccess {String{1.500}} books[summary]  Summary of the book
 * @apiSuccess {String{10,13}} books[isbn]  International Standard Book Number
 * @apiSuccess {String[]|Object[]} books[genre]  Array of genres id or genres objects
 * @apiSuccess {String} books[_id] Id of book
 * @apiSuccess {Number} books[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *      "books": [
 *          {
 *          "_id": "631cb452ba13a425d94af3f5",
 *          "title": "The Witcher: The Last Wish",
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
 * @apiError Too Many Requests the user has sent too many requests in one hour (> 100)
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
 * @apiBody {Boolean} [showAuthor] This field allows you to show the author's object. If this field is not passed or value is false, it only shows the author ID.
 * @apiBody {Boolean} [showGenre] This field allows you to show the genre object. If this field is not passed or the value is false, it only shows the genre ID.
 *
 * @apiParam {String{24}} id Book id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {Object} book Requested book
 * @apiSuccess {String{1.100}} book[title]  Title of the book
 * @apiSuccess {String|Object} book[author]  Author object or id
 * @apiSuccess {String{1.500}} book[summary]  Summary of the book
 * @apiSuccess {String{10,13}} book[isbn]  International Standard Book Number
 * @apiSuccess {String[]|Object[]} book[genre]  Array of genres id or genres objects
 * @apiSuccess {String} book[_id] Id of book
 * @apiSuccess {Number} book[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "book": {
 *        "_id": "631cb452ba13a425d94af3f5",
 *        "title": "The Witcher: The Last Wish",
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
 *    "message": "Cannot find book with id 63111ec1d2c560f45b86547e"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/:id', validate(validators.bookDetail), getBook, bookDetail);

/**
 * @api {POST} /books/multiple Create multiple books
 * @apiDescription Request for creating multiple books
 * @apiVersion 1.0.0
 * @apiName CreateManyBooks
 * @apiGroup Books
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {Object[]} books Array of book objects.
 * @apiBody {String{1.100}} books[title]  Title of the book
 * @apiBody {String{24}} books[authorId]  Author id. It is not allowed to use with "author" property.
 * @apiBody {Object} books[author]  Author object must include firstName, lastName, dateOfBirth and optionally dateOfDeath. It is not allowed to use with "authorId" property.
 * @apiBody {String{1.500}} books[summary]  Summary of the book
 * @apiBody {String{10,13}} books[isbn]  International Standard Book Number
 * @apiBody {String{24}} [books[genreId]]  Genre id or array of Genre id. It is not allowed to use with "genre" property.
 * @apiBody {Object} [books[genre]]  Genre object or array of Genre objects. Object must include name property. It is not allowed to use with "genreId" property.
 *
 * @apiSuccess {Object[]} books Created books
 * @apiSuccess {String{1.100}} books[title]  Title of the book
 * @apiSuccess {String|Object} books[author]  Author object or id
 * @apiSuccess {String{1.500}} books[summary]  Summary of the book
 * @apiSuccess {String{10,13}} books[isbn]  International Standard Book Number
 * @apiSuccess {String[]|Object[]} [books[genre]]  Array of genres id or genres objects
 * @apiSuccess {String} books[_id] Id of created book
 * @apiSuccess {Number} books[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *    "books": [{
 *        "_id": "631cb452ba13a425d94af3f5",
 *        "title": "The Witcher: The Last Wish",
 *        "author": "63111ec1d2c560f45b865478",
 *        "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *        "isbn": "978-0-575-08244-1",
 *        "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *        ],
 *        "__v": 0
 *      },
 *      {
 *        "_id": "631f83bf80077376df36bd7c",
 *        "title": "The Witcher: Sword of Destiny",
 *        "author": "63111ec1d2c560f45b865478",
 *        "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *        "isbn": "978-0-316-38970-9",
 *        "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *        ],
 *        "__v": 0
 *      }
 *    ]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or book existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"books[0].title\" is not allowed to be empty",
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
router.post('/multiple', validate(validators.bookCreateMany), getAuthorAndGenreMultiple, bookCreateMany);

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
 * @apiBody {String{24}} [genreId]  Genre id or array of Genre id. It is not allowed to use with "genre" property.
 * @apiBody {Object} [genre]  Genre object or array of Genre objects. Object must include name property. It is not allowed to use with "genreId" property.
 *
 * @apiSuccess {String{1.100}} title  Title of the book
 * @apiSuccess {String} author  Author id
 * @apiSuccess {String{1.500}} summary  Summary of the bookk
 * @apiSuccess {String{10,13}} isbn  International Standard Book Number
 * @apiSuccess {String[]} genre  Array of book genres id
 * @apiSuccess {String} _id Id of created book
 * @apiSuccess {Number} __v versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *     "book": {
 *      "title": "The Witcher: The Last Wish",
 *      "author": "63111ec1d2c560f45b865478",
 *      "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *      "isbn": "978-0-575-08244-1",
 *      "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *      ],
 *      "_id": "631cb452ba13a425d94af3f5",
 *      "__v": 0
 *    }
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or book existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
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
 * @api {DELETE} /books/multiple Delete multiple books
 * @apiDescription Request to delete multiple books
 * @apiVersion 1.0.0
 * @apiName DeleteManyBooks
 * @apiGroup Books
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} ids Books ids
 *
 *
 * @apiSuccess {String} message Deleted books
 * @apiSuccess {Number} deletedCount Number of deleted books
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *     "message": "Deleted books"
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
 *    "message": "Cannot find book(s) with id(s) 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/multiple', validate(validators.bookDeleteMany), checkExistence, bookDeleteMany);

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
 * @apiSuccess {Object} deletedBook Object of deleted book
 * @apiSuccess {String{1.100}} deletedBook[title]  Title of the book
 * @apiSuccess {String} deletedBook[author]  Author id
 * @apiSuccess {String{1.500}} deletedBook[summary]  Summary of the bookk
 * @apiSuccess {String{10,13}} deletedBook[isbn]  International Standard Book Number
 * @apiSuccess {String[]} [deletedBook[genre]]  Array of book genres id
 * @apiSuccess {String} deletedBook[_id] Id of the book
 * @apiSuccess {Number} deletedBook[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "message": "Deleted book",
 *    "book": {
 *        "_id": "631cb452ba13a425d94af3f5",
 *        "title": "The Witcher: The Last Wish",
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
 *    "message": "Cannot find book with id 63111d41a21bf378dcc80c1b"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/:id', validate(validators.bookDelete), getBook, bookDelete);

/**
 * @api {PATCH} /books/multiple Update multiple books
 * @apiDescription Request to update multiple books
 * @apiVersion 1.0.0
 * @apiName UpdateManyBooks
 * @apiGroup Books
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {Object[]} books Books to update. One object must include id and at least one of the following fields title, author (or authorId), summary, isbn and optionally genre (or genreId).
 * @apiBody {String{1.100}} [books[title]]  Title of the book
 * @apiBody {String{24}} [books[authorId]]  Author id. It is not allowed to use with "author" property.
 * @apiBody {Object} [books[author]]  Author object must include firstName, lastName, dateOfBirth and optionally dateOfDeath. It is not allowed to use with "authorId" property.
 * @apiBody {String{1.500}} [books[summary]]  Summary of the book
 * @apiBody {String{10,13}} [books[isbn]]  International Standard Book Number
 * @apiBody {String{24}} [books[genreId]]  Genre id or array of Genre id. It is not allowed to use with "genre" property.
 * @apiBody {Object} [books[genre]]  Genre object or array of Genre objects. Object must include name property. It is not allowed to use with "genreId" property.
 *
 * @apiSuccess {Object[]} books Updated books
 * @apiSuccess {String{1.100}} [books[title]]  Title of the book
 * @apiSuccess {String} [books[author]]  Author id
 * @apiSuccess {String{1.500}} [books[summary]]  Summary of the bookk
 * @apiSuccess {String{10,13}} [books[isbn]]  International Standard Book Number
 * @apiSuccess {String[]} [books[genre]]  Array of book genres id
 * @apiSuccess {String} books[id] Id of the book
 * @apiSuccess {Number} updateCount Number of updated books
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "books": [{
 *        "id": "631cb452ba13a425d94af3f5",
 *        "title": "The Witcher: The Last Wish"
 *      },
 *      {
 *        "id": "631f83bf80077376df36bd7c",
 *        "title": "The Witcher: Sword of Destiny"
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
 *    "message": "Validation Error: body: \"books\" must contain at least 1 items",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find book(s) with id(s) 6307c2ceee1191f838834f43"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/multiple', validate(validators.bookUpdateMany), checkExistence, bookUpdateMany);

/**
 * @api {PATCH} /books/:id Update book
 * @apiDescription Request to update book
 * @apiVersion 1.0.0
 * @apiName UpdateBook
 * @apiGroup Books
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{1.100}} [title]  Title of the book
 * @apiBody {String{24}} [authorId]  Author id. It is not allowed to use with "author" property.
 * @apiBody {Object} [author]  Author object must include firstName, lastName, dateOfBirth and optionally dateOfDeath. It is not allowed to use with "authorId" property.
 * @apiBody {String{1.500}} [summary]  Summary of the book
 * @apiBody {String{10,13}} [isbn]  International Standard Book Number
 * @apiBody {String{24}} [genreId]  Genre id or array of Genre id. It is not allowed to use with "genre" property.
 * @apiBody {Object} [genre]  Genre object or array of Genre objects. Object must include name property. It is not allowed to use with "genreId" property.
 *
 * @apiParam {String{24}} id Book id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {String{1.100}} title  Title of the book
 * @apiSuccess {String} author  Author id
 * @apiSuccess {String{1.500}} summary  Summary of the bookk
 * @apiSuccess {String{10,13}} isbn  International Standard Book Number
 * @apiSuccess {String[]} genre  Array of book genres id
 * @apiSuccess {String} _id Id of the book
 * @apiSuccess {Number} __v versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "book": {
 *      "title": "The Witcher: The Last Wish",
 *      "author": "63111ec1d2c560f45b865478",
 *      "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *      "isbn": "978-0-575-08244-1",
 *      "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *      ],
 *      "_id": "631cb452ba13a425d94af3f5",
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
 *    "message": "Cannot find book with id 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/:id', validate(validators.bookUpdate), getAuthorAndGenre, getBook, bookUpdate);

module.exports = router;
