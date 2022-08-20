const express = require('express');
const authorRoutes = require('./author-routes');
const bookRoutes = require('./book-routes');
const bookinstanceRoutes = require('./bookInstance-routes');
const genreRoutes = require('./genre-routes');

const router = express.Router();

/// ROUTES ///

router.use('/authors', authorRoutes);
router.use('/books', bookRoutes);
router.use('/bookinstances', bookinstanceRoutes);
router.use('/genres', genreRoutes);

module.exports = router;
