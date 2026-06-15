const Joi = require('joi');

const teamSchema = Joi.object({
    name: Joi.string().trim().min(3).max(30).required(),
    country: Joi.string().trim().min(3).max(30).required()
});

module.exports = { teamSchema };