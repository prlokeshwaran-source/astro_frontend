import { useEffect, useState } from 'react';
import { consultationApi } from '../api/consultationApi';
import { PageHeading, DataTable, PageState } from '../components/common/PageState';
import { useLanguage } from '../contexts/LanguageContext';

const astrologerActions = {
  PENDING: [['ACCEPTED', 'Accept'], ['REJECTED', 'Reject']],
  ACCEPTED: [['IN_PROGRESS', 'Start session']],
  IN_PROGRESS: [['COMPLETED', 'Mark completed']],
};

export default function ConsultationsPage({ token, selectedAstrologer, clearSelection, role, navigate }) {
  const { t } = useLanguage();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const load = () => consultationApi.list(1, 50, token).then((data) => setItems(data.items || [])).catch((err) => setError(err.message));

  useEffect(() => { load(); }, [token]);

  const book = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      await consultationApi.create({
        astrologer_id: selectedAstrologer.id,
        consultation_type: data.get('type'),
        scheduled_at: new Date(data.get('scheduled_at')).toISOString(),
        duration_minutes: Number(data.get('duration')),
      }, token);
      clearSelection();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (consultation, status) => {
    setUpdatingId(consultation.id);
    setError('');
    try {
      await consultationApi.update(consultation.id, { status }, token);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId('');
    }
  };

  const actions = (consultation) => {
    if (role === 'ASTROLOGER') {
      return <span className="row-actions">
        {(astrologerActions[consultation.status] || []).map(([status, label]) => (
          <button key={status} disabled={updatingId === consultation.id} onClick={() => updateStatus(consultation, status)}>{t(label)}</button>
        ))}
        {consultation.status === 'COMPLETED' && <button onClick={() => navigate('reports')}>{t('Create report')}</button>}
      </span>;
    }
    if (role === 'USER' && ['PENDING', 'ACCEPTED'].includes(consultation.status)) {
      return <span className="row-actions">
        <button onClick={() => navigate('chat')}>{t('Messages')}</button>
        <button disabled={updatingId === consultation.id} onClick={() => updateStatus(consultation, 'CANCELLED')}>{t('Cancel')}</button>
      </span>;
    }
    return <button className="inline-action" onClick={() => navigate('chat')}>{t('Messages')}</button>;
  };

  return <>
    <PageHeading eyebrow={t('YOUR SESSIONS')} title={t('Consultations')} description={t('Review upcoming and past astrology sessions.')} />
    {selectedAstrologer && <form className="booking-card" onSubmit={book}>
      <div><span className="section-kicker">{t('NEW BOOKING')}</span><h3>{t('Book')} {selectedAstrologer.name || t('Astrologers')}</h3></div>
      <label>{t('Session type')}<select name="type"><option>CHAT</option><option>AUDIO</option><option>VIDEO</option></select></label>
      <label>{t('Date and time')}<input name="scheduled_at" type="datetime-local" required /></label>
      <label>{t('Duration')}<select name="duration"><option value="30">{t('30 minutes')}</option><option value="60">{t('60 minutes')}</option></select></label>
      <button className="primary-button" disabled={busy}>{busy ? t('Booking…') : t('Confirm booking')}<span>↗</span></button>
      <button type="button" className="quiet-button" onClick={clearSelection}>{t('Cancel')}</button>
    </form>}
    {error && <p className="page-error" role="alert">{error}</p>}
    <PageState loading={!items && !error}>
      <DataTable
        columns={[
          { key: 'astrologer_id', label: t('Astrologers') },
          { key: 'consultation_type', label: t('Type') },
          { key: 'scheduled_at', label: t('Scheduled'), render: (row) => row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : '—' },
          { key: 'status', label: t('Status') },
          { key: 'actions', label: t('Actions'), render: actions },
        ]}
        rows={items || []}
        empty={t('You do not have any consultations yet.')}
      />
    </PageState>
  </>;
}
