import { useState } from 'react';
import { astrologerApi } from '../api/astrologerApi';
import { PageHeading } from '../components/common/PageState';
import { useLanguage } from '../contexts/LanguageContext';

export default function AstrologerApplicationPage({ token, user }) {
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await astrologerApi.apply({
        name: form.get('name').trim(),
        experience: Number(form.get('experience')),
        specialization: form.get('specialization').split(',').map((value) => value.trim()).filter(Boolean),
        languages: form.get('languages').split(',').map((value) => value.trim()).filter(Boolean),
        consultation_price: Number(form.get('consultation_price')),
        bio: form.get('bio'),
      }, token);
      setMessage(t('Application submitted for admin approval.'));
      event.currentTarget.reset();
    } catch (err) { setError(t(err.message)); } finally { setBusy(false); }
  };

  return <>
    <PageHeading eyebrow={t('SHARE YOUR PRACTICE')} title={t('Apply as an astrologer')} description={t('Tell us about your experience and consultation services.')} />
    <form className="content-card form-grid" onSubmit={submit}>
      <label className="span-two">{t('Full name')}<input name="name" defaultValue={user?.name || ''} minLength="2" maxLength="100" required /></label>
      <label>{t('Years of experience')}<input name="experience" type="number" min="0" max="80" required /></label>
      <label>{t('Consultation price')}<input name="consultation_price" type="number" min="0.01" step="0.01" required /></label>
      <label>{t('Specializations (comma separated)')}<input name="specialization" placeholder={t('Career, relationships')} required /></label>
      <label>{t('Languages (comma separated)')}<input name="languages" placeholder={t('English, Tamil')} required /></label>
      <label className="span-two">{t('Bio')}<textarea name="bio" rows="4" minLength="20" maxLength="5000" required /></label>
      <button className="primary-button span-two" disabled={busy}>{busy ? t('Submitting…') : t('Submit application')}<span>↗</span></button>
      {error && <p className="page-error span-two">{error}</p>}
      {message && <p className="success-note span-two">{message}</p>}
    </form>
  </>;
}
