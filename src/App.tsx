import { useEffect, useMemo, useState } from 'react';
import ProfileIdentity from './components/ProfileIdentity';
import MessagingWorkspace from './components/MessagingWorkspace';
import CallingWorkspace from './components/CallingWorkspace';
import AppearanceContactsWorkspace from './components/AppearanceContactsWorkspace';
import NotificationsWorkspace from './components/NotificationsWorkspace';
import StoriesWorkspace from './components/StoriesWorkspace';
import SavedMessagesWorkspace from './components/SavedMessagesWorkspace';
import {
  Bell, Bookmark, CalendarDays, ChevronDown, CircleHelp, UsersRound,
  Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, Users, Video, X, UserRound, LockKeyhole, Smartphone,
  Palette, Folder, Languages, Smile, HardDrive, Headphones, Images,
  SlidersHorizontal, ChevronRight, ArrowLeft
} from 'lucide-react';

type Section = 'chats' | 'community' | 'cells' | 'calls' | 'settings' | 'notifications';
type SettingKind = 'toggle' | 'select' | 'action';
type SettingOption = { label: string; description?: string; kind: SettingKind; choices?: string[]; value?: string; defaultOn?: boolean };
type SettingCategory = { id: string; label: string; group: string; description: string; icon: typeof Settings; options: SettingOption[] };

const sections: { id: Section; label: string; icon: typeof MessageCircle }[] = [
  { id: 'chats', label: 'Chats', icon: MessageCircle },
  { id: 'community', label: 'Community', icon: UsersRound },
  { id: 'cells', label: 'Cell groups', icon: Users },
  { id: 'calls', label: 'Calls & meetings', icon: Video },
];

