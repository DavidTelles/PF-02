const express = require('express');
const cors = require("cors");
const db = require('../db');
const { runnerSchema } = require('./validators/runnerValidator');

const runnerRouters = express.Router();
runnerRouters.use(cors());

runnerRouters.get('/', async (req, res) => {
    try {
        const [runners] = await db.query('SELECT * FROM runners');

        res.status(200).json(runners);
    } catch (error) {
        console.error('Erro ao buscar corredors: ', error);

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// POST criar corredor
runnerRouters.post('/create', async (req, res) => {
    const { name, team } = req.body;

    const { error } = runnerSchema.validate(
        req.body,
        { allowUnknown: false }
    );

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }


    db.query(
        'INSERT INTO runners (name, team) VALUES (?, ?)',
        [name, team],
        (err, results) => {
            if (err) {
                console.error("ERROR:", err);
                return res.status(500).json({ error: 'Erro ao criar corredor' });
            }
            return res.status(200).json({ message: "corredor criada com sucesso!" });
        }
    );
});

// Editar corredors
runnerRouters.put('/edit', async (req, res) => {
    const { name, team } = req.body;
    const { id } = req.query;

    db.query(
        `UPDATE runners SET name = ?, team = ? WHERE id = ?`,
        [name, team, id],
        (err, results) => {
            if (err) {
                console.error("ERROR:", err);
                return res.status(500).json({ error: 'Erro ao editar corredor' });
            }
            return res.status(200).json({ message: "corredor editada com sucesso!" });
        }
    );
});

runnerRouters.delete('/delete', async (req, res) => {
    const { id } = req.query;

    db.query(
        `DELETE FROM runners WHERE id = ?`,
        [ id ],
        (err, results) => {
            if (err) {
                console.error("ERROR:", err);
                return res.status(500).json({ error: 'Erro ao deletar corredor' });
            }
            return res.status(200).json({ message: "Corredor deletado com sucesso!" });
        }
    );
});

module.exports = runnerRouters;