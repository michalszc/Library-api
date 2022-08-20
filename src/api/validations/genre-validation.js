const { Joi } = require('express-validation');

module.exports = {

  // POST /genres/create
  genreCreate: {
    body: Joi.object({
      name: Joi.string().min(3).max(100).required()
    })
  },

  // GET /genres/:id
  genreDetail: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  },

  // DELETE /genres/:id
  genreDelete: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  },

  // PATCH /genres/:id
  genreUpdate: {
    body: Joi.object({
      name: Joi.string().min(3).max(100).required()
    }),
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  }
};
