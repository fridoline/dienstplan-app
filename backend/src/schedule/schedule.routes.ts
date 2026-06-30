//Zeitplan

import { Router } from 'express';
import { pool } from '../db';
import { requireAuth, requireAdmin } from '../auth/auth.middleware';

const router = Router();

// Alle Dienste auflisten
// Alle Dienste auflisten – mit Namen statt IDs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        se.id,
        to_char(se.work_date, 'YYYY-MM-DD') AS work_date,
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
router.post('/', requireAuth, requireAdmin, async (req, res) => {
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

// Einen Dienst ändern (Schicht und/oder Wohnbereich) – mit Protokoll
router.patch('/:id', requireAuth, requireAdmin, async (req: any, res) => {
  const { id } = req.params;
  const { area_id, shift_id } = req.body;

  if (!area_id && !shift_id) {
    return res.status(400).json({
      message: 'Bitte mindestens area_id oder shift_id angeben.',
    });
  }

  try {
    // 1. Alten Zustand lesen (für das Protokoll)
    const before = await pool.query(
      'SELECT area_id, shift_id FROM schedule_entries WHERE id = $1',
      [id]
    );

    if (before.rows.length === 0) {
      return res.status(404).json({ message: 'Dienst nicht gefunden.' });
    }

    const alt = before.rows[0];

    // 2. Änderung durchführen
    const result = await pool.query(
      `UPDATE schedule_entries
       SET area_id  = COALESCE($1, area_id),
           shift_id = COALESCE($2, shift_id)
       WHERE id = $3
       RETURNING *`,
      [area_id ?? null, shift_id ?? null, id]
    );

    const neu = result.rows[0];

    // 3. Änderung protokollieren
    const oldValue = `area_id=${alt.area_id}, shift_id=${alt.shift_id}`;
    const newValue = `area_id=${neu.area_id}, shift_id=${neu.shift_id}`;

    await pool.query(
      `INSERT INTO change_logs (schedule_entry_id, changed_by_employee_id, old_value, new_value)
       VALUES ($1, $2, $3, $4)`,
      [id, req.user.id, oldValue, newValue] // Platzhalter-Admin, später echter Benutzer
    );

    res.json(neu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Ändern des Dienstes' });
  }
});

// Einen Dienst löschen – mit Protokoll
router.delete('/:id', requireAuth, requireAdmin, async (req: any, res) => {
  const { id } = req.params;

  try {
    // 1. Dienst lesen (für das Protokoll), bevor er gelöscht wird
    const before = await pool.query(
      'SELECT area_id, shift_id FROM schedule_entries WHERE id = $1',
      [id]
    );

    if (before.rows.length === 0) {
      return res.status(404).json({ message: 'Dienst nicht gefunden.' });
    }

    const alt = before.rows[0];

    // 2. Änderung protokollieren (Dienst existiert hier noch)
    const oldValue = `area_id=${alt.area_id}, shift_id=${alt.shift_id}`;

    await pool.query(
      `INSERT INTO change_logs (schedule_entry_id, changed_by_employee_id, old_value, new_value)
       VALUES ($1, $2, $3, $4)`,
      [id, req.user.id, oldValue, 'GELÖSCHT'] // 6 = Platzhalter-Admin, später echter Benutzer
    );

    // 3. Dienst löschen
    const result = await pool.query(
      'DELETE FROM schedule_entries WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Dienst gelöscht.', deleted: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Löschen des Dienstes' });
  }
});

export default router;
