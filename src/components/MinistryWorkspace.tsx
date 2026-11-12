import { useMemo, useState } from 'react';
import {
  ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ChevronRight,
  CircleDollarSign, FileText, HandHeart, Headphones, MessageSquareText,
  PlayCircle, Plus, Radio, ScanLine, Search, ShieldCheck, UsersRound, X
} from 'lucide-react';

type MinistryArea = 'home' | 'sermons' | 'events' | 'resources' | 'forums' | 'prayer' | 'checkin' | 'giving';
type SermonDraft = { id: string; title: string; speaker: string; format: string; description: string; createdAt: string };

const areas: { id: Exclude<MinistryArea, 'home'>; title: string; description: string; detail: string; icon: typeof BookOpen }[] = [
  { id: 'sermons', title: 'Sermons & Media', description: 'Messages, videos, audio and teachings.', detail: 'A library for messages from Sir and approved guest speakers.', icon: PlayCircle },
  { id: 'events', title: 'Events & Announcements', description: 'Programmes, conferences and service updates.', detail: 'Official event listings, registration and ministry announcements.', icon: CalendarDays },
  { id: 'resources', title: 'Spiritual Resources', description: 'Scriptures, declarations and study notes.', detail: 'Daily scripture, yearly prophetic declarations and a personal spiritual journal.', icon: BookOpen },
  { id: 'forums', title: 'Community Forums', description: 'Topic-based conversations and fellowship.', detail: 'Organised discussions that complement FNI chats and groups.', icon: MessageSquareText },
  { id: 'prayer', title: 'Prayer & Testimonies', description: 'Share prayer needs and answered prayers.', detail: 'Private requests, testimonies and leadership follow-up.', icon: HandHeart },
  { id: 'checkin', title: 'Service Check-in', description: 'Attendance, guests and service participation.', detail: 'Service QR check-in, invitations and authorised attendance reports.', icon: ScanLine },
  { id: 'giving', title: 'In-App Giving', description: 'Tithes, offerings, donations and pledges.', detail: 'Secure card and Mobile Money giving with verified receipts.', icon: CircleDollarSign },
];

const descriptions: Record<Exclude<MinistryArea, 'home' | 'sermons'>, string[]> = {
  events: ['Upcoming programmes and conferences', 'Service times, venues and programme updates', 'Event registration and reminders', 'Announcements from authorised ministry leaders'],
  resources: ['Daily scripture and devotional reading', 'Yearly prophetic declarations', 'Bible reading and study plans', 'My Spiritual Journal for personal notes'],
  forums: ['Topic-based ministry discussions', 'Bible study questions and answers', 'Member testimonies and encouragement', 'Community guidelines and moderation'],
  prayer: ['Private prayer requests by default', 'Testimonies and answered prayers', 'Confidential pastoral attention requests', 'Restricted access for assigned prayer leaders'],
  checkin: ['Service QR code check-in', 'Invite friends and record guest visits', 'Personal attendance history', 'Attendance reports for authorised leaders'],
  giving: ['Tithes, offerings and special donations', 'Pledges and pledge progress', 'VISA and Mastercard', 'Mobile Money with verified transaction receipts'],
};

