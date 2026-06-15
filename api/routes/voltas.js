const express = require('express');
const voltasRoutes = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

function isValidId(id) {
  return id !== undefined && id !== null && !isNaN(Number(id));
}

// CADASTRAR NOVA VOLTA
voltasRoutes.post('/', verificarToken, async (req, res) => {
  try {
    const { corredores_id, tempo, data } = req.body;

    if (!isValidId(corredores_id)) {
      return res.status(400).json({ error: 'corredores_id é obrigatório e deve ser numérico' });
    }

    if (tempo === undefined || tempo === null || tempo === '') {
      return res.status(400).json({ error: 'O campo tempo é obrigatório' });
    }

    const tempoNum = Number(tempo);
    if (isNaN(tempoNum)) return res.status(400).json({ error: 'tempo deve ser numérico' });

    const dataVolta = data ? new Date(data) : new Date();
    if (isNaN(dataVolta.getTime())) return res.status(400).json({ error: 'data inválida' });

    // Verifica se o corredor existe (runners table)
    const [rows] = await db.query('SELECT id FROM runners WHERE id = ?', [corredores_id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Corredor não encontrado.' });
    }

    const [result] = await db.query('INSERT INTO laps (runners_id, `time`, `date`) VALUES (?, ?, ?)', [corredores_id, tempoNum, dataVolta]);

    return res.status(201).json({
      message: 'Volta registrada com sucesso!',
      volta: {
        id: result.insertId,
        corredores_id: Number(corredores_id),
        tempo: tempoNum,
        data: dataVolta
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar volta:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// CONTAGEM POR CORREDOR
voltasRoutes.get('/contagem/:id_corredor', verificarToken, async (req, res) => {
  const { id_corredor } = req.params;
  if (!isValidId(id_corredor)) return res.status(400).json({ error: 'id_corredor deve ser numérico' });

  try {
    const [rows] = await db.query(`
      SELECT 
        r.id AS id_corredor,
        r.name AS nome,
        NULL AS turma,
        t.name AS equipe,
        COUNT(l.id) AS total_voltas
      FROM runners r
      LEFT JOIN laps l ON l.runners_id = r.id
      LEFT JOIN teams t ON r.team = t.id
      WHERE r.id = ?
      GROUP BY r.id, r.name, t.name
    `, [id_corredor]);

    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Corredor não encontrado' });

    return res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao contar voltas:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// CONTAGEM GERAL
voltasRoutes.get('/contagem', verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_voltas FROM laps');
    const total = (rows && rows[0] && rows[0].total_voltas) ? rows[0].total_voltas : 0;
    return res.json({ total_voltas: total });
  } catch (error) {
    console.error('Erro ao contar voltas:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// MELHOR VOLTA GERAL
voltasRoutes.get('/melhor-volta', verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.` + '`time`' + ` AS tempo, 
        l.date AS data, 
        r.id AS id_corredor, 
        r.name AS nome, 
        NULL AS turma,
        t.name AS equipe
      FROM laps l
      JOIN runners r ON l.runners_id = r.id
      LEFT JOIN teams t ON r.team = t.id
      ORDER BY l.` + '`time`' + ` ASC
      LIMIT 1
    `);

    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Nenhuma volta registrada' });

    const r = rows[0];
    return res.json({
      melhor_volta: r.tempo,
      data: r.data,
      corredor: {
        id: r.id_corredor,
        nome: r.nome,
        turma: r.turma,
        equipe: r.equipe
      }
    });
  } catch (error) {
    console.error('Erro melhor volta geral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// MELHOR VOLTA POR CORREDOR
voltasRoutes.get('/melhor/:id_corredor', verificarToken, async (req, res) => {
  const { id_corredor } = req.params;
  if (!isValidId(id_corredor)) return res.status(400).json({ error: 'id_corredor deve ser numérico' });

  try {
    const [rows] = await db.query(`
      SELECT 
        l.` + '`time`' + ` AS tempo, 
        l.date AS data, 
        r.id AS id_corredor, 
        r.name AS nome, 
        NULL AS turma,
        t.name AS equipe
      FROM laps l
      JOIN runners r ON l.runners_id = r.id
      LEFT JOIN teams t ON r.team = t.id
      WHERE r.id = ?
      ORDER BY l.` + '`time`' + ` ASC
      LIMIT 1
    `, [id_corredor]);

    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Nenhuma volta encontrada para este corredor' });

    const r = rows[0];
    return res.json({
      id_corredor: Number(id_corredor),
      melhor_volta: r.tempo,
      data: r.data,
      corredor: {
        nome: r.nome,
        turma: r.turma,
        equipe: r.equipe
      }
    });
  } catch (error) {
    console.error('Erro melhor volta corredor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// TOP 5 MELHORES VOLTAS
voltasRoutes.get('/top5-voltas', verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id AS id_corredor,
        r.name AS nome,
        NULL AS turma,
        t.name AS equipe,
        l.` + '`time`' + ` AS tempo,
        l.date AS data
      FROM laps l
      JOIN runners r ON l.runners_id = r.id
      LEFT JOIN teams t ON r.team = t.id
      ORDER BY l.` + '`time`' + ` ASC
      LIMIT 5
    `);

    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Nenhuma volta registrada' });

    const ranking = rows.map((row, index) => ({
      rank: index + 1,
      id_corredor: row.id_corredor,
      nome: row.nome,
      turma: row.turma,
      equipe: row.equipe,
      tempo: row.tempo,
      data: row.data
    }));

    return res.json({ ranking });
  } catch (error) {
    console.error('Erro top 5:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// RANKING GERAL
voltasRoutes.get('/ranking', verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id AS id_corredor,
        r.name AS nome,
        NULL AS turma,
        t.name AS equipe,
        l.` + '`time`' + ` AS melhor_volta,
        l.date AS data_volta
      FROM runners r
      JOIN laps l ON l.id = (
        SELECT id 
        FROM laps 
        WHERE runners_id = r.id 
        ORDER BY ` + '`time`' + ` ASC 
        LIMIT 1
      )
      LEFT JOIN teams t ON r.team = t.id
      ORDER BY l.` + '`time`' + ` ASC
    `);

    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Nenhuma volta registrada' });

    const ranking = rows.map((row, index) => ({
      rank: index + 1,
      id_corredor: row.id_corredor,
      nome: row.nome,
      turma: row.turma,
      equipe: row.equipe,
      melhor_volta: row.melhor_volta,
      data_volta: row.data_volta
    }));

    return res.json({ ranking });
  } catch (error) {
    console.error('Erro ranking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = voltasRoutes;
