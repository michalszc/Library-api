const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const { bookInstanceList } = require('../controllers/bookInstance-controller');
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
 * @apiBody {String} [publisher] This field allows to search all book instances with that publisher.
 * @apiBody {String} [status] This field allows to search all book instances with that status.
 * @apiBody {Object} [sort] Sort list of book instances. Allowed object properties are:  _id, book, publisher, status, back. Allowed properties values are: ascending, asc, 1, descending, desc, -1.
 * @apiBody {Number} [skip] This field allows to omit first results. Minimum value 0.
 * @apiBody {Number} [limit] This field allows you to limit the number of results. Minimum value 0.
 * @apiBody {String[]} [only] This field allows you to select fields of results. Allowed values: __v, _id, book, publisher, status, back. It is not allowed to use with "omit" property.
 * @apiBody {String[]} [omit] This field allows you not to show some fields in results. Allowed values: __v, _id, book, publisher, status, back. It is not allowed to use with "only" property.
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
router.get('/', validate(validators.bookInstanceList), bookInstanceList);

// POST request for creating book instance
router.post('/create', tmp);

// GET request for one book instance
router.get('/:id', tmp);

// DELETE request to delete book instance
router.delete('/:id', tmp);

// PATCH request to update book instance
router.patch('/:id', tmp);

module.exports = router;
