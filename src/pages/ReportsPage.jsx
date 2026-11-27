import { useEffect, useState } from 'react';
import { consultationApi } from '../api/consultationApi';
import { locationApi } from '../api/locationApi';
import { reportApi } from '../api/reportApi';
import { PageHeading, PageState } from '../components/common/PageState';
import { useLanguage } from '../contexts/LanguageContext';

const languageNames = { en: 'English', ta: 'Tamil', hi: 'Hindi' };

export default function ReportsPage({ token, role }) {
  const { t, language, changeLanguage } = useLanguage();
  const [rows, setRows] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');
  const [birthPlaceQuery, setBirthPlaceQuery] = useState('');
  const [selectedBirthPlace, setSelectedBirthPlace] = useState(null);
  const [placeMatches, setPlaceMatches] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [placeError, setPlaceError] = useState('');

  const loadReports = () => reportApi.list(token).then(setRows).catch((err) => setError(err.message));

  useEffect(() => {
    loadReports();
    if (role === 'ASTROLOGER') {
      consultationApi.list(1, 100, token)
        .then((data) => setConsultations((data.items || []).filter((item) => item.status === 'COMPLETED')))
        .catch((err) => setError(err.message));
    }
  }, [token, role]);

  useEffect(() => {
    const query = birthPlaceQuery.trim();
    if (query.length < 2 || selectedBirthPlace?.label === query) {
      setPlaceMatches([]);
      setSearchingPlaces(false);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchingPlaces(true);
      setPlaceError('');
      try {
        const response = await locationApi.search(query, language, controller.signal);
        const matches = Array.isArray(response)
          ? response
          : response?.items || response?.locations || response?.results || response?.data || [];
        setPlaceMatches(matches);
      } catch (err) {
        if (err.name !== 'AbortError') setPlaceError(err.message);
      } finally {
        if (!controller.signal.aborted) setSearchingPlaces(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [birthPlaceQuery, selectedBirthPlace, language]);

  const chooseBirthPlace = (place) => {
    const latitude = Number(place.latitude ?? place.lat);
    const longitude = Number(place.longitude ?? place.lon ?? place.lng);
    const label = place.display_name || place.place_name || place.name || place.formatted_address || place.address ||
      [place.city, place.region, place.country].filter(Boolean).join(', ');
    if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setPlaceError(t('This place did not include valid coordinates. Choose another result.'));
      return;
    }
    setSelectedBirthPlace({ label, latitude, longitude });
    setBirthPlaceQuery(label);
    setPlaceMatches([]);
    setPlaceError('');
  };

  const generate = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await reportApi.generate({
        consultation_id: values.get('consultation_id'),
        birth_datetime: new Date(values.get('birth_datetime')).toISOString(),
        latitude: selectedBirthPlace.latitude,
        longitude: selectedBirthPlace.longitude,
        topic: values.get('topic').trim(),
        astrologer_notes: values.get('astrologer_notes').trim() || null,
        language,
      }, token);
      form.reset();
      setBirthPlaceQuery('');
      setSelectedBirthPlace(null);
      await loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const share = async (id) => {
    setError('');
    try {
      await reportApi.share(id, token);
      await loadReports();
    } catch (err) {
      setError(err.message);
    }
  };

  const download = async (report) => {
    setDownloadingId(report.id);
    setError('');
    try {
      const blob = await reportApi.pdf(report.id, token);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `astrology-report-${report.id}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingId('');
    }
  };

  return <>
    <PageHeading eyebrow={t('ASTROLOGY INSIGHTS')} title={t('Reports')} description={role === 'ASTROLOGER'
      ? t('Prepare a clear, personalized report, review the draft, then share it with your client.')
      : t('Your consultation reports and astrology guidance, ready to read or download.')} />

    {role === 'ASTROLOGER' && <section className="content-card report-generator">
      <div className="report-generator-heading">
        <div className="report-generator-icon" aria-hidden="true">?</div>
        <div><span className="section-kicker">{t('AI ASSISTED REPORT')}</span><h3>{t('Create a consultation report')}</h3>
          <p>{t('Complete the birth details below. Your draft will be prepared in the selected language.')}</p></div>
        <label className="report-language-select">{t('PDF language')}
          <select value={language} onChange={(event) => changeLanguage(event.target.value).catch((err) => setError(err.message))}>
            <option value="en">English</option><option value="ta">?????</option><option value="hi">??????</option>
          </select>
        </label>
      </div>
      <div className="report-language-banner"><span className="report-language-dot" />
        {t('The report and PDF will be generated in')} <strong>{languageNames[language] || languageNames.en}</strong>
      </div>
      <form className="form-grid report-form-grid" onSubmit={generate}>
        <label className="span-two">{t('Completed consultation')}
          <select name="consultation_id" required defaultValue="">
            <option value="" disabled>{t('Select a completed consultation')}</option>
            {consultations.map((item) => <option key={item.id} value={item.id}>
              {item.counterpart_name || item.astrologer_id} ? {new Date(item.scheduled_at).toLocaleString()} ? {item.consultation_type}
            </option>)}
          </select>
        </label>
        <label>{t('Client birth date and time')}<input name="birth_datetime" type="datetime-local" required /></label>
        <label>{t('Prediction topic')}<input name="topic" minLength={3} maxLength={200} placeholder={t('Career, relationships, or general')} required /></label>
        <label className="span-two location-field">{t('Client birthplace')}
          <input name="birth_place" autoComplete="off" aria-autocomplete="list" aria-expanded={placeMatches.length > 0}
            placeholder={t('Search a city or town')} value={birthPlaceQuery}
            onChange={(event) => { setBirthPlaceQuery(event.target.value); setSelectedBirthPlace(null); }} />
          {searchingPlaces && <small className="field-help">{t('Searching places?')}</small>}
          {selectedBirthPlace && <small className="field-help selected-location">? {selectedBirthPlace.label} ? {selectedBirthPlace.latitude.toFixed(4)}, {selectedBirthPlace.longitude.toFixed(4)}</small>}
          {placeMatches.length > 0 && <div className="location-results" role="listbox">{placeMatches.map((place, index) => {
            const label = place.display_name || place.place_name || place.name || place.formatted_address || place.address ||
              [place.city, place.region, place.country].filter(Boolean).join(', ');
            return <button type="button" role="option" className="location-option" key={place.id || `${label}-${index}`} onClick={() => chooseBirthPlace(place)}>
              <b>{label || t('Unnamed location')}</b><small>{[place.region, place.country].filter(Boolean).join(', ')}</small>
            </button>;
          })}</div>}
          {placeError && <small className="field-error">{placeError}</small>}
        </label>
        <label className="span-two">{t('Astrologer notes (optional)')}<textarea name="astrologer_notes" rows="3" maxLength="4000" placeholder={t('Add context to personalize the report')} /></label>
        <div className="report-form-footer span-two">
          <small>{t('AI-assisted drafts should be reviewed before sharing.')}</small>
          <button className="primary-button" disabled={busy || !consultations.length || !selectedBirthPlace}>
            {busy ? t('Preparing report?') : t('Generate report')}<span>?</span>
          </button>
        </div>
      </form>
      {!consultations.length && <p className="field-help report-empty-hint">{t('Completed consultations will appear here.')}</p>}
    </section>}

    {error && <p className="page-error" role="alert">{t(error)}</p>}
    <section className="reports-section">
      <div className="reports-section-heading"><div><span className="section-kicker">{t('YOUR LIBRARY')}</span><h3>{t('Consultation reports')}</h3></div>
        {rows && <span className="report-count">{rows.length} {t(rows.length === 1 ? 'report' : 'reports')}</span>}
      </div>
      {!rows && !error ? <PageState loading /> : !rows?.length ? <div className="reports-empty-state">
        <span className="reports-empty-icon">?</span><h3>{t('No reports yet')}</h3>
        <p>{role === 'ASTROLOGER' ? t('Generate a report after completing a consultation.') : t('Reports shared after your consultations will appear here.')}</p>
      </div> : <div className="report-card-list">{rows.map((report) => <article className="report-card" key={report.id}>
        <div className="report-card-top"><div className="report-card-icon" aria-hidden="true">?</div><div className="report-card-title">
          <h4>{report.title || t('Astrology consultation report')}</h4><p>{report.topic || t('Consultation guidance')}</p>
        </div><span className={`report-status status-${(report.status || 'SHARED').toLowerCase()}`}>{t(report.status || 'SHARED')}</span></div>
        <div className="report-card-meta"><span>{t('Created')} ? {report.created_at ? new Date(report.created_at).toLocaleDateString() : t('Date unavailable')}</span>
          <span>{t('Language')} ? {languageNames[report.language] || languageNames.en}</span></div>
        <details className="report-preview"><summary>{t('Preview report')}</summary><p>{report.content?.summary || t('Report details are available in the PDF.')}</p></details>
        <div className="report-card-actions">
          {report.pdf_url && <button className="secondary-button" disabled={downloadingId === report.id} onClick={() => download(report)}>
            {downloadingId === report.id ? t('Preparing PDF?') : t('Download PDF')} <span aria-hidden="true">?</span>
          </button>}
          {role === 'ASTROLOGER' && report.status === 'DRAFT' && <button className="primary-button" onClick={() => share(report.id)}>{t('Share with client')}<span>?</span></button>}
          {role === 'ASTROLOGER' && report.status === 'SHARED' && <span className="report-shared-label">? {t('Shared with client')}</span>}
        </div>
      </article>)}</div>}
    </section>
  </>;
}
