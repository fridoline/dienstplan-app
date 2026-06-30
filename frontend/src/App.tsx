import { useEffect, useState } from 'react';

type ScheduleEntry = {
  id: number;
  work_date: string;
  status: string;
  first_name: string;
  last_name: string;
  area_name: string;
  shift_name: string;
  start_time: string;
  end_time: string;
};
type Employee = { id: number; first_name: string; last_name: string };
type Area = { id: number; name: string };
type Shift = { id: number; name: string };

const API = 'http://localhost:5000';

function App() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Formularfelder
  const [employeeId, setEmployeeId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [message, setMessage] = useState('');

  // Dienstliste laden (eigene Funktion, damit wir sie nach dem Speichern erneut aufrufen können)
  function loadSchedule() {
    fetch(`${API}/schedule`)
      .then((res) => res.json())
      .then((data) => setEntries(data));
  }

  // Beim ersten Laden: alle Daten holen
  useEffect(() => {
    loadSchedule();
    fetch(`${API}/employees`)
      .then((r) => r.json())
      .then(setEmployees);
    fetch(`${API}/areas`)
      .then((r) => r.json())
      .then(setAreas);
    fetch(`${API}/shifts`)
      .then((r) => r.json())
      .then(setShifts);
  }, []);

  // Dienst anlegen
  function handleSubmit() {
    setMessage('');

    if (!employeeId || !areaId || !shiftId || !workDate) {
      setMessage('Bitte alle Felder ausfüllen.');
      return;
    }

    fetch(`${API}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: Number(employeeId),
        area_id: Number(areaId),
        shift_id: Number(shiftId),
        work_date: workDate,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setMessage('✓ Dienst angelegt.');
          setWorkDate('');
          loadSchedule(); // Liste aktualisieren
        } else {
          setMessage('Fehler: ' + data.message);
        }
      })
      .catch(() => setMessage('Server nicht erreichbar.'));
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 700 }}>
      <h1>Dienstplan</h1>

      <h2>Neuen Dienst anlegen</h2>
      <div style={{ display: 'grid', gap: '8px', maxWidth: 350 }}>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">Mitarbeiterin wählen …</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.first_name} {e.last_name}
            </option>
          ))}
        </select>

        <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
          <option value="">Wohnbereich wählen …</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select value={shiftId} onChange={(e) => setShiftId(e.target.value)}>
          <option value="">Schicht wählen …</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
        />

        <button onClick={handleSubmit}>Dienst speichern</button>
      </div>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}

      <h2 style={{ marginTop: 30 }}>Alle Dienste</h2>
      {entries.length === 0 ? (
        <p>Noch keine Dienste vorhanden.</p>
      ) : (
        <ul>
          {entries.map((e) => (
            <li key={e.id}>
              {e.work_date.substring(0, 10)} – {e.first_name} {e.last_name}:{' '}
              {e.shift_name} ({e.start_time}–{e.end_time}), {e.area_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
