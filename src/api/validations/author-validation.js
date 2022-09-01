const { Joi } = require('express-validation');

module.exports = {

  // POST /authors/
  authorCreate: {
    body: Joi.object({
      firstName: Joi.string().min(3).max(100).required(),
      lastName: Joi.string().min(3).max(100).required(),
      dateOfBirth: Joi.date().max('now').required(),
      dateOfDeath: Joi.date().greater(Joi.ref('dateOfBirth')).max('now')
    })
  }

};
