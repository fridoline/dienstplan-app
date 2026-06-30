import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db';

const router = Router();

// Registrierung: neue Person mit gehashtem Passwort anlegen
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: 'Bitte first_name, last_name, email und password angeben.',
    });
  }

  try {
    // Passwort hashen (10 = Stärke des Hashings)
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, role`,
      [first_name, last_name, email, password_hash, role ?? 'EMPLOYEE']
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    // Doppelte E-Mail sauber abfangen
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'Diese E-Mail ist bereits vergeben.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Fehler bei der Registrierung' });
  }
});

export default router;
