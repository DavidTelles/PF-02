const express = require('express');
const userRouters = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const cors = require("cors");
const connection = require('../db');
userRouters.use(cors());

userRouters.get('/', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');

        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);

        res.status(500).json({
            error: 'Erro interno do servidor ao buscar usuários.'
        });
    }
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

userRouters.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const [rows] = await connection.execute(
            'SELECT id, name, password FROM users WHERE name = ?',
            [name]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Usuário ou senha inválidos!"
            });
        }

        const user = rows[0];

        const senhaValida = await bcrypt.compare(
            password,
            user.password
        );

        if (!senhaValida) {
            return res.status(401).json({
                message: "Usuário ou senha inválidos!"
            });
        }

        return res.status(200).json({
            message: "Login efetuado com sucesso!",
            userId: user.id
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Erro interno no servidor"
        });
    }
});

module.exports = userRouters;