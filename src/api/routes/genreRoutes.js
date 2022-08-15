const express = require('express');
const router = express.Router();
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

/// GENRE ROUTES ///

// /genres - startpoint of every routes

// GET request for list of all genres
router.get('/', tmp);

// POST request for creating a genre
router.post('/create', tmp);

// GET request for one genre
router.get('/:id', tmp);

// DELETE request to delete genre
router.delete('/:id/delete', tmp);

// PUT request to update genre
router.put('/:id/update', tmp);

module.exports = router;
