import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';
import employeesRoutes from './employees/employees.routes';
import areasRoutes from './areas/areas.routes';
import shiftsRoutes from './shifts/shifts.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/employees', employeesRoutes);

app.use('/areas', areasRoutes);
app.use('/shifts', shiftsRoutes);

app.get('/', (req, res) => {
  res.send('Dienstplan Backend läuft');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'PostgreSQL Verbindung erfolgreich',
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Fehler bei PostgreSQL Verbindung',
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 Dienstplan Backend gestartet');
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🧪 DB-Test: http://localhost:${PORT}/db-test`);
  console.log(`👥 Mitarbeiter: http://localhost:${PORT}/employees`);
  console.log('=================================');
});
