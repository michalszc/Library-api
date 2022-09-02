const { Joi } = require('express-validation');

module.exports = {

  // GET /genres/
  genreList: {
    body: Joi.object({
      name: Joi.string().allow('').max(100),
      sort: Joi.array().ordered(Joi.string().valid('_id', 'name'), Joi.string().valid('ascending', 'descending')).length(2)
    })
  },

  // POST /genres/
  genreCreate: {
    body: Joi.object({
      name: Joi.string().min(3).max(100).required()
    })
  },

  // POST /genres/multiple/
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

  // DELETE /genres/multiple
  genreDeleteMany: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).min(1).required()
    })
  },

  // DELETE /genres/:id
  genreDelete: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  },

  // PATCH /genres/multiple
  genreUpdateMany: {
    body: Joi.object({
      genres: Joi.array().items({
        id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
        name: Joi.string().min(3).max(100).required()
      }).min(1).required()
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
