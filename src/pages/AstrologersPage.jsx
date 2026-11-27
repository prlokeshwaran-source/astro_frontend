import { useEffect, useState } from 'react';
import { astrologerApi } from '../api/astrologerApi';
import { PageHeading, PageState } from '../components/common/PageState';
import { useLanguage } from '../contexts/LanguageContext';

export default function AstrologersPage({ onBook }) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({ specialization: '', language: '' }); const [results, setResults] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const search = async (e) => { e?.preventDefault(); setBusy(true); setError(''); try { setResults(await astrologerApi.search(filters)); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  useEffect(() => { search(); }, []);
  return <><PageHeading eyebrow={t('FIND YOUR GUIDE')} title={t('Astrologers')} description={t('Search approved astrologers by their areas of practice and languages.')}/><form className="filter-bar" onSubmit={search}><label>{t('Specialization')}<input value={filters.specialization} onChange={(e)=>setFilters({...filters,specialization:e.target.value})} placeholder={t('Career, relationships…')}/></label><label>{t('Language')}<input value={filters.language} onChange={(e)=>setFilters({...filters,language:e.target.value})} placeholder={t('English, Tamil…')}/></label><button className="primary-button" disabled={busy}>{busy?t('Searching…'):t('Search')} <span>⌕</span></button></form><PageState loading={!results && !error} error={error} empty={results && !results.items?.length ? t('No astrologers found. Try broadening your search.') : null}><div className="astrologer-grid">{results?.items?.map((person) => <article className="person-card" key={person.id}><div className="person-avatar">{person.name?.[0] || '✧'}</div><span className="verified-tag">✦ {t('APPROVED')}</span><h3>{person.name || person.user?.name || t('Astrologers')}</h3><p>{person.specialization?.join(' · ') || t('Astrology consultations')}</p><div className="person-meta"><span>{person.experience ?? '—'} {t('yrs experience')}</span><b>{person.consultation_price ?? '—'} {t('/ session')}</b></div><button className="primary-button" onClick={()=>onBook(person)}>{t('Book a consultation')} <span>↗</span></button></article>)}</div></PageState></>;
}
