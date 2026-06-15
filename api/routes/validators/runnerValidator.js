const Joi = require('joi');

const runnerSchema = Joi.object({
    name: Joi.string().trim().min(3).max(30).required(),
    // team should be the team's id (integer) to match DB foreign key
    team: Joi.number().integer().required()
});

module.exports = { runnerSchema };