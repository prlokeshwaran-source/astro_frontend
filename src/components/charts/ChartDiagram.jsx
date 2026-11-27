const SIGN_POSITIONS = [
  [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3],
  [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0],
];

const NORTH_HOUSE_POSITIONS = [
  [50, 17], [25, 17], [16, 37], [16, 63], [25, 83], [50, 83],
  [75, 83], [84, 63], [84, 37], [75, 17], [50, 37], [50, 63],
];

function cellContent(house, chart, labels) {
  const occupants = chart.planets?.filter((planet) => planet.house === house.house) || [];
  const names = occupants.map((planet) => planet.name_display || planet.name).join(' · ');
  return { sign: house.rasi_display || house.rasi, names, isLagna: house.house === 1 };
}

function SouthIndianChart({ chart, labels }) {
  const housesBySign = new Map((chart.houses || []).map((house) => [house.rasi, house]));
  const planetsBySign = new Map();
  for (const planet of chart.planets || []) {
    const planets = planetsBySign.get(planet.rasi) || [];
    planets.push(planet.name_display || planet.name);
    planetsBySign.set(planet.rasi, planets);
  }

  return <div className="south-chart" role="img" aria-label="South Indian chart">
    {SIGN_POSITIONS.map(([row, col], signIndex) => {
      const key = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][signIndex];
      const displayHouse = housesBySign.get(key);
      const displaySign = displayHouse?.rasi_display || key;
      const occupantNames = planetsBySign.get(key) || [];
      return <div className="south-chart-cell" style={{ gridRow: row + 1, gridColumn: col + 1 }} key={key}>
        <small>{displaySign}</small>
        {displayHouse?.house === 1 && <b className="chart-lagna">Lagna</b>}
        <span>{occupantNames.join(' · ') || '—'}</span>
      </div>;
    })}
    <div className="south-chart-center"><small>{labels.center}</small><strong>{chart.lagna_display || chart.lagna}</strong><span>{labels.lagna}</span></div>
  </div>;
}

function NorthIndianChart({ chart, labels }) {
  return <div className="north-chart">
    <svg className="north-chart-lines" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="1" y="1" width="98" height="98" />
      <path d="M1 1 L99 99 M99 1 L1 99 M50 1 L99 50 L50 99 L1 50 Z" />
    </svg>
    {(chart.houses || []).map((house, index) => {
      const { sign, names, isLagna } = cellContent(house, chart, labels);
      const [x, y] = NORTH_HOUSE_POSITIONS[index];
      return <div className="north-chart-cell" key={house.house} style={{ left: x + '%', top: y + '%' }}>
        <small>{labels.house} {house.house} · {sign}</small>
        {isLagna && <b className="chart-lagna">Lagna</b>}
        <span>{names || '—'}</span>
      </div>;
    })}
  </div>;
}

export default function ChartDiagram({ title, chart, style, onStyleChange, labels }) {
  if (!chart?.houses || !chart?.planets) return null;
  return <section className="content-card nested chart-diagram-card">
    <div className="card-title chart-diagram-heading">
      <div><span className="section-kicker">{title}</span><h3>{chart.lagna_display || chart.lagna} {labels.lagna}</h3></div>
      <div className="chart-style-toggle" role="group" aria-label="Chart style">
        <button type="button" className={style === 'south' ? 'active' : ''} onClick={() => onStyleChange('south')}>South Indian</button>
        <button type="button" className={style === 'north' ? 'active' : ''} onClick={() => onStyleChange('north')}>North Indian</button>
      </div>
    </div>
    {style === 'south' ? <SouthIndianChart chart={chart} labels={labels} /> : <NorthIndianChart chart={chart} labels={labels} />}
  </section>;
}
