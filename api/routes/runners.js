const express = require('express');
const cors    = require('cors');
const db      = require('../db');
const auth    = require('../middleware/auth');
const { runnerSchema } = require('./validators/runnerValidator');

const runnerRouters = express.Router();
runnerRouters.use(cors());

/* ── GET / ── listar todos ──────────────────────────────────────── */
runnerRouters.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, t.name AS team_name
      FROM runners r
      LEFT JOIN teams t ON r.team = t.id
      ORDER BY r.points DESC, r.name ASC
    `);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

/* ── GET /:id ── buscar um ──────────────────────────────────────── */
runnerRouters.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, t.name AS team_name
      FROM runners r
      LEFT JOIN teams t ON r.team = t.id
      WHERE r.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Corredor não encontrado' });
    return res.json(rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

/* ── POST /create ── criar ──────────────────────────────────────── */
runnerRouters.post('/create', auth, async (req, res) => {
  const { error, value } = runnerSchema.validate(req.body, { allowUnknown: false, abortEarly: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const [result] = await db.execute(`
      INSERT INTO runners
        (name, nationality, birth_date, car_number, team, photo_url,
         weight_kg, height_cm, category, wins, podiums, poles, best_lap,
         points, seasons, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      value.name, value.nationality||'', value.birth_date||null, value.car_number||null,
      value.team, value.photo_url||null, value.weight_kg||null, value.height_cm||null,
      value.category||'', value.wins||0, value.podiums||0, value.poles||0,
      value.best_lap||null, value.points||0, value.seasons||0, value.status||'Ativo'
    ]);
    return res.status(201).json({ message: 'Corredor criado com sucesso!', id: result.insertId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao criar corredor' });
  }
});

/* ── PUT /edit?id= ── editar ────────────────────────────────────── */
runnerRouters.put('/edit', auth, async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id obrigatório' });

  const { error, value } = runnerSchema.validate(req.body, { allowUnknown: false });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    await db.execute(`
      UPDATE runners SET
        name=?, nationality=?, birth_date=?, car_number=?, team=?, photo_url=?,
        weight_kg=?, height_cm=?, category=?, wins=?, podiums=?, poles=?,
        best_lap=?, points=?, seasons=?, status=?
      WHERE id=?
    `, [
      value.name, value.nationality||'', value.birth_date||null, value.car_number||null,
      value.team, value.photo_url||null, value.weight_kg||null, value.height_cm||null,
      value.category||'', value.wins||0, value.podiums||0, value.poles||0,
      value.best_lap||null, value.points||0, value.seasons||0, value.status||'Ativo', id
    ]);
    return res.json({ message: 'Corredor editado com sucesso!' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao editar corredor' });
  }
});

/* ── DELETE /delete?id= ── deletar ─────────────────────────────── */
runnerRouters.delete('/delete', auth, async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id obrigatório' });
  try {
    await db.execute('DELETE FROM runners WHERE id=?', [id]);
    return res.json({ message: 'Corredor deletado com sucesso!' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao deletar corredor' });
  }
});

/* ── GET /ranking/geral ── ranking dinâmico ─────────────────────── */
runnerRouters.get('/ranking/geral', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.id, r.name, r.nationality, r.car_number, r.photo_url,
        r.wins, r.podiums, r.poles, r.points, r.status, r.category,
        t.name AS team_name,
        AVG(CAST(SUBSTRING_INDEX(rt.best_lap_time,':',-1) AS DECIMAL(8,3))
            + CAST(SUBSTRING_INDEX(rt.best_lap_time,':',1)*60 AS DECIMAL(8,3))) AS avg_time_sec,
        MIN(CAST(SUBSTRING_INDEX(rt.best_lap_time,':',-1) AS DECIMAL(8,3))
            + CAST(SUBSTRING_INDEX(rt.best_lap_time,':',1)*60 AS DECIMAL(8,3))) AS best_time_sec,
        COUNT(rt.id) AS total_races
      FROM runners r
      LEFT JOIN teams t ON r.team = t.id
      LEFT JOIN race_times rt ON rt.runner_id = r.id
      GROUP BY r.id
      ORDER BY r.points DESC, r.wins DESC, avg_time_sec ASC
    `);
    return res.json(rows.map((row, i) => ({ ...row, rank: i + 1 })));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

/* ── GET /stats/dashboard ─── cards do dashboard ───────────────── */
runnerRouters.get('/stats/dashboard', async (req, res) => {
  try {
    const [[{ total_runners }]] = await db.query('SELECT COUNT(*) AS total_runners FROM runners');
    const [[{ total_teams }]]   = await db.query('SELECT COUNT(*) AS total_teams FROM teams');
    const [[{ total_races }]]   = await db.query('SELECT COUNT(*) AS total_races FROM races');
    const [[best]] = await db.query(`
      SELECT name, points FROM runners ORDER BY points DESC LIMIT 1
    `);
    const [[fastestTrack]] = await db.query(`
      SELECT tr.name, MIN(rt.best_lap_time) AS fastest
      FROM race_times rt
      JOIN races ra ON ra.id = rt.race_id
      JOIN tracks tr ON tr.id = ra.track_id
      GROUP BY tr.id ORDER BY fastest ASC LIMIT 1
    `);
    return res.json({
      total_runners, total_teams, total_races,
      best_pilot: best || null,
      fastest_track: fastestTrack || null
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao buscar stats' });
  }
});

module.exports = runnerRouters;
