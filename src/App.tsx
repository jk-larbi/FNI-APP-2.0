import { useEffect, useMemo, useState } from 'react';
import ProfileIdentity from './components/ProfileIdentity';
import {
  Bell, Bookmark, CalendarDays, ChevronDown, CircleHelp, Compass,
  Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, Users, Video, X, UserRound, LockKeyhole, Smartphone,
  Palette, Folder, Languages, Smile, HardDrive, Headphones, Images,
  SlidersHorizontal, ChevronRight, ArrowLeft
} from 'lucide-react';

type Section = 'chats' | 'community' | 'cells' | 'meetings' | 'settings';
type SettingKind = 'toggle' | 'select' | 'action';
type SettingOption = { label: string; description?: string; kind: SettingKind; choices?: string[]; value?: string; defaultOn?: boolean };
type SettingCategory = { id: string; label: string; group: string; description: string; icon: typeof Settings; options: SettingOption[] };

const sections: { id: Section; label: string; icon: typeof MessageCircle }[] = [
  { id: 'chats', label: 'Chats', icon: MessageCircle },
  { id: 'community', label: 'Community', icon: Compass },
  { id: 'cells', label: 'Cell groups', icon: Users },
  { id: 'meetings', label: 'Meetings', icon: Video },
];

const settingCategories: SettingCategory[] = [
  { id: 'profile', label: 'My Profile', group: 'ACCOUNT', description: 'Your personal details and FNI member identity.', icon: UserRound, options: [
    { label: 'Profile photo', description: 'Add or change the picture members see.', kind: 'action' },
    { label: 'Full name', description: 'Your name as displayed across FNI.', kind: 'action' },
    { label: 'Username', description: 'A unique username people can use to find you.', kind: 'action' },
    { label: 'Bio', description: 'A short introduction about you.', kind: 'action' },
    { label: 'Ministry affiliation', description: 'Your cell, department and church role.', kind: 'action' },
  ]},
  { id: 'privacy', label: 'Privacy & Security', group: 'ACCOUNT', description: 'Choose what other members can see and how your account is protected.', icon: LockKeyhole, options: [
    { label: 'Show online status', description: 'Let other members see when you are online.', kind: 'toggle', defaultOn: true },
    { label: 'Show profile photo to', kind: 'select', choices: ['Everyone', 'FNI members', 'My contacts', 'Nobody'], value: 'FNI members' },
    { label: 'Show phone number to', kind: 'select', choices: ['Nobody', 'My contacts', 'FNI members'], value: 'Nobody' },
    { label: 'Allow group invitations', description: 'Allow members to add you to groups.', kind: 'toggle', defaultOn: true },
    { label: 'Two-step verification', description: 'Add another layer of protection to your account.', kind: 'action' },
    { label: 'Blocked members', description: 'Review members you have blocked.', kind: 'action' },
  ]},
  { id: 'devices', label: 'Devices & Sessions', group: 'ACCOUNT', description: 'Review devices connected to your FNI account.', icon: Smartphone, options: [
    { label: 'Primary device', description: 'Your primary device and new-device approval settings.', kind: 'action' },
    { label: 'Active sessions', description: 'View and end other signed-in sessions.', kind: 'action' },
    { label: 'New login alerts', description: 'Get notified when your account is used on a new device.', kind: 'toggle', defaultOn: true },
  ]},
  { id: 'notifications', label: 'Notifications & Sounds', group: 'PREFERENCES', description: 'Control alerts for conversations, ministry updates and meetings.', icon: Bell, options: [
    { label: 'Private messages', kind: 'toggle', defaultOn: true },
    { label: 'Cell and ministry groups', kind: 'toggle', defaultOn: true },
    { label: 'Church announcements', description: 'Keep important official updates enabled.', kind: 'toggle', defaultOn: true },
    { label: 'Calls and meeting reminders', kind: 'toggle', defaultOn: true },
    { label: 'Show message previews', kind: 'toggle', defaultOn: true },
    { label: 'Notification priority', kind: 'select', choices: ['Normal', 'Important', 'Urgent'], value: 'Normal' },
  ]},
  { id: 'appearance', label: 'Appearance & Themes', group: 'PREFERENCES', description: 'Personalise the FNI interface while keeping its identity recognisable.', icon: Palette, options: [
    { label: 'Theme', kind: 'select', choices: ['System default', 'Dark', 'Light'], value: 'Dark' },
    { label: 'Accent style', kind: 'select', choices: ['FNI Royal Blue & Gold', 'Royal Blue', 'Deep Purple'], value: 'FNI Royal Blue & Gold' },
    { label: 'Larger text', description: 'Increase text size throughout the app.', kind: 'toggle' },
    { label: 'Reduce animations', description: 'Use fewer interface animations.', kind: 'toggle' },
    { label: 'High contrast', kind: 'toggle' },
  ]},
  { id: 'folders', label: 'Chat Folders', group: 'PREFERENCES', description: 'Organise conversations into tabs that suit your daily use.', icon: Folder, options: [
    { label: 'All Chats', description: 'Show every conversation.', kind: 'action' },
    { label: 'Personal', description: 'One-to-one conversations.', kind: 'action' },
    { label: 'Groups', description: 'Group conversations and communities.', kind: 'action' },
    { label: 'Create custom folder', description: 'Create folders such as Cells, Leaders or Ministry.', kind: 'action' },
  ]},
  { id: 'language', label: 'Language & Translation', group: 'PREFERENCES', description: 'Choose your preferred language and translation behaviour.', icon: Languages, options: [
    { label: 'App language', kind: 'select', choices: ['English', 'Twi', 'Ga', 'Ewe', 'French'], value: 'English' },
    { label: 'Offer message translation', kind: 'toggle', defaultOn: true },
    { label: 'Keep original text visible', kind: 'toggle', defaultOn: true },
  ]},
  { id: 'stickers', label: 'Stickers & Reactions', group: 'PREFERENCES', description: 'Manage reactions and FNI sticker collections.', icon: Smile, options: [
    { label: 'Message reactions', description: 'Like, Love, Prayer, Amen, Praise and Celebration.', kind: 'toggle', defaultOn: true },
    { label: 'Official FNI sticker packs', description: 'Browse ministry-approved sticker collections.', kind: 'action' },
    { label: 'Recent and favourite stickers', kind: 'action' },
    { label: 'GIF preferences', kind: 'action' },
  ]},
  { id: 'storage', label: 'Data & Storage', group: 'PREFERENCES', description: 'Manage downloads and reduce mobile data usage.', icon: HardDrive, options: [
    { label: 'Auto-download photos on mobile data', kind: 'toggle', defaultOn: true },
    { label: 'Auto-download videos on mobile data', kind: 'toggle' },
    { label: 'Auto-download documents', kind: 'toggle' },
    { label: 'Download large media on Wi-Fi only', kind: 'toggle', defaultOn: true },
    { label: 'Storage usage and cache', description: 'Review downloaded media and clear temporary cache.', kind: 'action' },
    { label: 'Data-saving mode', kind: 'toggle' },
  ]},
  { id: 'calls', label: 'Calls & Meetings', group: 'COMMUNICATION', description: 'Set preferences for calls, online meetings and meeting reminders.', icon: Headphones, options: [
    { label: 'Allow incoming calls from', kind: 'select', choices: ['Everyone', 'FNI members', 'My contacts', 'Nobody'], value: 'FNI members' },
    { label: 'Voice call notifications', kind: 'toggle', defaultOn: true },
    { label: 'Video call notifications', kind: 'toggle', defaultOn: true },
    { label: 'Meeting reminders', kind: 'toggle', defaultOn: true },
    { label: 'Microphone and camera permissions', description: 'Manage device permissions when calls are introduced.', kind: 'action' },
    { label: 'Call history', description: 'Your previous calls and meeting activity.', kind: 'action' },
  ]},
  { id: 'stories', label: 'Stories & Moments', group: 'COMMUNICATION', description: 'Choose who can view and respond to your FNI Moments.', icon: Images, options: [
    { label: 'Who can view my moments', kind: 'select', choices: ['Everyone', 'FNI members', 'My contacts', 'Selected members'], value: 'FNI members' },
    { label: 'Allow replies', kind: 'toggle', defaultOn: true },
    { label: 'Save moments to profile', kind: 'toggle' },
    { label: 'My moments archive', kind: 'action' },
  ]},
  { id: 'saved', label: 'Saved Items', group: 'COMMUNICATION', description: 'Keep sermons, verses, announcements and resources together.', icon: Bookmark, options: [
    { label: 'Saved messages', kind: 'action' },
    { label: 'Saved sermons and media', kind: 'action' },
    { label: 'Saved scripture and prayer points', kind: 'action' },
    { label: 'Personal notes', kind: 'action' },
  ]},
  { id: 'ministry', label: 'FNI Ministry Settings', group: 'MINISTRY', description: 'Manage your ministry preferences and visibility.', icon: ShieldCheck, options: [
    { label: 'Church membership', description: 'Your membership and chapter information.', kind: 'action' },
    { label: 'My cell group', kind: 'action' },
    { label: 'Ministry department', kind: 'action' },
    { label: 'Church directory visibility', kind: 'select', choices: ['Visible to members', 'Visible to leaders', 'Hidden'], value: 'Visible to members' },
    { label: 'Prayer request privacy', kind: 'select', choices: ['Designated prayer ministers', 'Selected leaders', 'FNI members'], value: 'Designated prayer ministers' },
    { label: 'Giving and event preferences', kind: 'action' },
    { label: 'Mentorship preferences', kind: 'action' },
    { label: 'Leadership permissions', description: 'Available to authorised leaders according to their assigned role.', kind: 'action' },
    { label: 'Ministry notifications', kind: 'toggle', defaultOn: true },
  ]},
  { id: 'advanced', label: 'Advanced Settings', group: 'SUPPORT', description: 'Additional account controls and help resources.', icon: SlidersHorizontal, options: [
    { label: 'Archived conversations', kind: 'action' },
    { label: 'Scheduled messages', kind: 'action' },
    { label: 'Export or request my data', kind: 'action' },
    { label: 'Account deletion request', kind: 'action' },
    { label: 'Help & Support', kind: 'action' },
    { label: 'About FNI', kind: 'action' },
  ]},
];

