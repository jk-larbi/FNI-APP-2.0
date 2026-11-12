import { useMemo, useState } from 'react';
import {
  Bell, Bookmark, CalendarDays, ChevronDown, CircleHelp, Compass,
  Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, Users, Video, X
} from 'lucide-react';

type Section = 'chats' | 'community' | 'cells' | 'meetings';

const sections: { id: Section; label: string; icon: typeof MessageCircle }[] = [
  { id: 'chats', label: 'Chats', icon: MessageCircle },
  { id: 'community', label: 'Community', icon: Compass },
  { id: 'cells', label: 'Cell groups', icon: Users },
  { id: 'meetings', label: 'Meetings', icon: Video },
];

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">F</div>
      <div className="brand-copy"><strong>FNI</strong><span>Forerunners Network International</span></div>
    </div>
  );
}

function App() {
  const [section, setSection] = useState<Section>('chats');
  const [folder, setFolder] = useState('All chats');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const current = useMemo(() => sections.find(item => item.id === section)!, [section]);

  function comingSoon(feature: string) {
    setNotice(feature + ' will be available when FNI accounts and the backend are connected.');
    window.setTimeout(() => setNotice(''), 3200);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand />
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(v => !v)}><Menu size={20} /></button>
          <button className="icon-button desktop-more" aria-label="More options" onClick={() => setMenuOpen(v => !v)}><MoreHorizontal size={21} /></button>
        </div>

        {menuOpen && <div className="account-menu">
          <button onClick={() => comingSoon('Profile settings')}><Settings size={16} /> Settings</button>
          <button onClick={() => comingSoon('Notifications')}><Bell size={16} /> Notifications</button>
          <button onClick={() => comingSoon('Help centre')}><CircleHelp size={16} /> Help centre</button>
        </div>}

        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {sections.map(item => {
            const Icon = item.icon;
            return <button key={item.id} className={section === item.id ? 'nav-item active' : 'nav-item'} onClick={() => { setSection(item.id); setMenuOpen(false); }}>
              <Icon size={19} strokeWidth={1.8} /><span>{item.label}</span>
            </button>;
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="ministry-card">
            <div className="ministry-icon"><ShieldCheck size={18} /></div>
            <div><strong>FNI Connect</strong><span>Your community, together.</span></div>
          </div>
          <button className="profile-row" onClick={() => comingSoon('Your profile')}>
            <div className="profile-avatar">F</div>
            <div className="profile-copy"><strong>FNI Member</strong><span>Account setup pending</span></div>
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-title">
            <span className="eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span>
            <h1>{section === 'chats' ? 'Messages' : current.label}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => comingSoon('Notifications')}><Bell size={19} /></button>
            <button className="new-button" onClick={() => comingSoon(section === 'chats' ? 'New conversation' : 'Create ' + current.label.toLowerCase())}><Plus size={17} /><span>{section === 'chats' ? 'New message' : 'Create new'}</span></button>
          </div>
        </header>

        <div className="content">
          <div className="welcome-line">
            <div><h2>{section === 'chats' ? 'Stay connected.' : section === 'community' ? 'Find your community.' : section === 'cells' ? 'Grow together.' : 'Meet in fellowship.'}</h2>
              <p>{section === 'chats' ? 'Conversations and updates from your FNI community.' : section === 'community' ? 'A place for fellowship, updates and shared life.' : section === 'cells' ? 'Your cell groups, leaders and small-group life.' : 'Gather online for services, prayer and meetings.'}</p>
            </div>
          </div>

          {section === 'chats' && <>
            <div className="search-bar"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people, groups or messages" aria-label="Search people, groups or messages" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}</div>
            <div className="folder-row" role="tablist" aria-label="Chat filters">
              {['All chats', 'Personal', 'Groups'].map(item => <button role="tab" aria-selected={folder === item} key={item} className={folder === item ? 'folder active' : 'folder'} onClick={() => setFolder(item)}>{item}</button>)}
            </div>
          </>}

          <section className="empty-panel">
            <div className="empty-art">
              {section === 'chats' ? <MessageCircle size={27} /> : section === 'community' ? <Compass size={27} /> : section === 'cells' ? <Users size={27} /> : <CalendarDays size={27} />}
            </div>
            <span className="empty-kicker">{section === 'chats' ? 'YOUR CONVERSATIONS' : section === 'community' ? 'FNI COMMUNITY' : section === 'cells' ? 'CELL GROUPS' : 'FELLOWSHIP MEETINGS'}</span>
            <h3>{section === 'chats' ? 'Your conversations will appear here' : section === 'community' ? 'Your community is getting ready' : section === 'cells' ? 'Your cell groups will appear here' : 'No meetings to show yet'}</h3>
            <p>{section === 'chats' ? 'When your FNI account is connected, you can message members, join group conversations and keep up with announcements.' : section === 'community' ? 'Community spaces and ministry updates will be available once your account is connected.' : section === 'cells' ? 'Approved cell groups, meeting schedules, prayer rooms and group resources will be shown here.' : 'Scheduled services, live meetings and meeting history will be available here.'}</p>
            <div className="setup-note"><span className="status-dot" /> Frontend ready <span className="note-divider">·</span> Account and backend connection comes next</div>
          </section>

          <div className="bottom-note"><Bookmark size={15} /><span>FNI is a private space for fellowship, growth and service.</span></div>
        </div>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {sections.map(item => {
            const Icon = item.icon;
            return <button key={item.id} className={section === item.id ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setSection(item.id)}><Icon size={19} /><span>{item.label === 'Cell groups' ? 'Cells' : item.label}</span></button>;
          })}
        </nav>
      </main>
      {notice && <div className="toast" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}><X size={15} /></button></div>}
    </div>
  );
}

export default App;
