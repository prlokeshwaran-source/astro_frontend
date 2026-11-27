import { useEffect, useState } from 'react';
import { astrologyApi } from '../api/astrologyApi';
import { locationApi } from '../api/locationApi';
import { voiceApi } from '../api/voiceApi';
import { useLanguage } from '../contexts/LanguageContext';
import { DataTable, PageHeading } from '../components/common/PageState';
import ChartDiagram from '../components/charts/ChartDiagram';

const text = {
  en: { eyebrow: 'YOUR PERSONAL CHART', title: 'Birth chart', description: 'Enter your birth details to calculate your chart placements.', place: 'Birthplace', placeHint: 'Search a city or town', searching: 'Searching places…', choose: 'Select a matching place to fill in its coordinates.', date: 'Birth date and time', latitude: 'Latitude', longitude: 'Longitude', submit: 'Calculate my chart', busy: 'Calculating…', selectFirst: 'Choose a birthplace before continuing.', ascendant: 'Ascendant', moon: 'Moon sign', star: 'Birth star', planets: 'Planets', positions: 'PLANET POSITIONS', house: 'House', noResults: 'No matching places. Try another spelling.' },
  ta: { eyebrow: 'உங்கள் தனிப்பட்ட ஜாதகம்', title: 'பிறப்பு ஜாதகம்', description: 'ஜாதகக் கணிப்பிற்குப் பிறந்த விவரங்களை உள்ளிடுங்கள்.', place: 'பிறந்த இடம்', placeHint: 'நகரம் அல்லது ஊரைத் தேடுங்கள்', searching: 'இடங்களைத் தேடுகிறது…', choose: 'ஆயத்தொகைகளை நிரப்ப பொருத்தமான இடத்தைத் தேர்ந்தெடுக்கவும்.', date: 'பிறந்த தேதி மற்றும் நேரம்', latitude: 'அட்சரேகை', longitude: 'தீர்க்கரேகை', submit: 'என் ஜாதகத்தைக் கணக்கிடு', busy: 'கணக்கிடுகிறது…', selectFirst: 'தொடர்வதற்கு முன் பிறந்த இடத்தைத் தேர்ந்தெடுக்கவும்.', ascendant: 'லக்னம்', moon: 'ராசி', star: 'நட்சத்திரம்', planets: 'கிரகங்கள்', positions: 'கிரக நிலைகள்', house: 'பாவம்', noResults: 'பொருத்தமான இடம் கிடைக்கவில்லை. வேறு பெயரை முயற்சிக்கவும்.' },
  hi: { eyebrow: 'आपकी व्यक्तिगत कुंडली', title: 'जन्म कुंडली', description: 'कुंडली की गणना के लिए जन्म विवरण दर्ज करें।', place: 'जन्म स्थान', placeHint: 'शहर या कस्बा खोजें', searching: 'स्थान खोज रहे हैं…', choose: 'निर्देशांक भरने के लिए सही स्थान चुनें।', date: 'जन्म तिथि और समय', latitude: 'अक्षांश', longitude: 'देशांतर', submit: 'मेरी कुंडली बनाएँ', busy: 'गणना हो रही है…', selectFirst: 'आगे बढ़ने से पहले जन्म स्थान चुनें।', ascendant: 'लग्न', moon: 'राशि', star: 'नक्षत्र', planets: 'ग्रह', positions: 'ग्रहों की स्थिति', house: 'भाव', noResults: 'कोई स्थान नहीं मिला। दूसरा नाम आज़माएँ।' },
};

function locationRows(response) {
  if (Array.isArray(response)) return response;
  return response?.items || response?.locations || response?.results || response?.data || [];
}

function placeName(place) {
  return place.display_name || place.place_name || place.name || place.formatted_address || place.address ||
    [place.city, place.region, place.country].filter(Boolean).join(', ');
}

