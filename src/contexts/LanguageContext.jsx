import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { userApi } from '../api/userApi';
import { useAuth } from './AuthContext';
import { dictionaries } from './translations';

const LanguageContext = createContext(null);
const labels = { en: 'English', ta: 'தமிழ்', hi: 'हिन्दी' };
export function LanguageProvider({ children }) {
  const { user, tokens } = useAuth();
  const [language, setLanguage] = useState(() => localStorage.getItem('astro.language') || 'en');
  useEffect(() => {
    if (user?.preferred_language) setLanguage(user.preferred_language);
  }, [user?.preferred_language]);
  const changeLanguage = useCallback(async (next) => {
    if (!Object.hasOwn(labels, next)) return;
    setLanguage(next);
    localStorage.setItem('astro.language', next);
    if (tokens?.access_token) await userApi.updateLanguage(next, tokens.access_token);
  }, [tokens?.access_token]);
  const translate = useCallback((value) => dictionaries[language]?.[value] || value, [language]);
  const value = useMemo(() => ({ language, languages: labels, changeLanguage, t: translate }), [language, changeLanguage, translate]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
