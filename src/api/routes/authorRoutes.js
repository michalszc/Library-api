const express = require('express');
const router = express.Router();
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

/// AUTHOR ROUTES ///

// /authors - startpoint of every routes

// GET request for list of all authors
router.get('/', tmp);

// POST request for creating author
router.post('/create', tmp);

// GET request for one author
router.get('/:id', tmp);

// DELETE request to delete author
router.delete('/:id', tmp);

// PATCH request to update author
router.patch('/:id', tmp);

module.exports = router;
