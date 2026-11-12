import { useState } from 'react';
import { Menu, Search, Plus, MessageCircle, Users, Phone, Settings, ChevronDown, X } from 'lucide-react';

type Section = 'Chats' | 'Contacts' | 'Calls' | 'Settings';
type Folder = 'All chats' | 'Personal' | 'Groups';

export default function App() {
  const [section, setSection] = useState<Section>('Chats');
  const [folder, setFolder] = useState<Folder>('All chats');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const navigation = [
    { label: 'Chats' as const, icon: MessageCircle },
    { label: 'Contacts' as const, icon: Users },
    { label: 'Calls' as const, icon: Phone },
    { label: 'Settings' as const, icon: Settings },
  ];

  return (
    <main className="app-shell">
      <aside className={`navigation-drawer ${menuOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-heading">
          <div className="brand-lockup">
            <img src="/FNI-APP-2.0/fni-logo.jpg" alt="FNI" />
            <div><strong>FNI</strong><span>Forerunners Network International</span></div>
          </div>
          <button className="icon-button drawer-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X /></button>
        </div>
        <div className="profile-summary">
          <div className="profile-avatar">F</div>
          <div className="profile-copy"><strong>FNI Member</strong><span><i /> Online</span></div>
          <ChevronDown size={17} />
        </div>
        <nav className="main-navigation" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={section === label ? 'nav-item active' : 'nav-item'} onClick={() => { setSection(label); setMenuOpen(false); }}>
              <Icon size={20} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="drawer-footer"><span className="footer-dot" /> FNI Connect <span className="version">Preview</span></div>
      </aside>

      {menuOpen && <button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <section className="chat-list-panel">
        <header className="list-header">
          <div className="list-title-row">
            <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></button>
            <div><h1>{section}</h1><p>FORERUNNERS NETWORK INTERNATIONAL</p></div>
            <button className="icon-button new-chat-button" aria-label="New message" title="New message"><Plus /></button>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people, @usernames, messages..." />
          </label>
          {section === 'Chats' && (
            <div className="folder-tabs" role="tablist" aria-label="Chat folders">
              {(['All chats', 'Personal', 'Groups'] as Folder[]).map((item) => (
                <button key={item} role="tab" aria-selected={folder === item} className={folder === item ? 'folder-tab selected' : 'folder-tab'} onClick={() => setFolder(item)}>{item}</button>
              ))}
            </div>
          )}
        </header>
        <div className="empty-list">
          <div className="empty-icon"><MessageCircle size={27} strokeWidth={1.5} /></div>
          <h2>{search ? 'No matches found' : section === 'Chats' ? 'No conversations yet' : section === 'Contacts' ? 'Your contacts will appear here' : section === 'Calls' ? 'No recent calls' : 'Your settings will appear here'}</h2>
          <p>{search ? 'Try another name or keyword.' : 'When you connect with people on FNI, you will find them here.'}</p>
        </div>
      </section>

      <section className="conversation-panel">
        <div className="conversation-topbar">
          <span className="topbar-label">FNI CONNECT</span>
          <div className="topbar-actions"><span className="secure-indicator"><i /> Connected</span></div>
        </div>
        <div className="welcome-state">
          <div className="welcome-logo"><img src="/FNI-APP-2.0/fni-logo.jpg" alt="Forerunners Network International logo" /></div>
          <h2>Stay connected.</h2>
          <p>Your conversations, community and ministry connections in one place.</p>
          <span className="welcome-caption">FORERUNNERS NETWORK INTERNATIONAL</span>
        </div>
        <div className="conversation-footer">Select a conversation to start messaging</div>
      </section>
    </main>
  );
}