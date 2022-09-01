const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const { authorList, authorCreate } = require('../controllers/author-controller');
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
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Internal Server Error response (example):
 *  HTTP/1.1 500 Internal Server Error
 */
router.get('/', authorList);

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
 * @apiBody {String} dateOfBirth=06/21/1948 Author date of birth in format MM/DD/YYYY
 * @apiBody {String} dateOfDeath Author date of death in format MM/DD/YYYY
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

// GET request for one author
router.get('/:id', tmp);

// DELETE request to delete author
router.delete('/:id', tmp);

// PATCH request to update author
router.patch('/:id', tmp);

module.exports = router;