function formatDegree(longitude) {
  if (!Number.isFinite(longitude)) return '—';
  const withinSign = ((longitude % 30) + 30) % 30;
  const totalSeconds = Math.round(withinSign * 3600);
  const degrees = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(degrees).padStart(2, '0')}° ${String(minutes).padStart(2, '0')}′ ${String(seconds).padStart(2, '0')}″`;
}

export default function BirthChartPage({ token }) {
  const { language } = useLanguage();
  const t = text[language] || text.en;
  const [birthDatetime, setBirthDatetime] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [chart, setChart] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [chartStyle, setChartStyle] = useState('south');
  const [selectedMahadasha, setSelectedMahadasha] = useState('all');
  const [selectedBhukti, setSelectedBhukti] = useState('all');
  const [question, setQuestion] = useState('');
  const [spokenAnswer, setSpokenAnswer] = useState(null);
  const [answerBusy, setAnswerBusy] = useState(false);
  const [answerError, setAnswerError] = useState('');

  const askByVoice = async (event) => {
    event.preventDefault();
    setAnswerBusy(true); setAnswerError('');
    setSpokenAnswer((previous) => {
      if (previous?.audioUrl) URL.revokeObjectURL(previous.audioUrl);
      return null;
    });
    try {
      const date = new Date(birthDatetime);
      const offset = -date.getTimezoneOffset();
      const zone = `${offset >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`;
      const result = await voiceApi.astrologyAnswer({
        question,
        language,
        chart: {
          birth_datetime: `${birthDatetime}:00${zone}`,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
          house_system: 'P',
        },
      }, token);
      const audioBytes = Uint8Array.from(atob(result.audio_mpeg_base64), (char) => char.charCodeAt(0));
      const audioUrl = URL.createObjectURL(new Blob([audioBytes], { type: 'audio/mpeg' }));
      setSpokenAnswer({ ...result, audioUrl });
    } catch (err) { setAnswerError(err.message); } finally { setAnswerBusy(false); }
  };

  useEffect(() => () => {
    if (spokenAnswer?.audioUrl) URL.revokeObjectURL(spokenAnswer.audioUrl);
  }, [spokenAnswer]);

  useEffect(() => {
    const query = placeQuery.trim();
    if (query.length < 2 || selectedPlace?.label === query) {
      setMatches([]);
      setSearching(false);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true); setSearchError('');
      try {
        const response = await locationApi.search(query, language, controller.signal);
        setMatches(locationRows(response));
      } catch (err) {
        if (err.name !== 'AbortError') setSearchError(err.message);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [placeQuery, language, selectedPlace]);

  const choosePlace = (place) => {
    const latitude = Number(place.latitude ?? place.lat);
    const longitude = Number(place.longitude ?? place.lon ?? place.lng);
    const label = placeName(place);
    if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setSearchError('This place did not include valid coordinates. Choose another result.');
      return;
    }
    setSelectedPlace({ label, latitude, longitude });
    setPlaceQuery(label);
    setMatches([]);
    setSearchError('');
    setChart(null);
  };

  const submit = async (event) => {
    event.preventDefault(); setError(''); setChart(null);
    if (!selectedPlace) { setError(t.selectFirst); return; }
    setBusy(true);
    try {
      const date = new Date(birthDatetime);
      const offset = -date.getTimezoneOffset();
      const zone = `${offset >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`;
      const result = await astrologyApi.chart({
        birth_datetime: `${birthDatetime}:00${zone}`,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        house_system: 'P',
      }, token, language);
      setChart(result);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const results = chart && [
    [t.ascendant, chart.lagna_display || chart.lagna],
    [t.moon, chart.rasi_display || chart.rasi],
    [t.star, chart.nakshatra_display || chart.nakshatra],
  ];
  const mahadashas = chart?.dasha?.mahadashas || [];
  const bhuktiOptions = selectedMahadasha === 'all'
    ? [...new Map(mahadashas.flatMap((major) => major.bhuktis.map((period) => [period.lord, period]))).values()]
    : mahadashas.find((major) => major.lord === selectedMahadasha)?.bhuktis || [];
  const dashaRows = mahadashas.flatMap((major, majorIndex) => major.bhuktis.map((subperiod, subIndex) => {
    const startsAt = new Date(subperiod.start_at);
    const endsAt = new Date(subperiod.end_at);
    const status = subperiod.is_at_birth ? 'At birth' : subperiod.is_current ? 'Current' : subperiod.is_before_birth ? 'Before birth' : startsAt > new Date() ? 'Upcoming' : 'Past';
    return {
      id: `${majorIndex}-${subIndex}`,
      mahadashaKey: major.lord,
      bhuktiKey: subperiod.lord,
      mahadasha: major.lord_display || major.lord,
      bhukti: subperiod.lord_display || subperiod.lord,
      start: startsAt.toLocaleDateString(),
      end: endsAt.toLocaleDateString(),
      duration: subperiod.years.toFixed(2),
      status,
    };
  })).filter((row) => (selectedMahadasha === 'all' || row.mahadashaKey === selectedMahadasha)
    && (selectedBhukti === 'all' || row.bhuktiKey === selectedBhukti));

  return <>
    <PageHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
    <div className="content-card">
      <form className="form-grid" onSubmit={submit}>
        <label className="span-two location-field">
          {t.place}
          <input
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={matches.length > 0}
            placeholder={t.placeHint}
            value={placeQuery}
            onChange={(event) => {
              setPlaceQuery(event.target.value);
              setSelectedPlace(null);
              setChart(null);
            }}
          />
          {searching && <small className="field-help">{t.searching}</small>}
          {selectedPlace && <small className="field-help selected-location">✓ {selectedPlace.label} · {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}</small>}
          {matches.length > 0 && <div className="location-results" role="listbox">{matches.map((place, index) => <button type="button" role="option" className="location-option" key={place.id || `${placeName(place)}-${index}`} onClick={() => choosePlace(place)}><b>{placeName(place) || 'Unnamed location'}</b><small>{[place.region, place.country].filter(Boolean).join(', ')}</small></button>)}</div>}
          {searchError && <small className="field-error">{searchError}</small>}
          {!searching && placeQuery.trim().length >= 2 && !selectedPlace && !matches.length && !searchError && <small className="field-help">{t.noResults}</small>}
          {!selectedPlace && <small className="field-help">{t.choose}</small>}
        </label>
        <label className="span-two">{t.date}<input required type="datetime-local" value={birthDatetime} onChange={(event) => setBirthDatetime(event.target.value)} /></label>
        {selectedPlace && <><label>{t.latitude}<input readOnly value={selectedPlace.latitude} /></label><label>{t.longitude}<input readOnly value={selectedPlace.longitude} /></label></>}
        <button disabled={busy || !selectedPlace || !birthDatetime} className="primary-button span-two">{busy ? t.busy : t.submit}<span>↗</span></button>
      </form>
      {error && <p className="page-error" role="alert">{error}</p>}
      {chart && <>
        <div className="chart-summary">{results.map(([label, value]) => <div className="chart-result" key={label}><small>{label}</small><strong>{value || '—'}</strong></div>)}</div>
        <section className="content-card nested voice-question-card">
          <div className="card-title"><div><span className="section-kicker">VOICE ASTROLOGY</span><h3>Ask a question</h3></div></div>
          <form className="form-grid" onSubmit={askByVoice}>
            <label className="span-two">Your question<textarea required minLength={3} maxLength={1000} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your chart…" /></label>
            <button className="primary-button span-two" disabled={answerBusy}>{answerBusy ? 'Preparing your spoken answer…' : 'Get spoken answer'}<span>↗</span></button>
          </form>
          {answerError && <p className="page-error" role="alert">{answerError}</p>}
          {spokenAnswer && <div className="voice-answer"><p>{spokenAnswer.answer}</p><audio controls autoPlay src={spokenAnswer.audioUrl} /></div>}
        </section>
        <ChartDiagram title="RASI CHART" chart={chart.rasi_chart} style={chartStyle} onStyleChange={setChartStyle} labels={{ house: t.house, lagna: t.ascendant, center: 'Birth chart' }} />
        <ChartDiagram title="NAVAMSA (D9)" chart={chart.navamsa_chart} style={chartStyle} onStyleChange={setChartStyle} labels={{ house: t.house, lagna: t.ascendant, center: 'Navamsa (D9)' }} />
        <section className="content-card nested">
          <div className="card-title"><div><span className="section-kicker">{t.positions}</span><h3>{t.planets}</h3></div></div>
          <DataTable
            columns={[
              { key: 'name', label: 'Planet' },
              { key: 'sign', label: 'Sign' },
              { key: 'degree', label: 'Degree' },
              { key: 'house', label: t.house },
            ]}
            rows={(chart.planets || []).map((planet) => ({
              id: planet.name,
              name: planet.name_display || planet.name,
              sign: planet.rasi_display || planet.rasi,
              degree: formatDegree(planet.longitude),
              house: planet.house ?? '—',
            }))}
          />
        </section>
        {chart.dasha && <section className="content-card nested">
          <div className="card-title"><div><span className="section-kicker">VIMSHOTTARI DASHA</span><h3>Mahadasha and Bhukti timeline</h3></div></div>
          <p className="dasha-summary"><strong>Birth Mahadasha:</strong> {chart.dasha.birth_mahadasha_display || chart.dasha.birth_mahadasha} <span>·</span> <strong>Balance at birth:</strong> {chart.dasha.balance_years_at_birth} years</p>
          <small className="field-help dasha-convention">Includes all nine Bhuktis (Antardashas) in each of the nine Mahadashas. Dates use a {chart.dasha.year_days}-day Vimshottari year.</small>
          <div className="dasha-filters">
            <label>Mahadasha
              <select value={selectedMahadasha} onChange={(event) => { setSelectedMahadasha(event.target.value); setSelectedBhukti('all'); }}>
                <option value="all">All Mahadashas</option>
                {mahadashas.map((major) => <option value={major.lord} key={major.lord}>{major.lord_display || major.lord}</option>)}
              </select>
            </label>
            <label>Bhukti
              <select value={selectedBhukti} onChange={(event) => setSelectedBhukti(event.target.value)}>
                <option value="all">All Bhuktis</option>
                {bhuktiOptions.map((period) => <option value={period.lord} key={period.lord}>{period.lord_display || period.lord}</option>)}
              </select>
            </label>
          </div>
          <DataTable
            columns={[
              { key: 'mahadasha', label: 'Mahadasha' },
              { key: 'bhukti', label: 'Bhukti / Antardasha' },
              { key: 'start', label: 'From' },
              { key: 'end', label: 'To' },
              { key: 'duration', label: 'Years' },
              { key: 'status', label: 'Status' },
            ]}
            rows={dashaRows}
            empty="No Bhukti periods match these filters."
          />
        </section>}
      </>}
    </div>
  </>;
}
