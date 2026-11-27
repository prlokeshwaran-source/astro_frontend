import { useLanguage } from '../contexts/LanguageContext';
export default function NotFoundPage({onHome}){const {t}=useLanguage();return <div className="not-found"><span className="section-kicker">{t('Page not found')}</span><h2>{t('That path isn’t in the stars.')}</h2><button className="primary-button" onClick={onHome}>{t('Return to overview')} <span>↗</span></button></div>;}
