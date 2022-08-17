const Genre = require('../models/genreModel');

exports.getGenre = async function (req, res, next) {
  let genre;
  try {
    genre = await Genre.findById(req.params.id);
    console.log(req.params, genre);
    if (!genre) {
      return res.status(404).json({ message: 'Cannot find genre' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.genre = genre;
  next();
};
