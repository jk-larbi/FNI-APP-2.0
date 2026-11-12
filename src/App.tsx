import { useState } from 'react';
import { Menu, Search, Plus, MessageCircle, Users, Phone, Settings, ChevronDown, X, ArrowLeft, Send, Paperclip, Smile, MoreVertical, Video, PhoneCall } from 'lucide-react';

type Section = 'Chats' | 'Contacts' | 'Calls' | 'Settings';
type Folder = 'All chats' | 'Personal' | 'Groups';
type Message = { id: number; text: string; time: string; replyTo?: string };

export default function App() {
  const [section, setSection] = useState<Section>('Chats');
  const [folder, setFolder] = useState<Folder>('All chats');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [activeChat, setActiveChat] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);\n  const [replyTo, setReplyTo] = useState<Message | null>(null);\n  const [openMessageMenu, setOpenMessageMenu] = useState<number | null>(null);

  const navigation = [
    { label: 'Chats' as const, icon: MessageCircle },
    { label: 'Contacts' as const, icon: Users },
    { label: 'Calls' as const, icon: Phone },
    { label: 'Settings' as const, icon: Settings },
  ];

  const startChat = () => {
    const handle = username.trim().replace(/^@/, '');
    if (!handle) return;
    setActiveChat(handle.startsWith('@') ? handle : `@${handle}`);
    setNewChatOpen(false);
    setUsername('');
    setMessages([]);
  };

  const sendMessage = () => {
    const value = draft.trim();
    if (!value) return;
    setMessages((current) => [...current, { id: Date.now(), text: value, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setDraft('');
  };

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
            <button key={label} className={section === label ? 'nav-item active' : 'nav-item'} onClick={() => { setSection(label); setActiveChat(''); setMenuOpen(false); }}>
              <Icon size={20} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="drawer-footer"><span className="footer-dot" /> FNI Connect <span className="version">Preview</span></div>
      </aside>

      {menuOpen && <button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <section className={`chat-list-panel ${activeChat ? 'list-hidden-mobile' : ''}`}>
        <header className="list-header">
          <div className="list-title-row">
            <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></button>
            <div><h1>{section}</h1><p>FORERUNNERS NETWORK INTERNATIONAL</p></div>
            <button className="icon-button new-chat-button" aria-label="New message" title="New message" onClick={() => setNewChatOpen(true)}><Plus /></button>
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
          {section === 'Chats' && <button className="start-chat-button" onClick={() => setNewChatOpen(true)}>Start a conversation</button>}
        </div>
      </section>

      <section className={`conversation-panel ${activeChat ? 'conversation-active' : ''}`}>
        {activeChat ? (
          <>
            <header className="active-chat-header">
              <button className="icon-button chat-back-button" aria-label="Back to chats" onClick={() => setActiveChat('')}><ArrowLeft /></button>
              <div className="chat-person-avatar">{activeChat.replace('@','').slice(0,1).toUpperCase()}</div>
              <div className="chat-person-details"><strong>{activeChat}</strong><span>FNI member</span></div>
              <div className="active-chat-actions">
                <button className="icon-button" aria-label="Voice call"><PhoneCall /></button>
                <button className="icon-button" aria-label="Video call"><Video /></button>
                <button className="icon-button" aria-label="More options"><MoreVertical /></button>
              </div>
            </header>
            <div className="message-history">
              {messages.length === 0 ? (
                <div className="first-message-note"><span>Conversation started</span><p>Send a message to begin.</p></div>
              ) : messages.map((message) => (
                <div className="message-row outgoing" key={message.id}>
                  <div className="message-action-wrap">
                    <button className="message-more-button" aria-label="Message actions" onClick={() => setOpenMessageMenu(openMessageMenu === message.id ? null : message.id)}><MoreVertical size={17} /></button>
                    {openMessageMenu === message.id && <div className="message-action-menu">
                      <button onClick={() => { setReplyTo(message); setOpenMessageMenu(null); }}>Reply</button>
                      <button onClick={() => { void navigator.clipboard?.writeText(message.text); setOpenMessageMenu(null); }}>Copy text</button>
                      <button className="delete-action" onClick={() => { setMessages((current) => current.filter((item) => item.id !== message.id)); setOpenMessageMenu(null); }}>Delete</button>
                    </div>}
                    <div className="message-bubble">
                      {message.replyTo && <div className="quoted-message">{message.replyTo}</div>}
                      {message.text}<span>{message.time} <b>✓✓</b></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {replyTo && <div className="reply-preview"><div><strong>Replying to your message</strong><span>{replyTo.text}</span></div><button onClick={() => setReplyTo(null)} aria-label="Cancel reply"><X size={17} /></button></div>}
            <div className="message-composer">
              <button className="composer-icon" aria-label="Attach file"><Paperclip /></button>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Message" rows={1} />
              <button className="composer-icon emoji-button" aria-label="Emoji"><Smile /></button>
              <button className="send-button" aria-label="Send message" onClick={sendMessage} disabled={!draft.trim()}><Send size={19} /></button>
            </div>
            <div className="local-preview-note">Messages are currently stored only in this preview. Connect the FNI messaging service to deliver them.</div>
          </>
        ) : (
          <>
            <div className="conversation-topbar"><span className="topbar-label">FNI CONNECT</span><div className="topbar-actions"><span className="secure-indicator"><i /> Connected</span></div></div>
            <div className="welcome-state">
              <div className="welcome-logo"><img src="/FNI-APP-2.0/fni-logo.jpg" alt="Forerunners Network International logo" /></div>
              <h2>Stay connected.</h2>
              <p>Your conversations, community and ministry connections in one place.</p>
              <span className="welcome-caption">FORERUNNERS NETWORK INTERNATIONAL</span>
            </div>
            <div className="conversation-footer">Select a conversation to start messaging</div>
          </>
        )}
      </section>

      {newChatOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewChatOpen(false); }}>
          <form className="new-chat-modal" onSubmit={(event) => { event.preventDefault(); startChat(); }}>
            <div className="modal-heading"><h2>New message</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setNewChatOpen(false)}><X /></button></div>
            <label htmlFor="username">Username</label>
            <input id="username" autoFocus value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter an FNI username" />
            <p>Enter the username of the person you want to message.</p>
            <button className="modal-submit" type="submit" disabled={!username.trim()}>Continue</button>
          </form>
        </div>
      )}
    </main>
  );
}
