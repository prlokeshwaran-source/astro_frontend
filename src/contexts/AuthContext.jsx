import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => tokenStorage.read());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokens?.access_token));
  const signOut = useCallback(async () => {
    if (tokens?.access_token && tokens?.refresh_token) {
      try { await authApi.logout(tokens.refresh_token, tokens.access_token); } catch { /* local sign out still succeeds */ }
    }
    tokenStorage.clear(); setTokens(null); setUser(null);
  }, [tokens]);
  useEffect(() => {
    if (!tokens?.access_token) { setLoading(false); return; }
    let active = true;
    authApi.me(tokens.access_token).then((profile) => { if (active) setUser(profile); })
      .catch(() => { if (active) { tokenStorage.clear(); setTokens(null); setUser(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tokens?.access_token]);
  const signIn = async (credentials) => {
    const pair = await authApi.login(credentials); tokenStorage.write(pair); setTokens(pair);
    const profile = await authApi.me(pair.access_token); setUser(profile); return profile;
  };
  const value = useMemo(() => ({ user, tokens, loading, signIn, signOut }), [user, tokens, loading, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
