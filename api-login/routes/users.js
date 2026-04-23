const express = require('express');
const userRouters = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// GET usuários
userRouters.get('/get', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
        res.json(results);
    });
});

// POST criar usuário
userRouters.post('/create', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // hash da senha
        const senhaHash = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, senhaHash],
            (err, results) => {
                if (err) {
                    console.error("ERROR:", err);
                    return res.status(500).json({ error: 'Erro ao criar usuário' });
                }

                res.json({ message: 'Usuário criado com sucesso!' });
            }
        );

    } catch (error) {
        res.status(500).json({ error: 'Erro ao criptografar senha' });
    }
});

module.exports = userRouters;