function Brand() {
  return <div className="brand"><div className="brand-mark">F</div><div className="brand-copy"><strong>FNI</strong><span>Forerunners Network International</span></div></div>;
}

function App() {
  const [section, setSection] = useState<Section>('chats');
  const [folder, setFolder] = useState('All chats');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectedSetting, setSelectedSetting] = useState('profile');
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('fni-settings-toggles') || '{}'); } catch { return {}; }
  });
  const [choices, setChoices] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('fni-settings-choices') || '{}'); } catch { return {}; }
  });
  const [activeAction, setActiveAction] = useState('');
  const themeChoice = choices['appearance:Theme'] ?? 'Dark';
  const appTheme = themeChoice === 'System default' ? 'dark' : themeChoice.toLowerCase();
  const language = choices['language:App language'] ?? 'English';

  useEffect(() => { localStorage.setItem('fni-settings-toggles', JSON.stringify(toggles)); }, [toggles]);
  useEffect(() => { localStorage.setItem('fni-settings-choices', JSON.stringify(choices)); }, [choices]);
  useEffect(() => { document.documentElement.dataset.theme = appTheme; }, [appTheme]);

  const translations: Record<string, Record<string, string>> = {
    French: { Chats: 'Discussions', Community: 'Communauté', 'Cell groups': 'Groupes de cellule', Meetings: 'Réunions', Settings: 'Paramètres', Messages: 'Messages', 'Your FNI experience': 'Votre expérience FNI', 'My Profile': 'Mon profil', 'Privacy & Security': 'Confidentialité et sécurité', 'Appearance & Themes': 'Apparence et thèmes', 'Language & Translation': 'Langue et traduction', 'Stickers & Reactions': 'Autocollants et réactions', 'Calls & Meetings': 'Appels et réunions', 'Stories & Moments': 'Stories et moments', 'Saved Items': 'Éléments enregistrés', 'FNI Ministry Settings': 'Paramètres du ministère FNI' },
    Twi: { Chats: 'Nkɔmmɔbɔ', Community: 'Mpɔtam', 'Cell groups': 'Nkabomkuo', Meetings: 'Nhyiamu', Settings: 'Nhyehyɛe', Messages: 'Nkɔmmɔ', 'My Profile': 'Me ho nsɛm', 'Privacy & Security': 'Ahintasɛm ne ahobammɔ', 'Appearance & Themes': 'Nhwɛso ne kɔla', 'Language & Translation': 'Kasa ne nkyerɛase', 'Stickers & Reactions': 'Stickers ne mmuae', 'Calls & Meetings': 'Frɛ ne nhyiamu', 'Stories & Moments': 'Nsɛm ne mmerɛ', 'Saved Items': 'Nneɛma a wɔakora so', 'FNI Ministry Settings': 'FNI som nhyehyɛe' },
    Ga: { Chats: 'Nɔɔlɔi', Community: 'Shikpong', 'Cell groups': 'Kpee ni', Meetings: 'Hiiŋmɔ', Settings: 'Nɔŋŋmɔi', Messages: 'Nɔɔlɔi', 'My Profile': 'Mi profile', 'Privacy & Security': 'Nɔŋŋmɔ kɛ hewɔlɔ', 'Appearance & Themes': 'Nuu kɛ theme', 'Language & Translation': 'Gbaŋ kɛ nɔŋŋmɔ', 'Stickers & Reactions': 'Stickers kɛ nɔŋŋmɔ', 'Calls & Meetings': 'Yei kɛ hiiŋmɔ', 'Stories & Moments': 'Stories kɛ mli', 'Saved Items': 'Nɔŋŋmɔi ni wɔhɔɔ', 'FNI Ministry Settings': 'FNI ministry nɔŋŋmɔi' },
    Ewe: { Chats: 'Dɔwɔwɔ', Community: 'Hadedome', 'Cell groups': 'Hame ƒomeviwo', Meetings: 'Kpekpewo', Settings: 'Ðoɖowɔnuwo', Messages: 'Gbedasiwo', 'My Profile': 'Nye ŋutɔ ƒe nyawo', 'Privacy & Security': 'Asi me nyawo kple dedienɔnɔ', 'Appearance & Themes': 'Nɔnɔme kple theme', 'Language & Translation': 'Gbe kple gɔmeɖeɖe', 'Stickers & Reactions': 'Stickers kple ŋuɖoɖowo', 'Calls & Meetings': 'Yɔyɔ kple kpekpewo', 'Stories & Moments': 'Nya siwo kple ɣeyiɣiwo', 'Saved Items': 'Nu siwo woɖo ɖe anyi', 'FNI Ministry Settings': 'FNI subɔsubɔ ƒe ɖoɖowo' }
  };
  const t = (value: string) => translations[language]?.[value] ?? value;

  const current = useMemo(() => sections.find(item => item.id === section)!, [section]);
  const activeSetting = settingCategories.find(item => item.id === selectedSetting) ?? settingCategories[0];
  const ActiveSettingIcon = activeSetting.icon;

  function comingSoon(feature: string) {
    setNotice(feature + ' needs an FNI account or backend connection. Your current settings preview is stored only in this browser session.');
    window.setTimeout(() => setNotice(''), 4200);
  }

  function openSettings() {
    setSection('settings');
    setSelectedSetting('profile');
    setMenuOpen(false);
  }

  return <div className="app-shell" data-theme={appTheme} data-language={language}>
    <aside className="sidebar">
      <div className="sidebar-top"><Brand />
        <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(v => !v)}><Menu size={20} /></button>
        <button className="icon-button desktop-more" aria-label="More options" onClick={() => setMenuOpen(v => !v)}><MoreHorizontal size={21} /></button>
      </div>
      {menuOpen && <div className="account-menu">
        <button onClick={openSettings}><Settings size={16} /> Settings</button>
        <button onClick={() => comingSoon('Notifications')}><Bell size={16} /> Notifications</button>
        <button onClick={() => comingSoon('Help centre')}><CircleHelp size={16} /> Help centre</button>
      </div>}
      <div className="sidebar-label">YOUR SPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        {sections.map(item => { const Icon = item.icon; return <button key={item.id} className={section === item.id ? 'nav-item active' : 'nav-item'} onClick={() => { setSection(item.id); setMenuOpen(false); }}><Icon size={19} strokeWidth={1.8} /><span>{t(item.label)}</span></button>; })}
        <button className={section === 'settings' ? 'nav-item active' : 'nav-item'} onClick={openSettings}><Settings size={19} /><span>{t('Settings')}</span></button>
      </nav>
      <div className="sidebar-bottom">
        <div className="ministry-card"><div className="ministry-icon"><ShieldCheck size={18} /></div><div><strong>FNI Connect</strong><span>Your community, together.</span></div></div>
        <button className="profile-row" onClick={openSettings}><div className="profile-avatar">F</div><div className="profile-copy"><strong>FNI Member</strong><span>Account setup pending</span></div><ChevronDown size={16} /></button>
      </div>
    </aside>

    <main className="main-panel">
      <header className="topbar">
        <div className="topbar-title"><span className="eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span><h1>{t(section === 'chats' ? 'Messages' : section === 'settings' ? 'Settings' : current.label)}</h1></div>
        <div className="topbar-actions">
          {section === 'settings' ? <button className="icon-button" aria-label="Back to chats" onClick={() => setSection('chats')}><ArrowLeft size={19} /></button> : <button className="icon-button notification-button" aria-label="Notifications" onClick={() => comingSoon('Notifications')}><Bell size={19} /></button>}
          {section !== 'settings' && <button className="new-button" onClick={() => comingSoon(section === 'chats' ? 'New conversation' : 'Create ' + current.label.toLowerCase())}><Plus size={17} /><span>{section === 'chats' ? 'New message' : 'Create new'}</span></button>}
        </div>
      </header>

      {section === 'settings' ? <div className="settings-page">
        <div className="settings-intro"><div><span className="settings-kicker">YOUR FNI EXPERIENCE</span><h2>{t('Settings')}</h2><p>Manage your account, privacy, preferences and ministry experience.</p></div><div className="settings-profile"><div className="profile-avatar">F</div><div><strong>FNI Member</strong><span>Account setup pending</span></div></div></div>
        <div className="settings-layout">
          <aside className="settings-menu">
            {['ACCOUNT','PREFERENCES','COMMUNICATION','MINISTRY','SUPPORT'].map(group => <div className="settings-group" key={group}><span className="settings-group-label">{group}</span>
              {settingCategories.filter(item => item.group === group).map(item => { const Icon = item.icon; return <button key={item.id} className={selectedSetting === item.id ? 'setting-nav active' : 'setting-nav'} onClick={() => setSelectedSetting(item.id)}><Icon size={17} /><span>{t(item.label)}</span><ChevronRight size={14} /></button>; })}
            </div>)}
          </aside>
          {selectedSetting === 'profile' ? <ProfileIdentity onNotice={message => { setNotice(message); window.setTimeout(() => setNotice(''), 4800); }} /> : <section className="settings-detail">
            <div className="settings-detail-head"><div className="setting-detail-icon"><ActiveSettingIcon size={20} /></div><div><h3>{activeSetting.label}</h3><p>{activeSetting.description}</p></div></div>
            <div className="settings-options">
              {activeSetting.options.map(option => {
                const key = activeSetting.id + ':' + option.label;
                const enabled = toggles[key] ?? !!option.defaultOn;
                const selected = choices[key] ?? option.value ?? option.choices?.[0] ?? '';
                return <div className="setting-option" key={key}>
                  <div className="setting-option-copy"><strong>{option.label}</strong>{option.description && <span>{option.description}</span>}</div>
                  {option.kind === 'toggle' ? <button className={enabled ? 'switch on' : 'switch'} role="switch" aria-checked={enabled} aria-label={option.label} onClick={() => setToggles(prev => ({...prev, [key]: !enabled}))}><span /></button>
                    : option.kind === 'select' ? <select value={selected} aria-label={option.label} onChange={e => setChoices(prev => ({...prev, [key]: e.target.value}))}>{option.choices?.map(choice => <option key={choice}>{choice}</option>)}</select>
                    : <button className="setting-action" onClick={() => setActiveAction(option.label)}>Open <ChevronRight size={15} /></button>}
                </div>;
              })}
            </div>
            <div className="settings-footnote"><ShieldCheck size={15} /><span>These are frontend preferences for now. Account security, device sessions and cross-device sync will activate when the FNI backend is connected.</span></div>
          </section>}
        </div>
      </div> : <div className="content">
        <div className="welcome-line"><div><h2>{section === 'chats' ? 'Stay connected.' : section === 'community' ? 'Find your community.' : section === 'cells' ? 'Grow together.' : 'Meet in fellowship.'}</h2><p>{section === 'chats' ? 'Conversations and updates from your FNI community.' : section === 'community' ? 'A place for fellowship, updates and shared life.' : section === 'cells' ? 'Your cell groups, leaders and small-group life.' : 'Gather online for services, prayer and meetings.'}</p></div></div>
        {section === 'chats' && <>
          <div className="search-bar"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people, groups or messages" aria-label="Search people, groups or messages" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}</div>
          <div className="folder-row" role="tablist" aria-label="Chat filters">{['All chats', 'Personal', 'Groups'].map(item => <button role="tab" aria-selected={folder === item} key={item} className={folder === item ? 'folder active' : 'folder'} onClick={() => setFolder(item)}>{item}</button>)}</div>
        </>}
        <section className="empty-panel"><div className="empty-art">{section === 'chats' ? <MessageCircle size={27} /> : section === 'community' ? <Compass size={27} /> : section === 'cells' ? <Users size={27} /> : <CalendarDays size={27} />}</div>
          <span className="empty-kicker">{section === 'chats' ? 'YOUR CONVERSATIONS' : section === 'community' ? 'FNI COMMUNITY' : section === 'cells' ? 'CELL GROUPS' : 'FELLOWSHIP MEETINGS'}</span>
          <h3>{section === 'chats' ? 'Your conversations will appear here' : section === 'community' ? 'Your community is getting ready' : section === 'cells' ? 'Your cell groups will appear here' : 'No meetings to show yet'}</h3>
          <p>{section === 'chats' ? 'When your FNI account is connected, you can message members, join group conversations and keep up with announcements.' : section === 'community' ? 'Community spaces and ministry updates will be available once your account is connected.' : section === 'cells' ? 'Approved cell groups, meeting schedules, prayer rooms and group resources will be shown here.' : 'Scheduled services, live meetings and meeting history will be available here.'}</p>
          <div className="setup-note"><span className="status-dot" /> Frontend ready <span className="note-divider">·</span> Account and backend connection comes next</div>
        </section>
        <div className="bottom-note"><Bookmark size={15} /><span>FNI is a private space for fellowship, growth and service.</span></div>
      </div>}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {sections.map(item => { const Icon = item.icon; return <button key={item.id} className={section === item.id ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => { setSection(item.id); setMenuOpen(false); }}><Icon size={19} /><span>{item.label === 'Cell groups' ? 'Cells' : item.label}</span></button>; })}
        <button className={section === 'settings' ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={openSettings} aria-current={section === 'settings' ? 'page' : undefined}><Settings size={19} /><span>Settings</span></button>
      </nav>
      {activeAction && <div className="action-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setActiveAction(''); }}><section className="action-sheet" role="dialog" aria-modal="true" aria-labelledby="action-title"><button className="action-close" onClick={() => setActiveAction('')} aria-label="Close"><X size={18} /></button><span className="settings-kicker">FNI SETTINGS</span><h3 id="action-title">{activeAction}</h3><p>This workspace is prepared for the FNI frontend. You can review the available controls here; account-wide actions and shared data will be connected to the backend later.</p>{activeAction.toLowerCase().includes('sticker') || activeAction.toLowerCase().includes('reaction') ? <div className="sticker-preview"><button onClick={() => setNotice('Like reaction selected for preview.')}>👍 Like</button><button onClick={() => setNotice('Love reaction selected for preview.')}>❤️ Love</button><button onClick={() => setNotice('Prayer reaction selected for preview.')}>🙏 Prayer</button><button onClick={() => setNotice('Amen reaction selected for preview.')}>Amen</button><button onClick={() => setNotice('Praise reaction selected for preview.')}>Praise</button><button onClick={() => setNotice('Celebration reaction selected for preview.')}>🎉 Celebrate</button></div> : activeAction.toLowerCase().includes('saved') || activeAction.toLowerCase().includes('notes') ? <div className="action-empty"><Bookmark size={22}/><strong>No saved items yet</strong><span>Saved messages, media, scripture and personal notes will be organised here when content is available.</span></div> : activeAction.toLowerCase().includes('moment') || activeAction.toLowerCase().includes('story') ? <div className="action-empty"><Images size={22}/><strong>Your moments archive</strong><span>Stories and moments you publish will appear here. Uploading and sharing will be enabled with media services.</span></div> : activeAction.toLowerCase().includes('call') || activeAction.toLowerCase().includes('meeting') ? <div className="action-empty"><Video size={22}/><strong>Calls and meetings</strong><span>Camera and microphone permissions can be tested in your browser. Live calls, participant lists and meeting history require the backend and calling service.</span><button className="setting-action" onClick={async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); stream.getTracks().forEach(track => track.stop()); setNotice('Camera and microphone permissions granted in this browser.'); } catch { setNotice('Camera or microphone permission was not granted. Check your browser settings.'); } }}>Test camera and microphone</button></div> : <div className="action-empty"><ShieldCheck size={22}/><strong>Frontend preview</strong><span>This control is ready to be connected to your FNI account and permissions.</span></div>}<button className="action-done" onClick={() => setActiveAction('')}>Done</button></section></div>}
      {notice && <div className="toast" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}><X size={15} /></button></div>}
    </main>
  </div>;
}

export default App;
