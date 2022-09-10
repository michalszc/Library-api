const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const { bookCreate } = require('../controllers/book-controller');
const { getAuthorAndGenre } = require('../middlewares/book-middleware');
const validators = require('../validations/book-validation');
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

/// BOOK ROUTES ///

// /books - startpoint of every routes

// GET request for list of all books
router.get('/', tmp);

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

// GET request for one book
router.get('/:id', tmp);

// DELETE request to delete book
router.delete('/:id', tmp);

// PATCH request to update book
router.patch('/:id', tmp);

module.exports = router;
