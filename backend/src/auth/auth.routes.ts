import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db';
import jwt from 'jsonwebtoken';

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

// Login: E-Mail und Passwort prüfen, Token ausstellen
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Bitte email und password angeben.' });
  }

  try {
    // 1. Person zur E-Mail suchen
    const result = await pool.query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'E-Mail oder Passwort falsch.' });
    }

    const user = result.rows[0];

    // 2. Passwort gegen den Hash prüfen
    const passt = await bcrypt.compare(password, user.password_hash);

    if (!passt) {
      return res.status(401).json({ message: 'E-Mail oder Passwort falsch.' });
    }

    // 3. Token ausstellen
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    // 4. Token und unbedenkliche Benutzerdaten zurückgeben
    res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Login' });
  }
});

export default router;