export default function MinistryWorkspace() {
  const [area, setArea] = useState<MinistryArea>('home');
  const [search, setSearch] = useState('');
  const [showDraft, setShowDraft] = useState(false);
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [format, setFormat] = useState('Video');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState('');
  const [drafts, setDrafts] = useState<SermonDraft[]>(() => {
    try { return JSON.parse(localStorage.getItem('fni-ministry-sermon-drafts') || '[]'); } catch { return []; }
  });
  const filteredAreas = useMemo(() => areas.filter(item => (item.title + ' ' + item.description).toLowerCase().includes(search.toLowerCase())), [search]);
  const selected = areas.find(item => item.id === area);

  function saveDraft() {
    if (!title.trim() || !speaker.trim()) { setNotice('Add a message title and speaker before saving.'); return; }
    const next = [{ id: crypto.randomUUID(), title: title.trim(), speaker: speaker.trim(), format, description: description.trim(), createdAt: new Date().toISOString() }, ...drafts];
    setDrafts(next);
    localStorage.setItem('fni-ministry-sermon-drafts', JSON.stringify(next));
    setTitle(''); setSpeaker(''); setDescription(''); setFormat('Video'); setShowDraft(false);
    setNotice('Sermon draft saved on this device. It has not been published.');
  }

  function removeDraft(id: string) {
    const next = drafts.filter(item => item.id !== id);
    setDrafts(next);
    localStorage.setItem('fni-ministry-sermon-drafts', JSON.stringify(next));
  }

  return <div className="ministry-workspace">
    {area === 'home' ? <>
      <div className="ministry-hero">
        <span className="ministry-eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span>
        <div className="ministry-hero-row"><div><h2>FNI Ministry</h2><p>Grow in the Word. Stay connected. Serve together.</p></div><div className="ministry-hero-mark"><ShieldCheck size={27}/></div></div>
        <div className="ministry-hero-foot"><span><span className="ministry-live-dot"/> Your ministry space</span><span>One place for church life and spiritual growth</span></div>
      </div>
      <div className="ministry-section-heading"><div><span className="ministry-kicker">EXPLORE</span><h3>Ministry spaces</h3><p>Choose an area to continue.</p></div></div>
      <label className="ministry-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ministry features..." /><span>{filteredAreas.length} sections</span></label>
      <div className="ministry-area-grid">
        {filteredAreas.map(item => { const Icon = item.icon; return <button key={item.id} className="ministry-area-card" onClick={() => setArea(item.id)}>
          <span className="ministry-area-icon"><Icon size={21}/></span><span className="ministry-area-copy"><strong>{item.title}</strong><small>{item.description}</small></span><ChevronRight size={17} className="ministry-area-arrow"/>
        </button>; })}
      </div>
      <div className="ministry-governance"><ShieldCheck size={17}/><div><strong>Ministry oversight</strong><p>Sir provides overall oversight. Approved ministry leaders can publish sermons and spiritual resources within their assigned permissions.</p></div></div>
    </> : area === 'sermons' ? <>
      <button className="ministry-back" onClick={() => setArea('home')}><ArrowLeft size={16}/> All Ministry</button>
      <div className="ministry-page-heading"><span className="ministry-kicker">MINISTRY CONTENT</span><div className="ministry-page-title-row"><div><h2>Sermons & Media</h2><p>Messages and teachings from Sir and approved guest speakers.</p></div><button className="ministry-primary-action" onClick={() => setShowDraft(true)}><Plus size={16}/> Prepare draft</button></div></div>
      <div className="ministry-content-notice"><Radio size={18}/><div><strong>Content library is being prepared</strong><p>Published sermons, audio and video will appear here when the ministry content service is connected.</p></div></div>
      <div className="ministry-feature-strip">
        <div><PlayCircle size={19}/><strong>Video messages</strong><span>Watch teachings and services</span></div>
        <div><Headphones size={19}/><strong>Audio messages</strong><span>Listen while on the move</span></div>
        <div><FileText size={19}/><strong>Message notes</strong><span>Keep key lessons and references</span></div>
      </div>
      <div className="ministry-section-heading draft-heading"><div><span className="ministry-kicker">YOUR WORKSPACE</span><h3>Local drafts</h3><p>Drafts are private to this browser until backend publishing is available.</p></div></div>
      {drafts.length ? <div className="ministry-draft-list">{drafts.map(item => <article className="ministry-draft-card" key={item.id}><div className="ministry-draft-type">{item.format === 'Audio' ? <Headphones size={17}/> : item.format === 'Article' ? <FileText size={17}/> : <PlayCircle size={17}/>}</div><div className="ministry-draft-copy"><strong>{item.title}</strong><span>{item.speaker} · {item.format}</span>{item.description && <p>{item.description}</p>}<small>Saved {new Date(item.createdAt).toLocaleString()}</small></div><button aria-label={'Delete '+item.title} onClick={() => removeDraft(item.id)}><X size={16}/></button></article>)}</div> : <div className="ministry-empty"><div><BookOpen size={23}/></div><strong>No sermon drafts yet</strong><p>Prepare a draft for a message you have permission to publish.</p><button className="ministry-secondary-action" onClick={() => setShowDraft(true)}>Prepare first draft</button></div>}
      <div className="ministry-permission-note"><ShieldCheck size={16}/><span>Publishing permissions will be verified against the member's FNI leadership role. Saving a draft here does not publish it or make it visible to members.</span></div>
    </> : <>
      <button className="ministry-back" onClick={() => setArea('home')}><ArrowLeft size={16}/> All Ministry</button>
      <div className="ministry-page-heading"><span className="ministry-kicker">FNI MINISTRY</span><h2>{selected?.title}</h2><p>{selected?.detail}</p></div>
      <div className="ministry-content-notice"><ShieldCheck size={18}/><div><strong>{selected?.title} workspace</strong><p>This section is included in the FNI Ministry architecture. Its operational tools will be built in the next development stages.</p></div></div>
      <div className="ministry-capability-list">{descriptions[area].map((line, index) => <div key={line}><CheckCircle2 size={17}/><span>{line}</span></div>)}</div>
      <div className="ministry-governance"><ShieldCheck size={17}/><div><strong>Access and privacy</strong><p>Actions in this area will follow Sir's oversight and the permissions assigned to authorised leaders. Sensitive member information will be restricted by role.</p></div></div>
    </>}
    {showDraft && <div className="ministry-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowDraft(false); }}><section className="ministry-modal" role="dialog" aria-modal="true" aria-labelledby="ministry-draft-title"><div className="ministry-modal-head"><div><span className="ministry-kicker">SERMONS & MEDIA</span><h3 id="ministry-draft-title">Prepare a sermon draft</h3></div><button onClick={() => setShowDraft(false)} aria-label="Close"><X size={18}/></button></div><p className="ministry-modal-intro">Prepare the details for a sermon or teaching. A leader's publishing access will be checked when the backend is connected.</p><label>Message title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter the sermon title"/></label><label>Speaker<input value={speaker} onChange={e => setSpeaker(e.target.value)} placeholder="Sir or guest speaker"/></label><label>Content format<select value={format} onChange={e => setFormat(e.target.value)}><option>Video</option><option>Audio</option><option>Article</option></select></label><label>Description<textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief summary, scripture references or key themes"/></label><div className="ministry-modal-warning"><ShieldCheck size={16}/> Drafts stay on this device. This does not upload media or publish content.</div><div className="ministry-modal-actions"><button className="ministry-secondary-action" onClick={() => setShowDraft(false)}>Cancel</button><button className="ministry-primary-action" onClick={saveDraft}>Save draft</button></div></section></div>}
    {notice && <div className="ministry-toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14}/></button></div>}
  </div>;
}
