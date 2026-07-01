import { useState } from 'react';

const API = 'http://localhost:5000';

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
};

type LoginProps = {
  onLogin: (token: string, user: User) => void;
};

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin() {
    setError('');

    fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          onLogin(data.token, data.user);
        } else {
          setError(data.message);
        }
      })
      .catch(() => setError('Server nicht erreichbar.'));
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 320 }}>
      <h1>Anmeldung</h1>
      <div style={{ display: 'grid', gap: '8px' }}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Einloggen</button>
      </div>
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
}

export default Login;
