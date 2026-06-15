const express = require('express');
const cors = require('cors');
const db = require('../db');
const auth = require("../middleware/auth")
const { teamSchema } = require('./validators/teamValidator');

const teamRouters = express.Router();
teamRouters.use(cors());

teamRouters.get('/', async (req, res) => {
    try {
        const [teams] = await db.query('SELECT * FROM teams');
        return res.status(200).json(teams);
    } catch (error) {
        console.error('Erro ao buscar equipes: ', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// POST criar equipe
teamRouters.post('/create', auth, async (req, res) => {
    const { name, country } = req.body;

    const { error } = teamSchema.validate(req.body, { allowUnknown: false });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const [result] = await db.execute('INSERT INTO teams (name, country) VALUES (?, ?)', [name, country]);
        return res.status(201).json({ message: 'Equipe criada com sucesso!', id: result.insertId });
    } catch (err) {
        console.error('ERROR:', err);
        return res.status(500).json({ error: 'Erro ao criar equipe' });
    }
});

// Editar equipes
teamRouters.put('/edit', auth, async (req, res) => {
    const { name, country } = req.body;
    const { id } = req.query;

    try {
        const [result] = await db.execute('UPDATE teams SET name = ?, country = ? WHERE id = ?', [name, country, id]);
        return res.status(200).json({ message: 'Equipe editada com sucesso!' });
    } catch (err) {
        console.error('ERROR:', err);
        return res.status(500).json({ error: 'Erro ao editar equipe' });
    }
});

teamRouters.delete('/delete', auth, async (req, res) => {
    const { id } = req.query;

    try {
        const [result] = await db.execute('DELETE FROM teams WHERE id = ?', [id]);
        return res.status(200).json({ message: 'Equipe deletado com sucesso!' });
    } catch (err) {
        console.error('ERROR:', err);
        return res.status(500).json({ error: 'Erro ao deletar equipe' });
    }
});

module.exports = teamRouters;