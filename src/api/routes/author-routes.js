const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const { authorList, authorCreate, authorDetail } = require('../controllers/author-controller');
const { getAuthor } = require('../middlewares/author-middleware');
const validators = require('../validations/author-validation');
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

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
 * @apiBody {String} firstName This field allows to search all authors with that first name.
 * @apiBody {String} lastName This field allows to search all authors with that last name.
 * @apiBody {Object} dateOfBirth This field allows to search all authors with that date of birth. Allowed object properties are:  e (equal), gt (grather than), gte (grather than or equal), lt (less than), lte (less than or equal). Allowed properties values are dates in format YYYY/MM/DD or MM/DD/YYYY.
 * @apiBody {Object} dateOfDeath This field allows to search all authors with that date of death. Allowed object properties are:  e (equal), gt (grather than), gte (grather than or equal), lt (less than), lte (less than or equal). Allowed properties values are dates in format YYYY/MM/DD or MM/DD/YYYY.
 * @apiBody {Object} sort Sort list of authors. Allowed object keys are:  _id, firstName, lastName, dateOfBirth, dateOfDeath. Allowed object values are: ascending, asc, 1, descending, desc, -1.
 * @apiBody {Number} skip This field allows to omit first results. Minimum value 0.
 * @apiBody {Number} limit This field allows you to limit the number of results. Minimum value 0.
 *
 * @apiSuccess {Object[]} authors List of authors
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
 * @apiBody {String} dateOfDeath Author date of death in format YYYY/MM/DD or MM/DD/YYYY
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
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Validation error response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Validation Error: body: \"dateOfBirth\" must be less than or equal to \"now\"",
 *    "errors": "Bad Request"
 *  }
 * @apiErrorExample {json} Genre existence response (example):
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "code": 400,
 *    "message": "Author already exists"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.post('/', validate(validators.authorCreate), authorCreate);

/**
 * @api {GET} /authors/:id Get author
 * @apiDescription Request for one specific author
 * @apiVersion 1.0.0
 * @apiName GetAuthor
 * @apiGroup Authors
 *
 * @apiParam {String{24}} id Author id
 * @apiParamExample {json} Request-Example:
 *  {
 *    "id": "62fd5e7e3037984b1b5effb2"
 *  }
 *
 * @apiSuccess {Object} author Requested author
 * @apiSuccess {String[]} listOfBooks List of books with this author
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
 *      "listOfBooks": null
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
 *    "message": "Cannot find author with id 63111ec1d2c560f45b86547e"
 *  }
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/:id', validate(validators.authorDetail), getAuthor, authorDetail);

// DELETE request to delete author
router.delete('/:id', tmp);

// PATCH request to update author
router.patch('/:id', tmp);

module.exports = router;