const settingCategories: SettingCategory[] = [
  { id: 'profile', label: 'My Profile', group: 'ACCOUNT', description: 'Your personal details and FNI member identity.', icon: UserRound, options: [
    { label: 'Profile photo', description: 'Add or change the picture members see.', kind: 'action' },
    { label: 'Full name', description: 'Your name as displayed across FNI.', kind: 'action' },
    { label: 'Username', description: 'A unique username people can use to find you.', kind: 'action' },
    { label: 'Bio', description: 'A short introduction about you.', kind: 'action' },
    { label: 'Ministry affiliation', description: 'Your cell, department and church role.', kind: 'action' },
  ]},
  { id: 'privacy', label: 'Privacy & Security', group: 'ACCOUNT', description: 'Control your visibility, conversations, messages and safety on FNI.', icon: LockKeyhole, options: [
    { label: 'Phone number visibility', kind: 'select', choices: ['Everybody', 'FNI members', 'My contacts', 'Nobody'], value: 'Nobody' },
    { label: 'Profile photo visibility', kind: 'select', choices: ['Everybody', 'FNI members', 'My contacts', 'Nobody'], value: 'FNI members' },
    { label: 'Bio visibility', kind: 'select', choices: ['Everybody', 'FNI members', 'My contacts', 'Nobody'], value: 'FNI members' },
    { label: 'Online status visibility', kind: 'select', choices: ['Everybody', 'FNI members', 'My contacts', 'Nobody'], value: 'My contacts' },
    { label: 'Last seen visibility', kind: 'select', choices: ['Everybody', 'FNI members', 'My contacts', 'Nobody'], value: 'My contacts' },
    { label: 'Read receipts', description: 'Let others know when you have read their messages.', kind: 'toggle', defaultOn: true },
    { label: 'Who can message me', kind: 'select', choices: ['Everybody', 'FNI members', 'My contacts', 'Nobody'], value: 'FNI members' },
    { label: 'Who can call me', kind: 'select', choices: ['Everybody', 'FNI members', 'My contacts', 'Nobody'], value: 'FNI members' },
    { label: 'Who can add me to groups', kind: 'select', choices: ['Everybody', 'My contacts', 'Nobody'], value: 'My contacts' },
    { label: 'Find me by phone number', kind: 'select', choices: ['Everybody', 'My contacts', 'Nobody'], value: 'My contacts' },
    { label: 'Restrict unwanted interactions', description: 'Limit contact from people outside your allowed audience.', kind: 'toggle', defaultOn: false },
    { label: 'Control group invitations', description: 'Manage who may invite you to group conversations.', kind: 'action' },
    { label: 'Blocked users', description: 'View, block or unblock accounts on this device.', kind: 'action' },
    { label: 'Report a message or account', description: 'Prepare a safety report for FNI moderation.', kind: 'action' },
    { label: 'Report inappropriate group content', kind: 'action' },
    { label: 'Appeal a moderation decision', kind: 'action' },
    { label: 'Disappearing messages', description: 'Choose a default timer for supported conversations.', kind: 'select', choices: ['Off', '24 hours', '7 days', '30 days'], value: 'Off' },
    { label: 'Chat lock preference', description: 'Stores your preference. A real lock requires device authentication and backend/session integration.', kind: 'toggle', defaultOn: false },
    { label: 'Hide notification previews', kind: 'toggle', defaultOn: true },
    { label: 'Screenshot warnings preference', description: 'Stores your preference. Browsers cannot reliably detect or prevent screenshots, so no warning is guaranteed.', kind: 'toggle', defaultOn: false },
    { label: 'Forwarding controls', kind: 'select', choices: ['Allow forwarding', 'Warn before forwarding', 'Restrict where supported'], value: 'Allow forwarding' },
    { label: 'Secure media attachments preference', description: 'Stores your preference only. Actual encryption and protected delivery require backend integration.', kind: 'toggle', defaultOn: true },
    { label: 'Two-step verification', description: 'Add another layer of protection to your account.', kind: 'action' },
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
  { id: 'appearance', label: 'Appearance & Themes', group: 'PREFERENCES', description: 'Customise themes, wallpapers, typography and accessibility across FNI.', icon: Palette, options: [
    { label: 'Theme and colours', description: 'Choose light, dark, system or a fully custom theme.', kind: 'action' },
    { label: 'Chat wallpapers', description: 'Set global and individual conversation backgrounds.', kind: 'action' },
    { label: 'Display and accessibility', description: 'Text size, density, motion and contrast.', kind: 'action' },
  ]},
  { id: 'contacts', label: 'Contacts & Sync', group: 'COMMUNICATION', description: 'Manage device contact access, local selections and contact discovery.', icon: Users, options: [
    { label: 'Synced contacts', description: 'Review contacts selected from this device.', kind: 'action' },
    { label: 'Contact permissions', description: 'Review and change contact-access consent.', kind: 'action' },
    { label: 'Refresh contacts', description: 'Select contacts again from the device contact picker.', kind: 'action' },
    { label: 'Remove synced data', description: 'Remove locally selected contacts from this browser.', kind: 'action' },
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
  { id: 'saved', label: 'Saved Messages & Personal Cloud', group: 'COMMUNICATION', description: 'Privately save messages, notes, links, photos and files.', icon: Bookmark, options: [
    { label: 'Open Saved Messages & Personal Cloud', description: 'Manage your saved items, collections and personal files.', kind: 'action' },
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
  const [callGroup, setCallGroup] = useState('');
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
  const [savedItems, setSavedItems] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-saved-items') || '[]'); } catch { return []; } });
  const [moments, setMoments] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-moments') || '[]'); } catch { return []; } });
  const [savedDraft, setSavedDraft] = useState('');
  const [momentDraft, setMomentDraft] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingWhen, setMeetingWhen] = useState('');
  const [meetingDrafts, setMeetingDrafts] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-meeting-drafts') || '[]'); } catch { return []; } });
  const [ministryData, setMinistryData] = useState<Record<string,string>>(() => { try { return JSON.parse(localStorage.getItem('fni-ministry-settings') || '{}'); } catch { return {}; } });
  const [actionDraft, setActionDraft] = useState('');
  const [folderNames, setFolderNames] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-chat-folders') || '[]'); } catch { return []; } });
  const [blockedMembers, setBlockedMembers] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-blocked-members') || '[]'); } catch { return []; } });
  const [reportDrafts, setReportDrafts] = useState<{id:string;type:string;reference:string;details:string;createdAt:string}[]>(() => { try { return JSON.parse(localStorage.getItem('fni-report-drafts') || '[]'); } catch { return []; } });
  const themeChoice = choices['appearance:Theme'] ?? 'Light';
  const appTheme = themeChoice === 'System default' ? 'light' : themeChoice.toLowerCase();
  const language = choices['language:App language'] ?? 'English';

  useEffect(() => { localStorage.setItem('fni-settings-toggles', JSON.stringify(toggles)); }, [toggles]);
  useEffect(() => { localStorage.setItem('fni-settings-choices', JSON.stringify(choices)); }, [choices]);
  useEffect(() => { document.documentElement.dataset.theme = appTheme; }, [appTheme]);
  useEffect(() => { localStorage.setItem('fni-saved-items', JSON.stringify(savedItems)); }, [savedItems]);
  useEffect(() => { localStorage.setItem('fni-moments', JSON.stringify(moments)); }, [moments]);
  useEffect(() => { localStorage.setItem('fni-meeting-drafts', JSON.stringify(meetingDrafts)); }, [meetingDrafts]);
  useEffect(() => { localStorage.setItem('fni-ministry-settings', JSON.stringify(ministryData)); }, [ministryData]);
  useEffect(() => { localStorage.setItem('fni-chat-folders', JSON.stringify(folderNames)); }, [folderNames]);
  useEffect(() => { localStorage.setItem('fni-blocked-members', JSON.stringify(blockedMembers)); }, [blockedMembers]);
  useEffect(() => { localStorage.setItem('fni-report-drafts', JSON.stringify(reportDrafts)); }, [reportDrafts]);

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
        <button onClick={() => { setSection('notifications'); setMenuOpen(false); }}><Bell size={16} /> Notifications</button>
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
        <div className="topbar-title"><span className="eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span><h1>{t(section === 'chats' ? 'Messages' : section === 'settings' ? 'Settings' : section === 'notifications' ? 'Notifications' : current.label)}</h1></div>
        <div className="topbar-actions">
          {section === 'settings' || section === 'notifications' ? <button className="icon-button" aria-label="Back to chats" onClick={() => setSection('chats')}><ArrowLeft size={19} /></button> : <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setSection('notifications')}><Bell size={19} /></button>}
          {section !== 'settings' && section !== 'notifications' && section !== 'calls' && <button className="new-button" onClick={() => comingSoon(section === 'chats' ? 'New conversation' : 'Create ' + current.label.toLowerCase())}><Plus size={17} /><span>{section === 'chats' ? 'New message' : 'Create new'}</span></button>}
        </div>
      </header>

      {section === 'calls' ? null : section === 'notifications' ? <NotificationsWorkspace onNavigate={destination => setSection(destination)} /> : section === 'settings' ? <div className="settings-page">
        <div className="settings-intro"><div><span className="settings-kicker">YOUR FNI EXPERIENCE</span><h2>{t('Settings')}</h2><p>Manage your account, privacy, preferences and ministry experience.</p></div><div className="settings-profile"><div className="profile-avatar">F</div><div><strong>FNI Member</strong><span>Account setup pending</span></div></div></div>
        <div className="settings-layout">
          <aside className="settings-menu">
            {['ACCOUNT','PREFERENCES','COMMUNICATION','MINISTRY','SUPPORT'].map(group => <div className="settings-group" key={group}><span className="settings-group-label">{group}</span>
              {settingCategories.filter(item => item.group === group).map(item => { const Icon = item.icon; return <button key={item.id} className={selectedSetting === item.id ? 'setting-nav active' : 'setting-nav'} onClick={() => setSelectedSetting(item.id)}><Icon size={17} /><span>{t(item.label)}</span><ChevronRight size={14} /></button>; })}
            </div>)}
          </aside>
          {selectedSetting === 'saved' ? <SavedMessagesWorkspace /> : selectedSetting === 'notifications' ? <NotificationsWorkspace onNavigate={destination => setSection(destination)} /> : selectedSetting === 'stories' ? <StoriesWorkspace onReply={() => setNotice('Open a conversation to continue your reply.')} /> : selectedSetting === 'profile' ? <ProfileIdentity onNotice={message => { setNotice(message); window.setTimeout(() => setNotice(''), 4800); }} /> : selectedSetting === 'appearance' || selectedSetting === 'contacts' ? <AppearanceContactsWorkspace initialTab={selectedSetting === 'contacts' ? 'contacts' : 'appearance'} /> : <section className="settings-detail">
            <div className="settings-detail-head"><div className="setting-detail-icon"><ActiveSettingIcon size={20} /></div><div><h3>{t(activeSetting.label)}</h3><p>{activeSetting.description}</p></div></div>
            <div className="settings-options">
              {activeSetting.options.map(option => {
                const key = activeSetting.id + ':' + option.label;
                const enabled = toggles[key] ?? !!option.defaultOn;
                const selected = choices[key] ?? option.value ?? option.choices?.[0] ?? '';
                return <div className="setting-option" key={key}>
                  <div className="setting-option-copy"><strong>{option.label}</strong>{option.description && <span>{option.description}</span>}</div>
                  {option.kind === 'toggle' ? <button className={enabled ? 'switch on' : 'switch'} role="switch" aria-checked={enabled} aria-label={option.label} onClick={() => setToggles(prev => ({...prev, [key]: !enabled}))}><span /></button>
                    : option.kind === 'select' ? <select value={selected} aria-label={option.label} onChange={e => setChoices(prev => ({...prev, [key]: e.target.value}))}>{option.choices?.map(choice => <option key={choice}>{choice}</option>)}</select>
                    : <button className="setting-action" onClick={() => activeSetting.id === 'calls' ? setSection('calls') : setActiveAction(option.label)}>Open <ChevronRight size={15} /></button>}
                </div>;
              })}
            </div>
            <div className="settings-footnote"><ShieldCheck size={15} /><span>These are frontend preferences for now. Account security, device sessions and cross-device sync will activate when the FNI backend is connected.</span></div>
          </section>}
        </div>
      </div> : section === 'chats' ? <><StoriesWorkspace onReply={() => setNotice('Open a conversation to continue your reply.')} /><MessagingWorkspace onStartGroupCall={name => { setCallGroup(name); setSection('calls'); }} /></> : <div className="content">
        <div className="welcome-line"><div><h2>{section === 'chats' ? 'Stay connected.' : section === 'community' ? 'Find your community.' : section === 'cells' ? 'Grow together.' : 'Meet in fellowship.'}</h2><p>{section === 'chats' ? 'Conversations and updates from your FNI community.' : section === 'community' ? 'A place for fellowship, updates and shared life.' : section === 'cells' ? 'Your cell groups, leaders and small-group life.' : 'Gather online for services, prayer and meetings.'}</p></div></div>
        {section === 'chats' && <>
          <div className="search-bar"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people, groups or messages" aria-label="Search people, groups or messages" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}</div>
          <div className="folder-row" role="tablist" aria-label="Chat filters">{['All chats', 'Personal', 'Groups'].map(item => <button role="tab" aria-selected={folder === item} key={item} className={folder === item ? 'folder active' : 'folder'} onClick={() => setFolder(item)}>{item}</button>)}</div>
        </>}
        <section className="empty-panel"><div className="empty-art">{section === 'chats' ? <MessageCircle size={27} /> : section === 'community' ? <UsersRound size={27} /> : section === 'cells' ? <Users size={27} /> : <CalendarDays size={27} />}</div>
          <span className="empty-kicker">{section === 'chats' ? 'YOUR CONVERSATIONS' : section === 'community' ? 'FNI COMMUNITY' : section === 'cells' ? 'CELL GROUPS' : 'FELLOWSHIP MEETINGS'}</span>
          <h3>{section === 'chats' ? 'Your conversations will appear here' : section === 'community' ? 'Your community is getting ready' : section === 'cells' ? 'Your cell groups will appear here' : 'No meetings to show yet'}</h3>
          <p>{section === 'chats' ? 'When your FNI account is connected, you can message members, join group conversations and keep up with announcements.' : section === 'community' ? 'Community spaces and ministry updates will be available once your account is connected.' : section === 'cells' ? 'Approved cell groups, meeting schedules, prayer rooms and group resources will be shown here.' : 'Scheduled services, live meetings and meeting history will be available here.'}</p>
          <div className="setup-note"><span className="status-dot" /> Frontend ready <span className="note-divider">·</span> Account and backend connection comes next</div>
        </section>
        <div className="bottom-note"><Bookmark size={15} /><span>FNI is a private space for fellowship, growth and service.</span></div>
      </div>}
      <CallingWorkspace isVisible={section === 'calls'} initialGroup={callGroup} onClearInitialGroup={() => setCallGroup('')} onNavigateToCalls={() => setSection('calls')} />
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {sections.map(item => { const Icon = item.icon; return <button key={item.id} className={section === item.id ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => { setSection(item.id); setMenuOpen(false); }}><Icon size={19} /><span>{t(item.label === 'Cell groups' ? 'Cell groups' : item.label === 'Chats' ? 'Chats' : item.label)}</span></button>; })}
        <button className={section === 'settings' ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={openSettings} aria-current={section === 'settings' ? 'page' : undefined}><Settings size={19} /><span>Settings</span></button>
      </nav>
      {activeAction && <div className="action-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setActiveAction(''); }}><section className="action-sheet" role="dialog" aria-modal="true" aria-labelledby="action-title"><button className="action-close" onClick={() => setActiveAction('')} aria-label="Close"><X size={18} /></button><span className="settings-kicker">FNI SETTINGS</span><h3 id="action-title">{activeAction}</h3><p>This workspace is prepared for the FNI frontend. You can review the available controls here; account-wide actions and shared data will be connected to the backend later.</p>{activeAction.toLowerCase().includes('sticker') || activeAction.toLowerCase().includes('reaction') ? <div className="sticker-preview"><button onClick={() => setNotice('Like reaction selected for preview.')}>👍 Like</button><button onClick={() => setNotice('Love reaction selected for preview.')}>❤️ Love</button><button onClick={() => setNotice('Prayer reaction selected for preview.')}>🙏 Prayer</button><button onClick={() => setNotice('Amen reaction selected for preview.')}>Amen</button><button onClick={() => setNotice('Praise reaction selected for preview.')}>Praise</button><button onClick={() => setNotice('Celebration reaction selected for preview.')}>🎉 Celebrate</button></div> : activeAction.toLowerCase().includes('saved') || activeAction.toLowerCase().includes('notes') ? <div className="action-empty"><Bookmark size={22}/><strong>{savedItems.length ? 'Your saved items' : 'No saved items yet'}</strong><span>These notes are stored on this device for this frontend preview.</span><div className="local-entry"><input value={savedDraft} onChange={e => setSavedDraft(e.target.value)} placeholder="Add a verse, note or resource title"/><button onClick={() => { if (savedDraft.trim()) { setSavedItems(items => [savedDraft.trim(), ...items]); setSavedDraft(''); } }}>Save item</button></div>{savedItems.map((item,index) => <div className="local-record" key={index}>{item}<button onClick={() => setSavedItems(items => items.filter((_,i) => i !== index))}>Remove</button></div>)}</div> : activeAction.toLowerCase().includes('moment') || activeAction.toLowerCase().includes('story') ? <div className="action-empty"><Images size={22}/><strong>Your moments archive</strong><span>Create a text-only moment preview. Sharing and media uploads will be enabled with backend services.</span><div className="local-entry"><input value={momentDraft} onChange={e => setMomentDraft(e.target.value)} maxLength={180} placeholder="Share a short moment..."/><button onClick={() => { if (momentDraft.trim()) { setMoments(items => [momentDraft.trim(), ...items]); setMomentDraft(''); } }}>Add moment</button></div>{moments.map((item,index) => <div className="local-record" key={index}>{item}<button onClick={() => setMoments(items => items.filter((_,i) => i !== index))}>Delete</button></div>)}</div> : activeAction.toLowerCase().includes('call') || activeAction.toLowerCase().includes('meeting') ? <div className="action-empty"><Video size={22}/><strong>Calls and meetings</strong><span>Create a meeting draft and test browser permissions. Live rooms, invitations, participant lists and call history require backend and calling services.</span><div className="local-entry"><input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="Meeting title"/><input type="datetime-local" value={meetingWhen} onChange={e => setMeetingWhen(e.target.value)}/><button onClick={() => { if (meetingTitle.trim() && meetingWhen) { setMeetingDrafts(items => [meetingTitle.trim() + ' — ' + new Date(meetingWhen).toLocaleString(), ...items]); setMeetingTitle(''); setMeetingWhen(''); setNotice('Meeting draft saved on this device.'); } else setNotice('Enter a meeting title and date/time.'); }}>Save meeting draft</button></div>{meetingDrafts.map((item,index) => <div className="local-record" key={index}>{item}<button onClick={() => setMeetingDrafts(items => items.filter((_,i) => i !== index))}>Remove</button></div>)}<button className="setting-action" onClick={async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); stream.getTracks().forEach(track => track.stop()); setNotice('Camera and microphone permissions granted in this browser.'); } catch { setNotice('Camera or microphone permission was not granted. Check your browser settings.'); } }}>Test camera and microphone</button></div> : activeAction.toLowerCase().includes('membership') || activeAction.toLowerCase().includes('cell group') || activeAction.toLowerCase().includes('department') || activeAction.toLowerCase().includes('mentorship') || activeAction.toLowerCase().includes('leadership') || activeAction.toLowerCase().includes('giving') || activeAction.toLowerCase().includes('event') ? <div className="workspace-form">
  <div className="workspace-field"><label>Membership / chapter</label><input value={ministryData.chapter || ''} onChange={e => setMinistryData(v => ({...v,chapter:e.target.value}))} placeholder="Enter your chapter or fellowship"/></div>
  <div className="workspace-field"><label>Cell group</label><input value={ministryData.cell || ''} onChange={e => setMinistryData(v => ({...v,cell:e.target.value}))} placeholder="Your assigned cell group"/></div>
  <div className="workspace-field"><label>Department</label><select value={ministryData.department || 'Not selected'} onChange={e => setMinistryData(v => ({...v,department:e.target.value}))}><option>Not selected</option><option>Worship</option><option>Media & Communications</option><option>Prayer</option><option>Evangelism</option><option>Ushering</option><option>Administration</option><option>Other</option></select></div>
  <div className="workspace-field"><label>Mentorship preference</label><select value={ministryData.mentorship || 'Open to mentorship'} onChange={e => setMinistryData(v => ({...v,mentorship:e.target.value}))}><option>Open to mentorship</option><option>Request a mentor</option><option>Available to mentor</option><option>Not participating currently</option></select></div>
  <div className="workspace-field"><label>Giving and event interests</label><input value={ministryData.interests || ''} onChange={e => setMinistryData(v => ({...v,interests:e.target.value}))} placeholder="e.g. conferences, outreach, giving updates"/></div>
  <div className="workspace-callout"><ShieldCheck size={16}/><span>These are personal preference details only. Membership validation, giving transactions, event registration and leadership permissions will be handled securely by the FNI backend.</span></div>
  <button className="action-done" onClick={() => { localStorage.setItem('fni-ministry-settings',JSON.stringify(ministryData)); setNotice('Ministry preferences saved on this device.'); setActiveAction(''); }}>Save ministry preferences</button>
</div>
: activeAction.toLowerCase().includes('folder') ? <div className="workspace-form"><p>Create local chat folders to organise your future conversations.</p><div className="local-entry"><input value={actionDraft} onChange={e => setActionDraft(e.target.value)} placeholder="Folder name"/><button onClick={() => {if(actionDraft.trim()){setFolderNames(v=>[...v,actionDraft.trim()]);setActionDraft('');}}}>Create folder</button></div>{folderNames.map((name,i)=><div className="local-record" key={i}>{name}<button onClick={()=>setFolderNames(v=>v.filter((_,n)=>n!==i))}>Remove</button></div>)}</div>
: activeAction.toLowerCase().includes('blocked') ? <div className="workspace-form"><p>Blocked accounts are stored in this browser preview only. A real block will also prevent messages, calls and group invitations once server enforcement is connected.</p><div className="local-entry"><input value={actionDraft} onChange={e=>setActionDraft(e.target.value.replace(/^@/,''))} placeholder="Member username"/><button onClick={()=>{const name=actionDraft.trim().replace(/^@/,'');if(name && !blockedMembers.some(v=>v.toLowerCase()===name.toLowerCase())){setBlockedMembers(v=>[...v,name]);setActionDraft('');}}}>Block user</button></div>{blockedMembers.length ? blockedMembers.map((name,i)=><div className="local-record" key={i}>@{name}<button onClick={()=>setBlockedMembers(v=>v.filter((_,n)=>n!==i))}>Unblock</button></div>) : <div className="workspace-callout"><ShieldCheck size={16}/><span>You have no locally blocked users.</span></div>}</div>
: activeAction.toLowerCase().includes('report') || activeAction.toLowerCase().includes('appeal') ? <div className="workspace-form"><p>{activeAction.toLowerCase().includes('appeal') ? 'Prepare an appeal for a moderation decision. Include the decision reference if you have it.' : 'Tell the FNI safety team what happened. Include the relevant account, group or message reference.'} This preview stores drafts on this device only; it does not submit a report or notify moderators.</p><div className="workspace-field"><label>Username or content reference</label><input value={actionDraft} onChange={e=>setActionDraft(e.target.value)} placeholder="@username, group or message reference"/></div><div className="workspace-field"><label>Reason and details</label><textarea rows={4} value={savedDraft} onChange={e=>setSavedDraft(e.target.value)} placeholder="Describe the concern clearly..."/></div><div className="workspace-callout"><ShieldCheck size={16}/><span>When backend moderation is connected, reports will be private, reviewable by authorised moderators, and appeals will link to the original decision.</span></div><button className="setting-action" onClick={()=>{const reference=actionDraft.trim();const details=savedDraft.trim();if(!reference||!details){setNotice('Add a username or content reference and explain the concern first.');return;}setReportDrafts(items=>[{id:crypto.randomUUID(),type:activeAction,reference,details,createdAt:new Date().toISOString()},...items]);setActionDraft('');setSavedDraft('');setNotice('Report or appeal draft saved on this device. It has not been submitted.');}}>Save draft locally</button>{reportDrafts.length>0&&<><h4>Saved drafts</h4>{reportDrafts.map(item=><div className="local-record" key={item.id}><div><strong>{item.type}</strong><span>@{item.reference} · {new Date(item.createdAt).toLocaleString()}</span><p>{item.details}</p></div><button onClick={()=>setReportDrafts(items=>items.filter(d=>d.id!==item.id))}>Delete</button></div>)}</>}</div>
: activeAction.toLowerCase().includes('group invitation') ? <div className="workspace-form"><p>Choose which members may invite you to group conversations. This preference is saved in this browser; the server must enforce it when invitations are enabled.</p><div className="workspace-field"><label>Who can add me to groups?</label><select value={choices['privacy:Who can add me to groups'] ?? 'My contacts'} onChange={e=>setChoices(v=>({...v,'privacy:Who can add me to groups':e.target.value}))}><option>Everybody</option><option>My contacts</option><option>Nobody</option></select></div><button className="setting-action" onClick={()=>{setNotice('Group invitation preference saved on this device. Server enforcement requires backend integration.');setActiveAction('');}}>Save preference</button></div>
: activeAction.toLowerCase().includes('sticker') || activeAction.toLowerCase().includes('reaction') || activeAction.toLowerCase().includes('gif') ? <div className="sticker-preview"><button onClick={() => setNotice('Like reaction selected for preview.')}>👍 Like</button><button onClick={() => setNotice('Love reaction selected for preview.')}>❤️ Love</button><button onClick={() => setNotice('Prayer reaction selected for preview.')}>🙏 Prayer</button><button onClick={() => setNotice('Amen reaction selected for preview.')}>Amen</button><button onClick={() => setNotice('Praise reaction selected for preview.')}>Praise</button><button onClick={() => setNotice('Celebration reaction selected for preview.')}>🎉 Celebrate</button><p>Sticker pack installation and GIF search will be connected to the media service later.</p></div>
: activeAction.toLowerCase().includes('cache') || activeAction.toLowerCase().includes('storage') ? <div className="workspace-form"><div className="workspace-callout"><HardDrive size={16}/><span>Browser storage is currently used for local preferences and drafts. This preview does not download or cache shared media.</span></div><button className="setting-action" onClick={()=>{['fni-settings-toggles','fni-settings-choices','fni-saved-items','fni-moments','fni-meeting-drafts','fni-ministry-settings','fni-chat-folders','fni-blocked-members','fni-report-drafts'].forEach(k=>localStorage.removeItem(k));setSavedItems([]);setMoments([]);setMeetingDrafts([]);setMinistryData({});setFolderNames([]);setBlockedMembers([]);setReportDrafts([]);setToggles({});setChoices({});setNotice('Local FNI preview data cleared.');setActiveAction('');}}>Clear local preview data</button></div>
: activeAction.toLowerCase().includes('export') ? <div className="workspace-form"><p>Export the preferences and local drafts stored in this browser.</p><button className="setting-action" onClick={()=>{const payload={toggles,choices,savedItems,moments,meetingDrafts,ministryData,folderNames,blockedMembers,reportDrafts};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='fni-local-data-export.json';link.click();URL.revokeObjectURL(url);}}>Download local data export</button></div>
: activeAction.toLowerCase().includes('about') ? <div className="workspace-form"><strong>FNI — Forerunners Network International</strong><p>Community, communication and connection in one mobile-first experience.</p><span>Frontend preview. Backend services are not connected yet.</span></div>
: activeAction.toLowerCase().includes('help') ? <div className="workspace-form"><p>For support, prepare a description of the issue you experienced.</p><textarea value={actionDraft} onChange={e=>setActionDraft(e.target.value)} placeholder="Describe the issue..." rows={4}/><button className="setting-action" onClick={()=>{setNotice(actionDraft.trim()?'Support request draft saved locally.':'Describe the issue first.');}}>Save support draft</button></div>
: <div className="workspace-form"><div className="workspace-callout"><ShieldCheck size={16}/><span>This action requires a secure FNI account connection. No password, account deletion or sensitive security change is simulated in this frontend preview.</span></div><p>When the backend is connected, this screen will support the appropriate verification and confirmation flow.</p></div>}<button className="action-done" onClick={() => setActiveAction('')}>Done</button></section></div>}
      {notice && <div className="toast" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}><X size={15} /></button></div>}
    </main>
  </div>;
}

export default App;
