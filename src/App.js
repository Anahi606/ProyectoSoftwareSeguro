import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/crud/Login';
import Game from './components/crud/Game';
import { supabase } from './components/supabaseConfig';
import NotAuthorized from './components/NotAuthorized';
import GameDetails from './components/GameDetails';

function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // --- SSO AUTOLOGIN CON EMAIL Y PASSWORD (acceso solo desde app principal) ---
    const params = new URLSearchParams(window.location.search);
    const sso = params.get('sso');
    const email = params.get('email');
    const password = params.get('password');

    if (sso === 'true' && email && password) {
      supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
        setLoading(false);
        if (!error) {
          window.location.href = '/game';
          setTimeout(() => window.close(), 1000);
        } else {
          setAccessDenied(true);
          alert('No tienes acceso. Vuelve a iniciar sesión desde la app principal.');
        }
      });
      return;
    } else {
      setLoading(false);
      setAccessDenied(true);
      alert('Acceso solo permitido desde la app principal.');
      return;
    }
    // --- FIN SSO AUTOLOGIN ---

    // El resto del useEffect ya no es necesario porque no hay login manual
  }, [navigate, location.pathname]);

  if (loading) return <div>Cargando...</div>;
  if (accessDenied) return <div style={{color: 'red', fontWeight: 'bold', marginTop: '2rem'}}>Acceso solo permitido desde la app principal.</div>;

  return (
    <div className="App">
      <Routes>
        <Route path="/game" element={isGameLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">Cargando...</div>
          </div>
        ) : (
          <Game />
        )} />
        <Route path="/userPage" element={<NotAuthorized />} />
        <Route path="/game/:id" element={<GameDetails />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
