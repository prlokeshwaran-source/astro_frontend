import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { consultationApi } from '../api/consultationApi';
import { PageHeading, PageState } from '../components/common/PageState';
import { useLanguage } from '../contexts/LanguageContext';

export default function DashboardPage({ user, token, role, navigate }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => {
    const load = role === 'ADMIN' ? adminApi.dashboard(token) : consultationApi.list(1, 5, token);
    load.then(setData).catch((e) => setError(e.message));
  }, [token, role]);
  const metrics = role === 'ADMIN' ? Object.entries(data || {}).map(([label, value]) => ({ label: label.replaceAll('_', ' '), value })) : [
    { label: t('Upcoming consultations'), value: data?.total ?? '—' }, { label: t('Account language'), value: user?.preferred_language?.toUpperCase() || 'EN' }, { label: t('Your role'), value: role || 'USER' },
  ];
  const welcome = `${t('Good to see you,')} ${user?.name?.split(' ')[0] || 'there'}`;
  return <><PageHeading eyebrow={t('YOUR OVERVIEW')} title={welcome} description={t('Pick up where you left off.')} action={<button className="primary-button" onClick={() => navigate(role === 'ADMIN' ? 'approvals' : 'chart')}>{t(role === 'ADMIN' ? 'Review applications' : 'Open birth chart')} <span>↗</span></button>} /><PageState loading={!data && !error} error={error}><div className="metric-grid">{metrics.map((item) => <article className="metric-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{t('Live from your account')}</small></article>)}</div><section className="content-card"><div className="card-title"><div><span className="section-kicker">{t('NEXT STEPS')}</span><h3>{t('Your astrology space')}</h3></div></div><div className="quick-links">{(role === 'ADMIN' ? [['approvals','Review pending astrologers'],['users','Manage user accounts']] : [['chart','Explore your birth chart'],['astrologers','Find a trusted astrologer'],['consultations','View your consultations']]).map(([id,label]) => <button key={id} onClick={() => navigate(id)}>{t(label)}<span>↗</span></button>)}</div></section></PageState></>;
}
