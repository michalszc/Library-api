const express = require('express');
const router = express.Router();
const { authorList } = require('../controllers/author-controller');
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

// POST request for creating author
router.post('/', tmp);

// GET request for one author
router.get('/:id', tmp);

// DELETE request to delete author
router.delete('/:id', tmp);

// PATCH request to update author
router.patch('/:id', tmp);

module.exports = router;
