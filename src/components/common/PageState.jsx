export function PageState({ loading, error, empty, children }) {
  if (loading) return <div className="page-state">Loading…</div>;
  if (error) return <div className="page-error" role="alert">{error}</div>;
  if (empty) return <div className="page-state">{empty}</div>;
  return children;
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function DataTable({ columns, rows, empty = 'Nothing here yet.' }) {
  if (!rows?.length) return <div className="page-state">{empty}</div>;
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : (row[column.key] ?? '—')}</td>)}</tr>)}</tbody></table></div>;
}
