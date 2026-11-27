import { useState } from 'react';
import { authApi } from './api/authApi';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import AppNavigation from './components/navigation/AppNavigation';
import DashboardPage from './pages/DashboardPage';
import BirthChartPage from './pages/BirthChartPage';
import AstrologersPage from './pages/AstrologersPage';
import AstrologerApplicationPage from './pages/AstrologerApplicationPage';
import ConsultationsPage from './pages/ConsultationsPage';
import ChatPage from './pages/ChatPage';
import CallsPage from './pages/CallsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import ReviewsPage from './pages/ReviewsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import AstrologerApprovalsPage from './pages/admin/AstrologerApprovalsPage';
import UsersPage from './pages/admin/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

function AuthScreen() {
  const { signIn } = useAuth(); const { language, languages, changeLanguage, t } = useLanguage();
  const [mode,setMode]=useState('login');const [form,setForm]=useState({name:'',email:'',mobile:'',password:''});const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [showPassword,setShowPassword]=useState(false);
  const change=(e)=>setForm({...form,[e.target.name]:e.target.value});
  const fillAdminLogin=()=>{setMode('login');setForm({...form,email:import.meta.env.VITE_ADMIN_EMAIL||'',password:import.meta.env.VITE_ADMIN_PASSWORD||''});setError('');};
  const submit=async(e)=>{e.preventDefault();setBusy(true);setError('');try{if(mode==='register'){await authApi.register({...form,preferred_language:language});}await signIn({email:form.email,password:form.password});}catch(err){setError(err.message);}finally{setBusy(false);}};
  return <main className={`auth-screen${language === 'ta' ? ' language-ta' : ''}`} lang={language}><header className="auth-topbar"><a className="brand" href="#home"><img className="brand-logo" src="/astro-logo.svg" alt="" /> astra<span className="brand-dot">.</span></a><select aria-label={t('Language')} value={language} onChange={e=>changeLanguage(e.target.value).catch(err=>setError(err.message))}>{Object.entries(languages).map(([code,name])=><option value={code} key={code}>{name}</option>)}</select></header><section className="auth-hero"><div className="auth-copy"><span className="eyebrow"><span className="eyebrow-line"/> {t('A CALMER WAY TO FIND YOUR DIRECTION')}</span><h1>{t('Your stars,')}<br/>{t('understood.')}</h1><p>{t('Explore your birth chart and connect with trusted astrologers, all in one thoughtful space.')}</p><div className="hero-note"><span className="note-icon">✧</span><span>{t('Personal insight, rooted in your birth details')}<br/><small>{t('Thoughtfully made for your next chapter')}</small></span></div></div><div className="auth-card"><div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');}}>{t('Sign in')}</button><button className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('');}}>{t('Create account')}</button></div><form className="form-grid" onSubmit={submit}>{mode==='register'&&<><label className="span-two">{t('Full name')}<input name="name" autoComplete="name" required value={form.name} onChange={change}/></label><label className="span-two">{t('Mobile number')}<input name="mobile" autoComplete="tel" required value={form.mobile} onChange={change}/></label></>}<label className="span-two">{t('Email address')}<input name="email" type="email" autoComplete="email" required value={form.email} onChange={change}/></label><label className="span-two">{t('Password')}<span className="password-field"><input name="password" type={showPassword?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} required value={form.password} onChange={change}/><button className="password-toggle" type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?t('Hide password'):t('Show password')} aria-pressed={showPassword}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{showPassword?<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>:<><path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.2 3.9M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>}</svg></button></span></label><button className="primary-button span-two" disabled={busy}>{busy?t('Please wait…'):mode==='login'?t('Sign in'):t('Create account')}<span>↗</span></button></form>{import.meta.env.DEV&&import.meta.env.VITE_ADMIN_EMAIL&&import.meta.env.VITE_ADMIN_PASSWORD&&<button type="button" className="inline-action" onClick={fillAdminLogin}>Use admin login</button>}{error&&<p className="page-error" role="alert">{error}</p>}<p className="auth-footnote">{t('Your details are used to personalize your astrology experience.')}</p></div></section><footer><span>astra<span className="brand-dot">.</span></span><span>{t('Made for a more mindful tomorrow')} <b>✳</b></span></footer></main>;
}

export default function App() {
  const {user,tokens,loading,signOut}=useAuth();const {language,changeLanguage,t}=useLanguage();const [page,setPage]=useState('dashboard');const [selectedAstrologer,setSelectedAstrologer]=useState(null);const [languageError,setLanguageError]=useState('');const role=user?.role||'USER';
  if(loading)return <div className="full-loading">{t('Preparing your astrology space…')}</div>;
  if(!user)return <AuthScreen/>;
  const navigate=(target)=>setPage(target);
  const props={token:tokens?.access_token,user,role,navigate};
  const pages={
    dashboard:<DashboardPage {...props}/>,chart:<BirthChartPage {...props}/>,astrologers:<AstrologersPage onBook={(person)=>{setSelectedAstrologer(person);setPage('consultations');}}/>,
    apply:<AstrologerApplicationPage {...props}/>,consultations:<ConsultationsPage {...props} selectedAstrologer={selectedAstrologer} clearSelection={()=>setSelectedAstrologer(null)}/>,
    chat:<ChatPage {...props}/>,calls:<CallsPage {...props}/>,payments:<PaymentsPage {...props}/>,reviews:<ReviewsPage {...props}/>,reports:<ReportsPage {...props}/>,complaints:<ComplaintsPage {...props}/>,profile:<ProfilePage {...props}/>,
    approvals:<AstrologerApprovalsPage {...props}/>,users:<UsersPage {...props}/>,
  };
  return <div className={`application role-${role.toLowerCase()}${language === 'ta' ? ' language-ta' : ''}`} lang={language}><AppNavigation role={role} page={page} onNavigate={navigate} user={user} onSignOut={signOut}/><main className="main-panel"><header className="main-topbar"><span>✦ &nbsp; {t('Your personal astrology space')}</span><div className="main-topbar-actions"><label className="language-picker"><span className="sr-only">Language</span><select value={language} onChange={e=>changeLanguage(e.target.value).catch(err=>setLanguageError(err.message))}><option value="en">English</option><option value="ta">தமிழ்</option><option value="hi">हिन्दी</option></select></label><span><i className="live-indicator"/> {t('Connected')}</span><button className="mobile-sign-out" onClick={signOut}>{t('Sign out')}</button></div></header>{languageError&&<p className="page-error language-error">{languageError}</p>}<section className={`page-content page-${page}`}>{pages[page]||<NotFoundPage onHome={()=>navigate('dashboard')}/>}</section><footer className="app-footer"><span>astra<span className="brand-dot">.</span></span><span>{t('Made for a more mindful tomorrow')} <b>&#10022;</b></span></footer></main></div>;
}
