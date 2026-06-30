import { Router } from 'express';
import { pool } from '../db';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Fehler beim Laden der Mitarbeiter',
    });
  }
});

export default router;
