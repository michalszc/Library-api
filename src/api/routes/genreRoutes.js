const express = require('express');
const router = express.Router();
const { genreList, genreDetail, genreCreate, genreDelete } = require('../controllers/genreController');
const { getGenre } = require('../middlewares/genreMiddleware');
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

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
router.patch('/:id', tmp);

module.exports = router;
