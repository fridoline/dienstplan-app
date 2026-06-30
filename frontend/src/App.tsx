import { useEffect, useState } from 'react';

// Beschreibt, wie ein Dienst aussieht (passend zu deinem JOIN)
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

function App() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/schedule')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Daten konnten nicht geladen werden.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Lädt …</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Dienstplan</h1>
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
