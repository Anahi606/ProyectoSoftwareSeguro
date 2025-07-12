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
      supabase.auth.signInWithPassword({ email, password }).then(async ({ error }) => {
        setLoading(false);
        if (!error) {
          // Obtener el usuario y su rol
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData?.session?.user;
          if (user) {
            const { data: roleData, error: roleError } = await supabase
              .from('Roles')
              .select('isAdmin')
              .eq('userid', user.id)
              .maybeSingle();
            if (!roleError) {
              const role = roleData?.isAdmin ? 'admin' : 'user';
              if (role === 'admin') {
                window.location.href = '/game';
              } else {
                window.location.href = '/userPage';
              }
              setTimeout(() => window.close(), 1000);
              return;
            }
          }
          // Si no se puede determinar el rol, acceso denegado
          setAccessDenied(true);
          alert('No tienes acceso. Vuelve a iniciar sesión desde la app principal.');
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
