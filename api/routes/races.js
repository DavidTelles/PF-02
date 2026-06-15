const express = require('express');
const cors    = require('cors');
const db      = require('../db');
const auth    = require('../middleware/auth');

const raceRouters = express.Router();
raceRouters.use(cors());

/* GET / */
raceRouters.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ra.*, tr.name AS track_name, tr.country AS track_country
      FROM races ra JOIN tracks tr ON tr.id = ra.track_id
      ORDER BY ra.race_date DESC
    `);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

/* GET /:id/times */
raceRouters.get('/:id/times', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT rt.*, r.name AS runner_name, t.name AS team_name
      FROM race_times rt
      JOIN runners r ON r.id = rt.runner_id
      LEFT JOIN teams t ON t.id = r.team
      WHERE rt.race_id = ?
      ORDER BY rt.position ASC
    `, [req.params.id]);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

/* POST /create */
raceRouters.post('/create', auth, async (req, res) => {
  const { track_id, race_date, weather } = req.body;
  if (!track_id || !race_date) return res.status(400).json({ error: 'track_id e race_date obrigatórios' });
  try {
    const [r] = await db.execute(
      'INSERT INTO races (track_id,race_date,weather) VALUES (?,?,?)',
      [track_id, race_date, weather || 'Seco']
    );
    return res.status(201).json({ message: 'Corrida criada!', id: r.insertId });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao criar corrida' });
  }
});

/* POST /times — registrar tempo */
raceRouters.post('/times', auth, async (req, res) => {
  const { race_id, runner_id, best_lap_time, avg_lap_time, total_race_time, position } = req.body;
  if (!race_id || !runner_id || !best_lap_time) {
    return res.status(400).json({ error: 'race_id, runner_id e best_lap_time obrigatórios' });
  }
  try {
    const [r] = await db.execute(`
      INSERT INTO race_times (race_id,runner_id,best_lap_time,avg_lap_time,total_race_time,position)
      VALUES (?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        best_lap_time=VALUES(best_lap_time), avg_lap_time=VALUES(avg_lap_time),
        total_race_time=VALUES(total_race_time), position=VALUES(position)
    `, [race_id, runner_id, best_lap_time, avg_lap_time||null, total_race_time||null, position||null]);
    return res.status(201).json({ message: 'Tempo registrado!', id: r.insertId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao registrar tempo' });
  }
});

/* GET /ranking/pistas — desempenho por pista */
raceRouters.get('/ranking/pistas', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        tr.id AS track_id, tr.name AS track_name, tr.country,
        r.id AS runner_id, r.name AS runner_name,
        rt.best_lap_time, ra.race_date
      FROM race_times rt
      JOIN races ra ON ra.id = rt.race_id
      JOIN tracks tr ON tr.id = ra.track_id
      JOIN runners r ON r.id = rt.runner_id
      ORDER BY tr.name, rt.best_lap_time ASC
    `);
    // group by track
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.track_id]) {
        grouped[row.track_id] = { track_id: row.track_id, track_name: row.track_name, country: row.country, times: [] };
      }
      grouped[row.track_id].times.push({
        runner_id: row.runner_id, runner_name: row.runner_name,
        best_lap_time: row.best_lap_time, race_date: row.race_date
      });
    });
    return res.json(Object.values(grouped));
  } catch (e) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = raceRouters;
