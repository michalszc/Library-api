const express = require('express');
const { validate } = require('express-validation');
const router = express.Router();
const { genreList, genreDetail, genreCreate, genreDelete, genreUpdate } = require('../controllers/genreController');
const { getGenre } = require('../middlewares/genreMiddleware');
const validators = require('../validations/genreValidation');

/// GENRE ROUTES ///

// /genres - startpoint of every routes

// GET request for list of all genres
router.get('/', genreList);

// POST request for creating a genre
router.post('/create', validate(validators.genreCreate), genreCreate);

// Use middlewares
router.route('/:id')
  .get(validate(validators.genreDetail), getGenre)
  .delete(validate(validators.genreDelete), getGenre)
  .patch(validate(validators.genreUpdate), getGenre);

// GET request for one genre
router.get('/:id', genreDetail);

// DELETE request to delete genre
router.delete('/:id', genreDelete);

// PATCH request to update genre
router.patch('/:id', genreUpdate);

module.exports = router;
