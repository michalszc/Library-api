const express = require('express');
const router = express.Router();
const tmp = (req, res) => res.send('NOT IMPLEMENTED YET');

/// BOOKINSTANCE ROUTES ///

// /bookinstances - startpoint of every routes

// GET request for list of all book instances
router.get('/', tmp);

// POST request for creating book instance
router.post('/create', tmp);

// GET request for one book instance
router.get('/:id', tmp);

// DELETE request to delete book instance
router.delete('/:id/delete', tmp);

// PUT request to update book instance
router.put('/:id/update', tmp);

module.exports = router;
