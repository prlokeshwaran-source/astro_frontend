import { useEffect, useState } from 'react';
import { userApi } from '../api/userApi';
import { astrologerApi } from '../api/astrologerApi';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeading } from '../components/common/PageState';

export default function ProfilePage({ token, user, role }) {
  const { language, changeLanguage, t } = useLanguage();
  const [values, setValues] = useState({ name: user?.name || '', mobile: user?.mobile || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (role === 'ASTROLOGER') {
      astrologerApi.me(token)
        .then((profile) => setValues({
          bio: profile.bio || '',
          consultation_price: profile.consultation_price ?? '',
          languages: profile.languages?.join(', ') || '',
        }))
        .catch((err) => setError(err.message));
    } else {
      setValues({ name: user?.name || '', mobile: user?.mobile || '' });
    }
  }, [token, user, role]);

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setMessage(''); setError('');
    try {
      if (role === 'ASTROLOGER') {
        await astrologerApi.updateMe({
          bio: values.bio,
          consultation_price: Number(values.consultation_price),
          languages: values.languages?.split(',').map((item) => item.trim()).filter(Boolean),
        }, token);
      } else {
        await userApi.updateProfile({ name: values.name, mobile: values.mobile }, token);
      }
      setMessage(t('Profile saved.'));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return <>
    <PageHeading eyebrow={t('ACCOUNT SETTINGS')} title={t('My profile')} description={t('Keep your contact details and language preference up to date.')} />
    <div className="content-card">
      <form className="form-grid" onSubmit={save}>
        {role === 'ASTROLOGER' ? <>
          <label className="span-two">{t('About you')}<textarea rows="4" value={values.bio || ''} onChange={(event) => setValues({ ...values, bio: event.target.value })} /></label>
          <label>{t('Consultation price')}<input type="number" min="0" value={values.consultation_price || ''} onChange={(event) => setValues({ ...values, consultation_price: event.target.value })} /></label>
          <label>{t('Languages (comma separated)')}<input value={values.languages || ''} onChange={(event) => setValues({ ...values, languages: event.target.value })} /></label>
        </> : <>
          <label>{t('Full name')}<input required value={values.name || ''} onChange={(event) => setValues({ ...values, name: event.target.value })} /></label>
          <label>{t('Mobile number')}<input value={values.mobile || ''} onChange={(event) => setValues({ ...values, mobile: event.target.value })} /></label>
        </>}
        <label>{t('Preferred language')}<select value={language} onChange={(event) => changeLanguage(event.target.value).then(() => setMessage(t('Language preference saved.'))).catch((err) => setError(err.message))}>
          <option value="en">English</option><option value="ta">தமிழ்</option><option value="hi">हिन्दी</option>
        </select></label>
        <button className="primary-button span-two" disabled={busy}>{busy ? t('Saving…') : t('Save changes')}<span>↗</span></button>
      </form>
      {message && <p className="success-note">{message}</p>}
      {error && <p className="page-error" role="alert">{error}</p>}
    </div>
  </>;
}
