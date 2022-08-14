const express = require('express');
const bookRoutes = require('./bookRoutes');

const router = express.Router();

/// ROUTES ///

router.use('/books', bookRoutes);


module.exports = router;
