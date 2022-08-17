const express = require('express');
const router = express.Router();
const { genreList, genreDetail, genreCreate, genreDelete, genreUpdate } = require('../controllers/genreController');
const { getGenre } = require('../middlewares/genreMiddleware');

/// GENRE ROUTES ///

// /genres - startpoint of every routes

// GET request for list of all genres
router.get('/', genreList);

// POST request for creating a genre
router.post('/create', genreCreate);

// Use middleware
router.use('/:id', getGenre);

// GET request for one genre
router.get('/:id', genreDetail);

// DELETE request to delete genre
router.delete('/:id', genreDelete);

// PATCH request to update genre
router.patch('/:id', genreUpdate);

module.exports = router;
