const express = require('express');
const userRouters = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const cors = require("cors");
const { createSchema, loginSchema } = require('./validators/userValidator')
const auth = require('../middleware/auth');
userRouters.use(cors());
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

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

userRouters.get('/perfil', auth, async (req, res) => {

    res.json({
        user: req.user
    });

});

// POST criar usuário
userRouters.post('/create', async (req, res) => {
    const { name, email, password } = req.body;

    const { error } = createSchema.validate(
        req.body,
        { allowUnknown: false }
    );

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

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
                return res.status(200).json({ message: "Usuário criado com sucesso!" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criptografar senha' });
    }
});

userRouters.post('/login', async (req, res) => {
    const { name, password } = req.body;

    const { error } = loginSchema.validate(
        req.body,
        { allowUnknown: false }
    );

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    try {
        const [rows] = await db.execute(
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

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name
            },
            JWT_SECRET,
            {
                expiresIn: '24h'
            }
        );
        
        return res.status(200).json({
            message: "Login efetuado com sucesso!",
            token,
            user: {
                id: user.id,
                name: user.name
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Erro interno no servidor"
        });
    }
});

userRouters.delete(
    '/delete',
    auth,
    async (req, res) => {
        try {

            const userId = req.user.id;

            await db.execute(
                'DELETE FROM users WHERE id = ?',
                [userId]
            );

            return res.status(200).json({
                message: 'Conta excluída com sucesso!'
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                error: 'Erro ao excluir conta'
            });

        }
    }
);

module.exports = userRouters;