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

  const [employeeId, setEmployeeId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [message, setMessage] = useState('');

  function loadSchedule() {
    fetch(`${API}/schedule`)
      .then((res) => res.json())
      .then((data) => setEntries(data));
  }

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
          loadSchedule();
        } else {
          setMessage('Fehler: ' + data.message);
        }
      })
      .catch(() => setMessage('Server nicht erreichbar.'));
  }

  // NEU: Dienst löschen, mit Sicherheitsabfrage
  function handleDelete(id: number) {
    const sicher = window.confirm('Diesen Dienst wirklich löschen?');
    if (!sicher) return;

    fetch(`${API}/schedule/${id}`, { method: 'DELETE' })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setMessage('✓ Dienst gelöscht.');
          loadSchedule();
        } else {
          setMessage('Fehler: ' + data.message);
        }
      })
      .catch(() => setMessage('Server nicht erreichbar.'));
  }

  // NEU: Schicht eines Dienstes ändern (per Auswahl)
  function handleChangeShift(id: number, newShiftId: string) {
    if (!newShiftId) return;

    fetch(`${API}/schedule/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shift_id: Number(newShiftId) }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setMessage('✓ Dienst geändert.');
          loadSchedule();
        } else {
          setMessage('Fehler: ' + data.message);
        }
      })
      .catch(() => setMessage('Server nicht erreichbar.'));
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 800 }}>
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
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '6px' }}>Datum</th>
              <th style={{ padding: '6px' }}>Mitarbeiterin</th>
              <th style={{ padding: '6px' }}>Schicht</th>
              <th style={{ padding: '6px' }}>Wohnbereich</th>
              <th style={{ padding: '6px' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px' }}>{e.work_date}</td>
                <td style={{ padding: '6px' }}>
                  {e.first_name} {e.last_name}
                </td>
                <td style={{ padding: '6px' }}>
                  {e.shift_name} ({e.start_time}–{e.end_time})
                </td>
                <td style={{ padding: '6px' }}>{e.area_name}</td>
                <td style={{ padding: '6px' }}>
                  {/* Schicht ändern per Auswahl */}
                  <select
                    defaultValue=""
                    onChange={(ev) => handleChangeShift(e.id, ev.target.value)}
                  >
                    <option value="">Schicht ändern …</option>
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>{' '}
                  <button onClick={() => handleDelete(e.id)}>Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
