const express = require('express');
const router = express.Router();
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

/// BOOK ROUTES ///

// /books - startpoint of every routes

// GET request for list of all books
router.get('/', tmp);

// POST request for creating book
router.post('/create', tmp);

// GET request for one book
router.get('/:id', tmp);

// DELETE request to delete book
router.delete('/:id', tmp);

// PATCH request to update book
router.patch('/:id', tmp);

module.exports = router;
