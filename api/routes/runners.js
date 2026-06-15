const express = require('express');
const cors = require('cors');
const db = require('../db');
const { runnerSchema } = require('./validators/runnerValidator');

const runnerRouters = express.Router();
runnerRouters.use(cors());

runnerRouters.get('/', async (req, res) => {
    try {
        const [runners] = await db.query('SELECT * FROM runners');
        return res.status(200).json(runners);
    } catch (error) {
        console.error('Erro ao buscar corredores: ', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// POST criar corredor
runnerRouters.post('/create', async (req, res) => {
    const { name, team } = req.body;

    const { error } = runnerSchema.validate(req.body, { allowUnknown: false });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const [result] = await db.execute('INSERT INTO runners (name, team) VALUES (?, ?)', [name, team]);
        return res.status(201).json({ message: 'Corredor criado com sucesso!', id: result.insertId });
    } catch (err) {
        console.error('ERROR:', err);
        return res.status(500).json({ error: 'Erro ao criar corredor' });
    }
});

// Editar corredores
runnerRouters.put('/edit', async (req, res) => {
    const { name, team } = req.body;
    const { id } = req.query;

    try {
        const [result] = await db.execute('UPDATE runners SET name = ?, team = ? WHERE id = ?', [name, team, id]);
        return res.status(200).json({ message: 'Corredor editado com sucesso!' });
    } catch (err) {
        console.error('ERROR:', err);
        return res.status(500).json({ error: 'Erro ao editar corredor' });
    }
});

runnerRouters.delete('/delete', async (req, res) => {
    const { id } = req.query;

    try {
        const [result] = await db.execute('DELETE FROM runners WHERE id = ?', [id]);
        return res.status(200).json({ message: 'Corredor deletado com sucesso!' });
    } catch (err) {
        console.error('ERROR:', err);
        return res.status(500).json({ error: 'Erro ao deletar corredor' });
    }
});

module.exports = runnerRouters;