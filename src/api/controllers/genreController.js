const Genre = require('../models/genreModel');

// Display list of all Genre.
exports.genreList = function (req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (error, result) {
      if (error) { return next(error); }
      res.json({ title: 'Genre List', genres: result.map(({ name }) => name) });
    });
};

// Display details for a specific Genre.
exports.genreDetail = function (req, res, next) {
  Genre.findById(req.params.id)
    .exec(function (error, { name }) {
      if (error) { return next(error); }
      res.json({ title: 'Genre', genre: name, listOfBooks: null }); // ADD LIST OF BOOKS WITH THIS GENRE
    });
};
