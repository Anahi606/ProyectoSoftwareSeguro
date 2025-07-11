import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, federatedSupabase } from './supabaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Función para sincronizar sesión con proyecto federado
  const syncSessionToFederated = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Establecer la sesión en el proyecto federado
        const { error } = await federatedSupabase.auth.setSession(session);
        if (error) {
          console.warn('Error sincronizando sesión:', error);
        } else {
          console.log('Sesión sincronizada exitosamente');
        }
      }
    } catch (error) {
      console.warn('Error en sincronización de sesión:', error);
    }
  };

  // Función para obtener el rol del usuario
  const getUserRole = async (userId) => {
    try {
      const { data: roleData, error: roleError } = await federatedSupabase
        .from('Roles')
        .select('isAdmin')
        .eq('userid', userId)
        .maybeSingle();
      
      if (!roleError && roleData) {
        return roleData.isAdmin ? 'admin' : 'user';
      }
      return 'user'; // Por defecto
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      return 'user';
    }
  };

  // Función para manejar SSO con tokens
  const handleSSOWithTokens = async (accessToken, refreshToken) => {
    try {
      // Establecer la sesión con los tokens
      const { data, error } = await federatedSupabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) throw error;
      
      if (data.session) {
        setCurrentUser(data.session.user);
        const role = await getUserRole(data.session.user.id);
        setUserRole(role);
        return { success: true, role };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error en SSO con tokens:', error);
      return { success: false, error };
    }
  };

  // Función para manejar SSO con email y password
  const handleSSOWithCredentials = async (email, password) => {
    try {
      const { data, error } = await federatedSupabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data.session) {
        setCurrentUser(data.session.user);
        const role = await getUserRole(data.session.user.id);
        setUserRole(role);
        return { success: true, role };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error en SSO con credenciales:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    // Cerrar sesión en ambos proyectos
    await supabase.auth.signOut();
    await federatedSupabase.auth.signOut();
    setCurrentUser(null);
    setUserRole(null);
  };

  useEffect(() => {
    const { data: listener } = federatedSupabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentUser(session?.user || null);
      
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });
    
    // Verificar sesión inicial
    federatedSupabase.auth.getSession().then(async ({ data }) => {
      if (data?.session?.user) {
        setCurrentUser(data.session.user);
        const role = await getUserRole(data.session.user.id);
        setUserRole(role);
      }
      setLoading(false);
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    logout,
    handleSSOWithTokens,
    handleSSOWithCredentials,
    syncSessionToFederated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 