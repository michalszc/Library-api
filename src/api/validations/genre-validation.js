const { Joi } = require('express-validation');

module.exports = {

  // POST /genres/create
  genreCreate: {
    body: Joi.object({
      name: Joi.string().min(3).max(100).required()
    })
  },

  // POST /genres/multiple/create
  genreCreateMany: {
    body: Joi.object({
      names: Joi.array().items(Joi.string().min(3).max(100)).min(1).required()
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

  // DELETE /genres/multiple
  genreDeleteMany: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).min(1).required()
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
