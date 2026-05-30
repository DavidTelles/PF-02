const express = require('express');
const userRouters = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const cors = require("cors");
const connection = require('../db');
userRouters.use(cors());

userRouters.get('/', async (req, res) => {
    try {
        // Executa a query no banco de dados usando await
        // O mysql2 retorna um array onde a primeira posição [rows] contém os dados
        const [users] = await db.query('SELECT id, name, email FROM users');

        // Retorna a lista de usuários com status 200 (OK)
        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);

        // Retorna erro caso algo dê errado no banco de dados
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
        const query = `
            SELECT id, name
            FROM users
            WHERE name = ?
            AND password = SHA2(?, 256)
        `;

        const [rows] = await connection.execute(query, [name, password]);

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Usuário ou senha não encontrados!"
            });
        }

        const usuarioLogado = rows[0];

        return res.status(200).json({
            message: "Login efetuado com sucesso!",
            userId: usuarioLogado.id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro interno no servidor"
        });
    }
});

module.exports = userRouters;