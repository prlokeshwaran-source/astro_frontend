import { useEffect, useState } from 'react';
import { consultationApi } from '../api/consultationApi';
import { callApi } from '../api/callApi';
import { PageHeading, PageState } from '../components/common/PageState';
import { useLanguage } from '../contexts/LanguageContext';

export default function CallsPage({ token, role }) {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState(null);
  const [consultationId, setConsultationId] = useState('');
  const [call, setCall] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    consultationApi.list(1, 100, token)
      .then((data) => setSessions((data.items || []).filter((item) =>
        ['APPROVED', 'SCHEDULED', 'IN_PROGRESS'].includes(item.status))))
      .catch((err) => setError(err.message));
  }, [token]);

  const selectedSession = sessions?.find((item) => String(item.id) === String(consultationId));
  const clientMobile = selectedSession?.counterpart_mobile || selectedSession?.client_mobile ||
    selectedSession?.user_mobile || selectedSession?.counterpart_phone || selectedSession?.client_phone ||
    selectedSession?.user?.mobile || selectedSession?.client?.mobile || selectedSession?.counterpart?.mobile;
  const dialableMobile = typeof clientMobile === 'string' ? clientMobile.replace(/[^\d+*#,;]/g, '') : '';

  const start = async () => {
    setBusy(true);
    setError('');
    try { setCall(await callApi.start(consultationId, token)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const end = async () => {
    setBusy(true);
    setError('');
    try { setCall(await callApi.end(call.id, token)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <>
    <PageHeading eyebrow={t('VOICE CONSULTATIONS')} title={t('Calls')}
      description={t('Start or finish a call session for an active consultation.')} />
    <div className="content-card">
      <label className="select-session">{t('Active consultation')}
        <select value={consultationId} onChange={(event) => setConsultationId(event.target.value)}>
          <option value="">{t('Choose a consultation')}</option>
          {sessions?.map((item) => <option key={item.id} value={item.id}>
            {item.astrologer_id} · {item.consultation_type} · {item.status}
          </option>)}
        </select>
      </label>
      <div className="call-controls">
        {!call?.ended_at
          ? <button className="primary-button" disabled={busy || !consultationId} onClick={start}>
            {busy ? t('Connecting…') : t('Start call')}<span>↗</span>
          </button>
          : <button className="primary-button" disabled>{t('Call ended')}</button>}
        {call && !call.ended_at && <button className="secondary-button" disabled={busy} onClick={end}>
          {busy ? t('Ending…') : t('End call')}
        </button>}
        {role === 'ASTROLOGER' && selectedSession?.consultation_type === 'AUDIO' && dialableMobile &&
          <a className="primary-button mobile-audio-call" href={`tel:${dialableMobile}`}>
            {t('Call client on mobile')}<span aria-hidden="true">☎</span>
          </a>}
      </div>
      {role === 'ASTROLOGER' && selectedSession?.consultation_type === 'AUDIO' && !dialableMobile &&
        <p className="field-help">{t('The client mobile number is not available for this consultation.')}</p>}
      {call && <div className="call-details">
        <span>{t('Call ID')}</span><strong>{call.id}</strong>
        <span>{t('Started')}</span><strong>{call.started_at ? new Date(call.started_at).toLocaleString() : '—'}</strong>
        {call.ended_at && <><span>{t('Duration')}</span><strong>{call.duration_seconds ?? '—'} seconds</strong></>}
      </div>}
      {error && <p className="page-error" role="alert">{error}</p>}
      <PageState empty={sessions && !sessions.length ? t('No active consultations are available for calls.') : null} />
    </div>
  </>;
}
