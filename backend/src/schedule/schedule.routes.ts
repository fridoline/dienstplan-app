//Zeitplan

import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// Alle Dienste auflisten
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM schedule_entries ORDER BY work_date ASC, id ASC'
    );
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
