import { useLanguage } from '../../contexts/LanguageContext';

const userLinks = [['dashboard', 'Overview'], ['chart', 'Birth chart'], ['astrologers', 'Find an astrologer'], ['consultations', 'Consultations'], ['chat', 'Messages'], ['calls', 'Calls'], ['payments', 'Payments'], ['reviews', 'Reviews'], ['reports', 'Reports'], ['complaints', 'Support'], ['profile', 'My profile'], ['apply', 'Become an astrologer']];
const astrologerLinks = [['dashboard', 'Overview'], ['chart', 'Birth chart'], ['consultations', 'Consultations'], ['chat', 'Messages'], ['calls', 'Calls'], ['reports', 'Reports'], ['profile', 'My profile']];
const adminLinks = [['dashboard', 'Overview'], ['approvals', 'Astrologer approvals'], ['users', 'Users'], ['complaints', 'Complaints']];
const mobileUserLinks = [['dashboard', 'Home', '\u2302'], ['astrologers', 'Astrologers', '\u263c'], ['chart', 'Birth Chart', '\u2727'], ['chat', 'Chat', '\u25cc'], ['profile', 'Profile', '\u25cb']];
const mobileAstrologerLinks = [['dashboard', 'Home', '\u2302'], ['consultations', 'Sessions', '\u25f7'], ['chart', 'Birth Chart', '\u2727'], ['chat', 'Chat', '\u25cc'], ['profile', 'Profile', '\u25cb']];
const mobileAdminLinks = [['dashboard', 'Home', '\u2302'], ['approvals', 'Approvals', '\u2713'], ['users', 'Users', '\u2659'], ['complaints', 'Support', '\u2661'], ['profile', 'Profile', '\u25cb']];
const glyphs = { dashboard: '\u2302', chart: '\u2727', astrologers: '\u263c', consultations: '\u25f7', chat: '\u25cc', calls: '\u260e', payments: '\u25c7', reviews: '\u2605', reports: '\u25a4', complaints: '\u2661', profile: '\u25cb', apply: '\u2726', approvals: '\u2713', users: '\u2659' };

export default function AppNavigation({ role, page, onNavigate, user, onSignOut }) {
  const { t } = useLanguage();
  const isAdmin = role === 'ADMIN';
  const isAstrologer = role === 'ASTROLOGER';
  const links = isAdmin ? adminLinks : isAstrologer ? astrologerLinks : userLinks;
  const mobileLinks = isAdmin ? mobileAdminLinks : isAstrologer ? mobileAstrologerLinks : mobileUserLinks;
  return <aside className="app-sidebar">
    <a className="brand" href="#home"><img className="brand-logo" src="/astro-logo.svg" alt="" /> astra<span className="brand-dot">.</span></a>
    <span className="sidebar-label">{t('WORKSPACE')}</span>
    <nav className="desktop-navigation" aria-label={t('Main navigation')}>
      {links.map(([id, label]) => <button key={id} className={`nav-link ${page === id ? 'selected' : ''}`} onClick={() => onNavigate(id)}>
        <span className="nav-glyph">{glyphs[id]}</span>{t(label)}
      </button>)}
    </nav>
    <nav className="mobile-bottom-nav" aria-label={t('Main navigation')}>
      {mobileLinks.map(([id, label, glyph]) => <button key={id} aria-label={t(label)} title={t(label)} className={`mobile-nav-link ${page === id ? 'selected' : ''}`} onClick={() => onNavigate(id)}>
        <span>{glyph}</span><small>{t(label)}</small>
      </button>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="user-chip"><span className="avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</span><span><b>{user?.name || 'Account'}</b><small>{role || 'USER'}</small></span></div>
      <button className="quiet-button" onClick={onSignOut}>{t('Sign out')}</button>
    </div>
  </aside>;
}
