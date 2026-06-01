const Joi = require('joi');

const createSchema = Joi.object({
    name: Joi.string().trim().min(3).max(30).required(),
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required()
});

module.exports = {
    createSchema,
    loginSchema
};