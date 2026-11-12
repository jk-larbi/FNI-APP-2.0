import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, UserRound, Mail, LockKeyhole } from 'lucide-react';

type DemoIdentity = { name: string; email: string; role: 'member' | 'admin' };
type Props = { onAuthenticated: (identity: DemoIdentity) => void };

const USERS_KEY = 'fni-demo-users-v1';
const SESSION_KEY = 'fni-demo-session-v1';

export function readFniDemoSession(): DemoIdentity | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) as DemoIdentity : null;
  } catch { return null; }
}

export function clearFniDemoSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function AuthGate({ onAuthenticated }: Props) {
  const [screen, setScreen] = useState<'splash' | 'welcome' | 'signup' | 'login' | 'admin'>('splash');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const logoSrc = 'https://raw.githubusercontent.com/jk-larbi/FNI-Cells-Connect/main/public/fni-official-logo.jpg';

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('welcome'), 2100);
    return () => window.clearTimeout(timer);
  }, []);

  function enter(identity: DemoIdentity) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(identity));
    onAuthenticated(identity);
  }

  function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail || password.length < 6) {
      setError('Enter your full name, email and a password of at least 6 characters.');
      return;
    }
    const users: Array<{ name: string; email: string; password: string }> = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.some(user => user.email === cleanEmail)) {
      setError('An account with this email already exists on this device. Please log in.');
      return;
    }
    users.push({ name: cleanName, email: cleanEmail, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    enter({ name: cleanName, email: cleanEmail, role: 'member' });
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const users: Array<{ name: string; email: string; password: string }> = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const match = users.find(user => user.email === cleanEmail && user.password === password);
    if (!match) {
      setError('We could not find a matching demo account on this device. Create an account first.');
      return;
    }
    enter({ name: match.name, email: match.email, role: 'member' });
  }

  function adminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (email.trim().toLowerCase() === 'fniadmin@gmail.com' && password === 'admin123') enter({ name: 'FNI Administrator', email: 'fniadmin@gmail.com', role: 'admin' });
      else setError('Administrator email or password is incorrect.');
    }, 450);
  }

  const go = (next: typeof screen) => { setError(''); setPassword(''); setScreen(next); };

  if (screen === 'splash') return <main className="fni-auth-splash">
    <div className="fni-splash-glow" />
    <div className="fni-splash-content">
      <div className="fni-logo-frame"><img src={logoSrc} alt="Forerunners Network International logo" /></div>
      <div className="fni-splash-wordmark">FNI APP</div>
      <p className="fni-splash-meaning">Forerunners Network International</p>
      <div className="fni-splash-loader"><span /></div>
    </div>
  </main>;

  return <main className="fni-auth-page">
    <div className="fni-auth-backdrop" />
    <section className="fni-auth-card">
      {screen === 'signup' ? <div className="fni-signup-motion" aria-hidden="true"><div className="fni-signup-orbit fni-orbit-one"/><div className="fni-signup-orbit fni-orbit-two"/><span className="fni-signup-particle fni-particle-one"/><span className="fni-signup-particle fni-particle-two"/><span className="fni-signup-particle fni-particle-three"/><div className="fni-signup-mark"><img src={logoSrc} alt=""/></div></div> : <div className="fni-auth-brand"><div className="fni-auth-logo"><img src={logoSrc} alt="FNI ministry logo" /></div><div><strong>FNI</strong><span>Forerunners Network International</span></div></div>}
      {screen === 'welcome' ? <>
        <div className="fni-auth-welcome"><span className="fni-auth-eyebrow">WELCOME TO FNI</span><h1>Faith. Fellowship.<br/><em>Forward together.</em></h1><p>Your ministry community, conversations and spiritual growth—connected in one place.</p></div>
        <div className="fni-auth-actions">
          <button className="fni-auth-primary" onClick={() => go('signup')}>Create account <span>→</span></button>
          <button className="fni-auth-secondary" onClick={() => go('login')}>Log in to FNI</button>
        </div>
        <button className="fni-admin-entry" onClick={() => go('admin')}><span><ShieldCheck size={17}/></span><div><strong>Login as administrator</strong><small>Authorised ministry management access</small></div><b>→</b></button>
        <p className="fni-auth-legal">By continuing, you agree to use FNI respectfully and in accordance with ministry guidelines.</p>
      </> : <>
        <button className="fni-auth-back" onClick={() => go('welcome')}><ArrowLeft size={17}/> Back</button>
        <div className="fni-auth-heading"><span className="fni-auth-eyebrow">{screen === 'signup' ? 'JOIN THE COMMUNITY' : screen === 'login' ? 'WELCOME BACK' : 'RESTRICTED ACCESS'}</span>
          <h1>{screen === 'signup' ? 'Create your account' : screen === 'login' ? 'Log in to FNI' : 'Administrator login'}</h1>
          <p>{screen === 'signup' ? 'A place to connect, grow and serve together.' : screen === 'login' ? 'Continue where you left off.' : 'Sign in to manage the FNI ministry platform.'}</p></div>
        <form className="fni-auth-form" onSubmit={screen === 'signup' ? signup : screen === 'login' ? login : adminLogin}>
          {screen === 'signup' && <label>Full name<div className="fni-auth-input"><UserRound size={18}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" autoComplete="name" required/></div></label>}
          <label>Email address<div className="fni-auth-input"><Mail size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" required/></div></label>
          <label>{screen === 'admin' ? 'Administrator password' : 'Password'}<div className="fni-auth-input"><LockKeyhole size={18}/><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={screen === 'admin'?'Enter administrator password':'At least 6 characters'} autoComplete={screen==='login'?'current-password':'new-password'} required/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
          {error && <div className="fni-auth-error" role="alert">{error}</div>}
          <button className="fni-auth-primary" type="submit" disabled={busy}>{busy?'Checking access…':screen==='signup'?'Create account':screen==='login'?'Log in':'Access administration'} <span>→</span></button>
        </form>
        {screen === 'signup' ? <><p className="fni-auth-switch">Already part of FNI? <button onClick={()=>go('login')}>Log in</button></p><button className="fni-auth-secondary fni-demo-bypass" type="button" onClick={() => enter({ name: 'FNI Guest', email: 'guest@fni.demo', role: 'member' })}>Explore FNI demo <span>→</span></button><p className="fni-auth-legal">Explore the app without creating an account. Demo activity is stored only on this device.</p></> : screen === 'login' ? <p className="fni-auth-switch">New to FNI? <button onClick={()=>go('signup')}>Create an account</button></p> : <div className="fni-demo-hint"><ShieldCheck size={15}/> Demo administrator: <strong>fniadmin@gmail.com / admin123</strong></div>}
      </>}
      <div className="fni-auth-foot"><span>FNI CONNECT</span><i/> <span>COMMUNITY • FAITH • PURPOSE</span></div>
    </section>
    <span className="fni-auth-copyright">© Forerunners Network International</span>
  </main>;
}
