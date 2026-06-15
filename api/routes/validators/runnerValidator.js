const Joi = require('joi');

const runnerSchema = Joi.object({
    name: Joi.string().trim().min(3).max(30).required(),
    team: Joi.string().trim().min(3).max(30).required()
});

module.exports = runnerSchema;