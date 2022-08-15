const express = require('express');
const bookRoutes = require('./bookRoutes');
const genreRoutes = require('./genreRoutes');

const router = express.Router();

/// ROUTES ///

router.use('/books', bookRoutes);
router.use('/genres', genreRoutes);

module.exports = router;
