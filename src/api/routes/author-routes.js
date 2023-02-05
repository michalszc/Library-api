const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const {
  authorList,
  authorCreate,
  authorCreateMany,
  authorDetail,
  authorDeleteMany,
  authorDelete,
  authorUpdateMany,
  authorUpdate
} = require('../controllers/author-controller');
const { getAuthor, checkExistence } = require('../middlewares/author-middleware');
const validators = require('../validations/author-validation');

/// AUTHOR ROUTES ///

// /authors - startpoint of every routes

/**
 * @api {GET} /authors List authors
 * @apiDescription Get a list of all authors
 * @apiVersion 1.0.0
 * @apiName ListAuthors
 * @apiGroup Authors
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String} [firstName] This field allows to search all authors with that first name.
 * @apiBody {String} [lastName] This field allows to search all authors with that last name.
 * @apiBody {Object} [dateOfBirth] This field allows to search all authors with that date of birth. Allowed object properties are:  e (equal), gt (grather than), gte (grather than or equal), lt (less than), lte (less than or equal). Allowed properties values are dates in format YYYY/MM/DD or MM/DD/YYYY.
 * @apiBody {Object} [dateOfDeath] This field allows to search all authors with that date of death. Allowed object properties are:  e (equal), gt (grather than), gte (grather than or equal), lt (less than), lte (less than or equal). Allowed properties values are dates in format YYYY/MM/DD or MM/DD/YYYY.
 * @apiBody {Object} [sort] Sort list of authors. Allowed object properties are:  _id, firstName, lastName, dateOfBirth, dateOfDeath. Allowed properties values are: ascending, asc, 1, descending, desc, -1.
 * @apiBody {Number} [skip] This field allows to omit first results. Minimum value 0.
 * @apiBody {Number} [limit] This field allows you to limit the number of results. Minimum value 0.
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, firstName, lastName, dateOfBirth, dateOfDeath. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, firstName, lastName, dateOfBirth, dateOfDeath. It is not allowed to use with "only" property.
 *
 * @apiSuccess {Object[]} authors List of authors
 * @apiSuccess {String} authors[_id] Id of author
 * @apiSuccess {String{3.100}} authors[firstName] First Name of author
 * @apiSuccess {String{3.100}} authors[lastName] Last Name of author
 * @apiSuccess {String} authors[dateOfBirth] Date of birth of author
 * @apiSuccess {String} [authors[dateOfDeath]] Date of death of author
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *      "authors": [
 *          {
 *              "_id": "630fae5d7425d8835c6e2d62",
 *              "firstName": "Patrick",
 *              "lastName": "Rothfuss",
 *              "dateOfBirth": "1973-06-05T23:00:00.000Z"
 *          },
 *          {
 *              "_id": "630faf3b7425d8835c6e2d63",
 *              "firstName": "Ben",
 *              "lastName": "Bova",
 *              "dateOfBirth": "1932-11-07T23:00:00.000Z"
 *          },
 *          {
 *              "_id": "630faf7b7425d8835c6e2d64",
 *              "firstName": "Isaac",
 *              "lastName": "Asimov",
 *              "dateOfBirth": "1920-01-01T22:00:00.000Z",
 *              "dateOfDeath": "1992-04-05T22:00:00.000Z"
 *          }
 *      ]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
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
router.get('/', validate(validators.authorList), authorList);

/**
 * @api {GET} /authors/:id Get author
 * @apiDescription Request for one specific author
 * @apiVersion 1.0.0
 * @apiName GetAuthor
 * @apiGroup Authors
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, firstName, lastName, dateOfBirth, dateOfDeath. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, firstName, lastName, dateOfBirth, dateOfDeath. It is not allowed to use with "only" property.
 * @apiBody {Boolean} [showBookList] This field allows you to show list of books written by that author. Default is false.
 *
 * @apiParam {String{24}} id Author id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {Object} author Requested author
 * @apiSuccess {String} author[_id] Id of author
 * @apiSuccess {String{3.100}} author[firstName] First Name of author
 * @apiSuccess {String{3.100}} author[lastName] Last Name of author
 * @apiSuccess {String} author[dateOfBirth] Date of birth of author
 * @apiSuccess {String} [author[dateOfDeath]] Date of death of author
 * @apiSuccess {Number} author[__v] versionKey
 * @apiSuccess {String[]} listOfBooks List of books with this author
 * @apiSuccess {String} listOfBooks[_id] Id of book
 * @apiSuccess {String{1.100}} listOfBooks[title]  Title of the book
 * @apiSuccess {String{1.500}} listOfBooks[summary]  Summary of the bookk
 * @apiSuccess {String{10,13}} listOfBooks[isbn]  International Standard Book Number
 * @apiSuccess {String} listOfBooks[genre] Array with genre ids
 * @apiSuccess {Number} listOfBooks[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *      "author": {
 *          "_id": "63111ec1d2c560f45b865478",
 *          "firstName": "Andrzej",
 *          "lastName": "Sapkowski",
 *          "dateOfBirth": "1948-06-20T22:00:00.000Z",
 *          "__v": 0
 *      },
 *      "listOfBooks": [{
 *        "_id": "631cb452ba13a425d94af3f5",
 *        "title": "The Last Wish",
 *        "summary": "Geralt of Rivia is a Witcher, a man whose magic powers and lifelong training have made him a brilliant fighter and a merciless assassin. Yet he is no ordinary killer: he hunts the vile fiends that ravage the land and attack the innocent. But not everything monstrous-looking is evil; not everything fair is good . . . and in every fairy tale there is a grain of truth.",
 *        "isbn": "978-0-575-08244-1",
 *        "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *        ],
 *        "__v": 0
 *      },
 *      {
 *        "_id": "63301675b39f89e97d14db2b",
 *        "title": "The Witcher: Sword of Destiny",
 *        "summary": "Geralt of Rivia is a Witcher, a man whose magic powers andifelong training have made him a brilliant fighter and a mercilessssassin. Yet he is no ordinary killer: he hunts the vile fiends thatavage the land and attack the innocent. But not everything monstroulooking is evil; not everything fair is good . . . and in every fairy talehere is a grain of truth.",
 *        "isbn": "9780316389709",
 *        "genre": [
 *          "62fd5e7e3037984b1b5effb2"
 *        ],
 *        "__v": 0
 *      }]
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
 *    "message": "Cannot find author with id 63111ec1d2c560f45b86547e"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/:id', validate(validators.authorDetail), getAuthor, authorDetail);

/**
 * @api {POST} /authors/multiple Create multiple authors
 * @apiDescription Request for creating multiple authors
 * @apiVersion 1.0.0
 * @apiName CreateManyAuthors
 * @apiGroup Authors
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {Object[]} authors Array of author objects.
 * @apiBody {String{3.100}} authors[firstName]  Author first name
 * @apiBody {String{3.100}} authors[lastName] Author last name
 * @apiBody {String} authors[dateOfBirth] Author date of birth in format YYYY/MM/DD or MM/DD/YYYY
 * @apiBody {String} [authors[dateOfDeath]] Author date of death in format YYYY/MM/DD or MM/DD/YYYY
 *
 * @apiSuccess {Object[]} authors Created authors
 * @apiSuccess {String} authors[_id] Id of created author
 * @apiSuccess {String{3.100}} authors[firstName] First Name of created author
 * @apiSuccess {String{3.100}} authors[lastName] Last Name of created author
 * @apiSuccess {String} authors[dateOfBirth] Date of birth of created author
 * @apiSuccess {String} [authors[dateOfDeath]] Date of death of created author
 * @apiSuccess {Number} authors[__v] versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *      "authors": [
 *          {
 *              "firstName": "Andrzej",
 *              "lastName": "Sapkowski",
 *              "dateOfBirth": "1948-06-20T22:00:00.000Z",
 *              "_id": "63111ec1d2c560f45b865478",
 *              "__v": 0
 *          },
 *          {
 *              "firstName": "Stephen",
 *              "lastName": "King",
 *              "dateOfBirth": "1947-09-20T22:00:00.000Z",
 *              "_id": "631a3d4ab51cf67d43309f22",
 *              "__v": 0
 *          }
 *      ]
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or author existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"authors[0].firstName\" is not allowed to be empty",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Author existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Author(s) already exist(s)"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/multiple', validate(validators.authorCreateMany), authorCreateMany);

/**
 * @api {POST} /authors Create author
 * @apiDescription Request for creating author
 * @apiVersion 1.0.0
 * @apiName CreateAuthor
 * @apiGroup Authors
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{3.100}} firstName=Andrzej  Author first name
 * @apiBody {String{3.100}} lastName=Sapkowski Author last name
 * @apiBody {String} dateOfBirth=06/21/1948 Author date of birth in format YYYY/MM/DD or MM/DD/YYYY
 * @apiBody {String} [dateOfDeath] Author date of death in format YYYY/MM/DD or MM/DD/YYYY
 *
 * @apiSuccess {String} firstName First name of created author
 * @apiSuccess {String} lastName Last name of created author
 * @apiSuccess {String} dateOfBirth Date of birth of created author
 * @apiSuccess {String} dateOfDeath Date of death of created author
 * @apiSuccess {String} _id Id of created author
 * @apiSuccess {Number} __v versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 201 Created
 *  {
 *      "firstName": "Andrzej",
 *      "lastName": "Sapkowski",
 *      "dateOfBirth": "1948-06-20T22:00:00.000Z",
 *      "_id": "63111ec1d2c560f45b865478",
 *      "__v": 0
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or author existence
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"dateOfBirth\" must be less than or equal to \"now\"",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Author existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Author(s) already exist(s)"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/', validate(validators.authorCreate), authorCreate);

/**
 * @api {DELETE} /authors/multiple Delete multiple authors
 * @apiDescription Request to delete multiple authors
 * @apiVersion 1.0.0
 * @apiName DeleteManyAuthors
 * @apiGroup Authors
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String[]} ids Authors ids
 *
 *
 * @apiSuccess {String} message Deleted authors
 * @apiSuccess {Number} deletedCount Number of deleted authors
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *     "message": "Deleted authors"
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
 *    "message": "Cannot find author(s) with id(s) 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/multiple', validate(validators.authorDeleteMany), checkExistence, authorDeleteMany);

/**
 * @api {DELETE} /authors/:id Delete author
 * @apiDescription Request to delete author
 * @apiVersion 1.0.0
 * @apiName DeleteAuthor
 * @apiGroup Authors
 *
 * @apiParam {String{24}} id Author id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {String} message Deleted author
 * @apiSuccess {Object[]} deletedAuthor Deleted author
 * @apiSuccess {String} deletedAuthor[_id] Id of deleted author
 * @apiSuccess {String{3.100}} deletedAuthor[firstName] First Name of deleted author
 * @apiSuccess {String{3.100}} deletedAuthor[lastName] Last Name of deleted author
 * @apiSuccess {String} deletedAuthor[dateOfBirth] Date of birth of deleted author
 * @apiSuccess {String} [deletedAuthor[dateOfDeath]] Date of death of deleted author
 * @apiSuccess {Number} deletedAuthor[__v] versionKey
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "message": "Deleted author",
 *    "deletedAuthor": {
 *      "_id": "63111d41a21bf378dcc80c1b",
 *      "firstName": "Andrzej",
 *      "lastName": "Sapkowski",
 *      "dateOfBirth": "1948-06-20T22:00:00.000Z",
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
 *    "message": "Cannot find author with id 63111d41a21bf378dcc80c1b"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.delete('/:id', validate(validators.authorDelete), getAuthor, authorDelete);

/**
 * @api {PATCH} /authors/multiple Update multiple authors
 * @apiDescription Request to update multiple authors
 * @apiVersion 1.0.0
 * @apiName UpdateManyAuthors
 * @apiGroup Authors
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {Object[]} authors Authors to update. One object must include id and at least one of the following field firstName, lastName, dateOfBirth, dateOfDeath.
 * @apiBody {String{24}} authors[id] Author id
 * @apiBody {String{3.100}} [authors[firstName]]  Author first name
 * @apiBody {String{3.100}} [authors[lastName]] Author last name
 * @apiBody {String} [authors[dateOfBirth]] Author date of birth in format YYYY/MM/DD or MM/DD/YYYY
 * @apiBody {String} [authors[dateOfDeath]] Author date of death in format YYYY/MM/DD or MM/DD/YYYY
 *
 * @apiSuccess {Object[]} authors Updated authors
 * @apiSuccess {String} authors[_id] Id of updated author
 * @apiSuccess {String{3.100}} [authors[firstName]] First Name of updated author
 * @apiSuccess {String{3.100}} [authors[lastName]] Last Name of updated author
 * @apiSuccess {String} [authors[dateOfBirth]] Date of birth of updated author
 * @apiSuccess {String} [authors[dateOfDeath]] Date of death of updated author
 * @apiSuccess {Number} updateCount Number of updated authors
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *    "authors": [
 *        {
 *            "firstName": "Andrzej",
 *            "lastName": "Sapkowski",
 *        },
 *        {
 *            "firstName": "Stephen",
 *            "lastName": "King",
 *            "dateOfBirth": "1947-09-20T22:00:00.000Z",
 *        }
 *    ].
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
 *    "message": "Validation Error: body: \"authors\" must contain at least 1 items",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find author(s) with id(s) 6307c2ceee1191f838834f43"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/multiple', validate(validators.authorUpdateMany), checkExistence, authorUpdateMany);

/**
 * @api {PATCH} /authors/:id Update author
 * @apiDescription Request to update author
 * @apiVersion 1.0.0
 * @apiName UpdateAuthor
 * @apiGroup Authors
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiBody {String{3.100}} [firstName]  Author first name
 * @apiBody {String{3.100}} [lastName] Author last name
 * @apiBody {String} [dateOfBirth] Author date of birth in format YYYY/MM/DD or MM/DD/YYYY
 * @apiBody {String} [dateOfDeath] Author date of death in format YYYY/MM/DD or MM/DD/YYYY
 *
 * @apiParam {String{24}} id Author id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {String} firstName First name of created author
 * @apiSuccess {String} lastName Last name of created author
 * @apiSuccess {String} dateOfBirth Date of birth of created author
 * @apiSuccess {String} dateOfDeath Date of death of created author
 * @apiSuccess {String} _id Id of created author
 * @apiSuccess {Number} __v versionKey
 *
 * @apiSuccessExample {json} Success response (example):
 *  HTTP/1.1 200 OK
 *  {
 *      "firstName": "Andrzej",
 *      "lastName": "Sapkowski",
 *      "dateOfBirth": "1948-06-20T22:00:00.000Z",
 *      "_id": "63111ec1d2c560f45b865478",
 *      "__v": 0
 *  }
 *
 * @apiError BadRequest The server cannot process the request due to validation error or incorrect dates
 * @apiError NotFound The server cannot process the request due to incorrect id
 * @apiError TooManyRequests the user has sent too many requests in one hour (> 100)
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Incorrect dates: date of death (Mon Nov 21 1960 00:00:00 GMT+0100 (czas środkowoeuropejski standardowy)) is before date of birth (Mon Feb 10 1997 00:00:00 GMT+0100 (czas środkowoeuropejski standardowy))"
 *  }
 * @apiErrorExample {json} Incorrect id error response (example):
 *  HTTP/1.1 404 Not Found
 *  {
 *    "code": 404,
 *    "message": "Cannot find author with id 63091e5e4ec3fbc5c720db4c"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.patch('/:id', validate(validators.authorUpdate), getAuthor, authorUpdate);

module.exports = router;
