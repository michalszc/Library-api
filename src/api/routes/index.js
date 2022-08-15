const express = require('express');
const authorRoutes = require('./authorRoutes');
const bookRoutes = require('./bookRoutes');
const genreRoutes = require('./genreRoutes');

const router = express.Router();

/// ROUTES ///

router.use('/authors', authorRoutes);
router.use('/books', bookRoutes);
router.use('/genres', genreRoutes);

module.exports = router;
