const express = require('express');
const cors    = require('cors');
const db      = require('../db');
const auth    = require('../middleware/auth');

const trackRouters = express.Router();
trackRouters.use(cors());

/* GET / */
trackRouters.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tracks ORDER BY name');
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

/* GET /:id */
trackRouters.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tracks WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Pista não encontrada' });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

/* POST /create */
trackRouters.post('/create', auth, async (req, res) => {
  const { name, country, laps } = req.body;
  if (!name || !country) return res.status(400).json({ error: 'name e country obrigatórios' });
  try {
    const [r] = await db.execute('INSERT INTO tracks (name,country,laps) VALUES (?,?,?)',
      [name, country, laps || 0]);
    return res.status(201).json({ message: 'Pista criada!', id: r.insertId });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao criar pista' });
  }
});

/* PUT /edit?id= */
trackRouters.put('/edit', auth, async (req, res) => {
  const { id } = req.query;
  const { name, country, laps } = req.body;
  if (!id) return res.status(400).json({ error: 'id obrigatório' });
  try {
    await db.execute('UPDATE tracks SET name=?,country=?,laps=? WHERE id=?', [name, country, laps||0, id]);
    return res.json({ message: 'Pista editada!' });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao editar pista' });
  }
});

/* DELETE /delete?id= */
trackRouters.delete('/delete', auth, async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id obrigatório' });
  try {
    await db.execute('DELETE FROM tracks WHERE id=?', [id]);
    return res.json({ message: 'Pista deletada!' });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao deletar pista' });
  }
});

module.exports = trackRouters;
