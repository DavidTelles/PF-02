const Joi = require('joi');

const runnerSchema = Joi.object({
  name:         Joi.string().trim().min(2).max(255).required(),
  nationality:  Joi.string().trim().max(100).allow('', null),
  birth_date:   Joi.string().isoDate().allow('', null),
  car_number:   Joi.number().integer().min(0).allow(null),
  team:         Joi.number().integer().required(),
  photo_url:    Joi.string().uri().max(500).allow('', null),
  weight_kg:    Joi.number().precision(2).allow(null),
  height_cm:    Joi.number().precision(1).allow(null),
  category:     Joi.string().trim().max(100).allow('', null),
  wins:         Joi.number().integer().min(0).default(0),
  podiums:      Joi.number().integer().min(0).default(0),
  poles:        Joi.number().integer().min(0).default(0),
  best_lap:     Joi.string().max(20).allow('', null),
  points:       Joi.number().integer().min(0).default(0),
  seasons:      Joi.number().integer().min(0).default(0),
  status:       Joi.string().valid('Ativo', 'Inativo').default('Ativo'),
});

module.exports = { runnerSchema };
