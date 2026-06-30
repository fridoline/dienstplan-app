//Zeitplan

import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// Alle Dienste auflisten
// Alle Dienste auflisten – mit Namen statt IDs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        se.id,
        se.work_date,
        se.status,
        e.first_name,
        e.last_name,
        a.name AS area_name,
        s.name AS shift_name,
        s.start_time,
        s.end_time
      FROM schedule_entries se
      JOIN employees e ON e.id = se.employee_id
      JOIN areas a ON a.id = se.area_id
      JOIN shifts s ON s.id = se.shift_id
      ORDER BY se.work_date ASC, s.start_time ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Laden der Dienste' });
  }
});

// Einen neuen Dienst anlegen
router.post('/', async (req, res) => {
  const { employee_id, area_id, shift_id, work_date } = req.body;

  // 1. Prüfen, ob alle Felder da sind
  if (!employee_id || !area_id || !shift_id || !work_date) {
    return res.status(400).json({
      message: 'Bitte employee_id, area_id, shift_id und work_date angeben.',
    });
  }

  try {
    // 2. Geschäftsregel: pro Tag nur eine Schicht je Mitarbeiterin
    const existing = await pool.query(
      'SELECT id FROM schedule_entries WHERE employee_id = $1 AND work_date = $2',
      [employee_id, work_date]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: 'Diese Mitarbeiterin hat an diesem Tag bereits einen Dienst.',
      });
    }

    // 3. Dienst speichern
    const result = await pool.query(
      `INSERT INTO schedule_entries (employee_id, area_id, shift_id, work_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [employee_id, area_id, shift_id, work_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Anlegen des Dienstes' });
  }
});

export default router;
