const express = require('express');
const cors = require("cors");
const db = require('../db');
const { teamSchema } = require('./validators/teamValidator');

const teamRouters = express.Router();
teamRouters.use(cors());

teamRouters.get('/', async (req, res) => {
    try {
        const [teams] = await db.query('SELECT * FROM teams');

        res.status(200).json(teams);
    } catch (error) {
        console.error('Erro ao buscar equipes: ', error);

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// POST criar equipe
teamRouters.post('/create', async (req, res) => {
    const { name, country } = req.body;

    const { error } = teamSchema.validate(
        req.body,
        { allowUnknown: false }
    );

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }


    db.query(
        'INSERT INTO teams (name, country) VALUES (?, ?)',
        [name, country],
        (err, results) => {
            if (err) {
                console.error("ERROR:", err);
                return res.status(500).json({ error: 'Erro ao criar equipe' });
            }
            return res.status(200).json({ message: "Equipe criada com sucesso!" });
        }
    );
});

// Editar equipes
teamRouters.put('/edit', async (req, res) => {
    const { name, country } = req.body;
    const { id } = req.query;

    db.query(
        `UPDATE teams SET name = ?, country = ? WHERE id = ?`,
        [name, country, id],
        (err, results) => {
            if (err) {
                console.error("ERROR:", err);
                return res.status(500).json({ error: 'Erro ao editar equipe' });
            }
            return res.status(200).json({ message: "Equipe editada com sucesso!" });
        }
    );
});

teamRouters.delete('/delete', async (req, res) => {
    const { id } = req.query;

    db.query(
        `DELETE FROM teams WHERE id = ?`,
        [ id ],
        (err, results) => {
            if (err) {
                console.error("ERROR:", err);
                return res.status(500).json({ error: 'Erro ao deletar equipe' });
            }
            return res.status(200).json({ message: "Equipe deletado com sucesso!" });
        }
    );
});

module.exports = teamRouters;