import { createContext, useContext, useState, useEffect } from 'react';
import { api, setTokens, clearTokens } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth.me()
      .then((u) => setUser(u))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const applyAuth = (res) => {
    const accessToken = res.accessToken ?? res.token;
    const refreshToken = res.refreshToken ?? null;
    setTokens(accessToken, refreshToken);
    setUser(res.user);
    return res.user;
  };

  const login = (email, password) =>
    api.auth.login(email, password).then(applyAuth);

  const register = (body) =>
    api.auth.register(body).then(applyAuth);

  const registerTeacher = (body) =>
    api.auth.registerTeacher(body).then(applyAuth);

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerTeacher, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
