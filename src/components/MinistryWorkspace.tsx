import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign,
  FileText, HandHeart, Headphones, MessageSquareText, PlayCircle, Plus, Radio,
  ScanLine, Search, ShieldCheck, UsersRound, X, Bookmark,
  Heart, LockKeyhole, CalendarCheck, Wallet, Sparkles, Trash2
} from 'lucide-react';

type MinistryArea = 'home' | 'sermons' | 'events' | 'resources' | 'forums' | 'prayer' | 'checkin' | 'giving';
type LocalItem = { id: string; title: string; body: string; category: string; createdAt: string; status?: string };
type SermonDraft = { id: string; title: string; speaker: string; format: string; description: string; createdAt: string };

const areas: { id: Exclude<MinistryArea, 'home'>; title: string; description: string; detail: string; icon: typeof BookOpen }[] = [
  { id: 'sermons', title: 'Sermons & Media', description: 'Messages, videos, audio and teachings.', detail: 'A library for messages from Sir and approved guest speakers.', icon: PlayCircle },
  { id: 'events', title: 'Events & Announcements', description: 'Programmes, conferences and service updates.', detail: 'Stay informed about FNI programmes, conferences and service arrangements.', icon: CalendarDays },
  { id: 'resources', title: 'Spiritual Resources', description: 'Scriptures, declarations and study notes.', detail: 'Keep your Bible study, declarations and personal spiritual notes together.', icon: BookOpen },
  { id: 'forums', title: 'Community Forums', description: 'Topic-based conversations and fellowship.', detail: 'Join thoughtful conversations around faith, ministry and fellowship.', icon: MessageSquareText },
  { id: 'prayer', title: 'Prayer & Testimonies', description: 'Share prayer needs and answered prayers.', detail: 'Share a prayer need privately or encourage the community with a testimony.', icon: HandHeart },
  { id: 'checkin', title: 'Service Check-in', description: 'Attendance, guests and service participation.', detail: 'Keep a personal record of services attended and guests you invite.', icon: ScanLine },
  { id: 'giving', title: 'In-App Giving', description: 'Tithes, offerings, donations and pledges.', detail: 'Review giving options and prepare a giving intention for FNI.', icon: CircleDollarSign },
];

const storage = {
  read<T,>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
  },
  write(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
};

function makeItem(title: string, body: string, category: string, status?: string): LocalItem {
  return { id: crypto.randomUUID(), title: title.trim(), body: body.trim(), category, createdAt: new Date().toISOString(), status };
}

export default function MinistryWorkspace() {
  const [area, setArea] = useState<MinistryArea>('home');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [drafts, setDrafts] = useState<SermonDraft[]>(() => storage.read('fni-ministry-sermon-drafts', []));
  const [events, setEvents] = useState<LocalItem[]>(() => storage.read('fni-ministry-event-drafts', []));
  const [resources, setResources] = useState<LocalItem[]>(() => storage.read('fni-ministry-resource-notes', []));
  const [topics, setTopics] = useState<LocalItem[]>(() => storage.read('fni-ministry-forum-topics', []));
  const [prayers, setPrayers] = useState<LocalItem[]>(() => storage.read('fni-ministry-prayer-items', []));
  const [checkins, setCheckins] = useState<LocalItem[]>(() => storage.read('fni-ministry-checkins', []));
  const [intentions, setIntentions] = useState<LocalItem[]>(() => storage.read('fni-ministry-giving-intentions', []));
  const [showDraft, setShowDraft] = useState(false);
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [format, setFormat] = useState('Video');
  const [description, setDescription] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [privatePrayer, setPrivatePrayer] = useState(true);
  const [givingAmount, setGivingAmount] = useState('');
  const [givingType, setGivingType] = useState('Offering');
  const [eventDate, setEventDate] = useState('');
  const [resourceTab, setResourceTab] = useState<'Study notes' | 'Declarations' | 'Journal'>('Study notes');
  const [prayerTab, setPrayerTab] = useState<'Requests' | 'Testimonies'>('Requests');

  const filteredAreas = useMemo(() => areas.filter(item => (item.title + ' ' + item.description).toLowerCase().includes(search.toLowerCase())), [search]);
  const selected = areas.find(item => item.id === area);

  function saveDraft() {
    if (!title.trim() || !speaker.trim()) { setNotice('Add a message title and speaker before saving.'); return; }
    const next = [{ id: crypto.randomUUID(), title: title.trim(), speaker: speaker.trim(), format, description: description.trim(), createdAt: new Date().toISOString() }, ...drafts];
    setDrafts(next); storage.write('fni-ministry-sermon-drafts', next);
    setTitle(''); setSpeaker(''); setDescription(''); setFormat('Video'); setShowDraft(false);
    setNotice('Sermon draft saved on this device. It has not been published.');
  }

  function removeDraft(id: string) {
    const next = drafts.filter(item => item.id !== id);
    setDrafts(next); storage.write('fni-ministry-sermon-drafts', next);
  }

  function saveAreaItem() {
    if (!formTitle.trim()) { setNotice('Add a title before saving.'); return; }
    let item: LocalItem;
    if (area === 'events') {
      item = makeItem(formTitle, formBody + (eventDate ? '\nDate: ' + eventDate : ''), 'Event draft', 'Draft');
      const next = [item, ...events]; setEvents(next); storage.write('fni-ministry-event-drafts', next);
    } else if (area === 'resources') {
      item = makeItem(formTitle, formBody, resourceTab); const next = [item, ...resources]; setResources(next); storage.write('fni-ministry-resource-notes', next);
    } else if (area === 'forums') {
      item = makeItem(formTitle, formBody, formCategory || 'General'); const next = [item, ...topics]; setTopics(next); storage.write('fni-ministry-forum-topics', next);
    } else if (area === 'prayer') {
      item = makeItem(formTitle, formBody, prayerTab, privatePrayer ? 'Private on this device' : 'Personal draft');
      const next = [item, ...prayers]; setPrayers(next); storage.write('fni-ministry-prayer-items', next);
    } else if (area === 'checkin') {
      item = makeItem(formTitle, formBody, 'Personal attendance', 'Saved locally');
      const next = [item, ...checkins]; setCheckins(next); storage.write('fni-ministry-checkins', next);
    } else {
      item = makeItem(formTitle, formBody, givingType, 'Intention only');
      const next = [item, ...intentions]; setIntentions(next); storage.write('fni-ministry-giving-intentions', next);
    }
    setFormTitle(''); setFormBody(''); setFormCategory(''); setEventDate(''); setFormOpen(false);
    setNotice(area === 'giving' ? 'Giving intention saved on this device. No payment was made.' : 'Saved on this device. It has not been sent or published.');
  }

  function removeAreaItem(id: string) {
    if (area === 'events') { const next = events.filter(x => x.id !== id); setEvents(next); storage.write('fni-ministry-event-drafts', next); }
    if (area === 'resources') { const next = resources.filter(x => x.id !== id); setResources(next); storage.write('fni-ministry-resource-notes', next); }
    if (area === 'forums') { const next = topics.filter(x => x.id !== id); setTopics(next); storage.write('fni-ministry-forum-topics', next); }
    if (area === 'prayer') { const next = prayers.filter(x => x.id !== id); setPrayers(next); storage.write('fni-ministry-prayer-items', next); }
    if (area === 'checkin') { const next = checkins.filter(x => x.id !== id); setCheckins(next); storage.write('fni-ministry-checkins', next); }
    if (area === 'giving') { const next = intentions.filter(x => x.id !== id); setIntentions(next); storage.write('fni-ministry-giving-intentions', next); }
  }

  function openAreaForm() {
    setFormTitle(''); setFormBody(''); setFormCategory(''); setEventDate(''); setFormOpen(true);
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
        {filteredAreas.map(item => { const Icon = item.icon; return <button key={item.id} className="ministry-area-card" onClick={() => { setArea(item.id); setFormOpen(false); }}>
          <span className="ministry-area-icon"><Icon size={21}/></span><span className="ministry-area-copy"><strong>{item.title}</strong><small>{item.description}</small></span><ChevronRight size={17} className="ministry-area-arrow"/>
        </button>; })}
        {filteredAreas.length === 0 && <div className="ministry-no-results">No ministry areas match “{search}”. Try another search.</div>}
      </div>
      <div className="ministry-governance"><ShieldCheck size={17}/><div><strong>Ministry oversight</strong><p>Sir provides overall oversight. Approved ministry leaders can publish sermons and spiritual resources within their assigned permissions.</p></div></div>
    </> : <>
      <button className="ministry-back" onClick={() => { setArea('home'); setFormOpen(false); }}><ArrowLeft size={16}/> All Ministry</button>
      <div className="ministry-page-heading">
        <span className="ministry-kicker">FNI MINISTRY</span>
        <div className="ministry-page-title-row"><div><h2>{selected?.title}</h2><p>{selected?.detail}</p></div>
          {area !== 'sermons' && area !== 'giving' && <button className="ministry-primary-action" onClick={openAreaForm}><Plus size={16}/>{area === 'events' ? 'Add event' : area === 'resources' ? 'New note' : area === 'forums' ? 'New topic' : area === 'prayer' ? 'New entry' : 'Check in'}</button>}
        </div>
      </div>

      {area === 'sermons' && <>
        <div className="ministry-media-feature">
          <div className="ministry-media-art"><div className="ministry-media-emblem"><PlayCircle size={32}/></div><span>FNI MESSAGE LIBRARY</span></div>
          <div className="ministry-media-copy"><span className="ministry-kicker">SERMONS & TEACHINGS</span><h3>Grow through the Word</h3><p>Watch, listen to and revisit messages from Sir and approved guest speakers.</p><button className="ministry-primary-action" onClick={() => setShowDraft(true)}><Plus size={16}/> Prepare a message draft</button></div>
        </div>
        <div className="ministry-feature-strip">
          <div><PlayCircle size={19}/><strong>Video messages</strong><span>Teaching and service recordings</span></div>
          <div><Headphones size={19}/><strong>Audio messages</strong><span>Listen to messages on the move</span></div>
          <div><FileText size={19}/><strong>Message notes</strong><span>Keep key lessons and references</span></div>
        </div>
        <div className="ministry-section-heading draft-heading"><div><span className="ministry-kicker">YOUR WORKSPACE</span><h3>Message drafts</h3><p>Private drafts saved in this browser.</p></div></div>
        {drafts.length ? <div className="ministry-draft-list">{drafts.map(item => <article className="ministry-draft-card" key={item.id}><div className="ministry-draft-type">{item.format === 'Audio' ? <Headphones size={17}/> : item.format === 'Article' ? <FileText size={17}/> : <PlayCircle size={17}/>}</div><div className="ministry-draft-copy"><strong>{item.title}</strong><span>{item.speaker} · {item.format}</span>{item.description && <p>{item.description}</p>}<small>Saved {new Date(item.createdAt).toLocaleString()}</small></div><button aria-label={'Delete '+item.title} onClick={() => removeDraft(item.id)}><Trash2 size={16}/></button></article>)}</div> : <div className="ministry-empty"><div><BookOpen size={23}/></div><strong>No message drafts yet</strong><p>Prepare a message draft for an approved ministry leader.</p><button className="ministry-secondary-action" onClick={() => setShowDraft(true)}>Prepare first draft</button></div>}
        <div className="ministry-service-note"><Radio size={17}/><span>The published media library will appear when FNI's content service is connected. Drafting works locally; media upload and publishing are not active yet.</span></div>
      </>}

      {area === 'events' && <>
        <div className="ministry-event-banner"><div className="ministry-banner-icon"><CalendarDays size={25}/></div><div><span className="ministry-kicker">FNI CHURCH LIFE</span><h3>Gather. Grow. Connect.</h3><p>Programmes, conferences and service updates in one place.</p></div></div>
        <div className="ministry-stats-row"><div><CalendarCheck size={18}/><strong>{events.length}</strong><span>Your event drafts</span></div><div><BellIcon/><strong>Updates</strong><span>Official notices appear here</span></div></div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">MY EVENTS</span><h3>Event planner</h3><p>Create and keep event details before publishing.</p></div></div>
        <ItemList items={events} emptyTitle="No event drafts" emptyText="Create an event draft with its date, venue and details." onRemove={removeAreaItem}/>
        {formOpen && <EntryForm title="Create an event draft" submitLabel="Save event draft" onCancel={() => setFormOpen(false)} onSave={saveAreaItem}>
          <label>Event or programme name<input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. FNI Sunday Service"/></label>
          <label>Date and time<input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)}/></label>
          <label>Venue and details<textarea rows={3} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Venue, service time, registration information..."/></label>
        </EntryForm>}
      </>}

      {area === 'resources' && <>
        <div className="ministry-resource-banner"><div className="ministry-resource-verse">“Your word is a lamp to my feet and a light to my path.”<small>PSALM 119:105 · KJV</small></div><BookOpen size={27}/></div>
        <div className="ministry-tabs">{(['Study notes','Declarations','Journal'] as const).map(tab => <button key={tab} className={resourceTab === tab ? 'active' : ''} onClick={() => setResourceTab(tab)}>{tab}</button>)}</div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">PERSONAL LIBRARY</span><h3>{resourceTab}</h3><p>Save your own study material and reflections.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/> Add note</button></div>
        <ItemList items={resources.filter(x => x.category === resourceTab)} emptyTitle={'No '+resourceTab.toLowerCase()+' saved'} emptyText="Add a personal note to keep it in your FNI space." onRemove={removeAreaItem}/>
        {formOpen && <EntryForm title={'New '+resourceTab.toLowerCase()} submitLabel="Save note" onCancel={() => setFormOpen(false)} onSave={saveAreaItem}>
          <label>Title<input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Give your note a title"/></label>
          <label>Scripture reference or reflection<textarea rows={5} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Write your notes, declarations or reflection..."/></label>
        </EntryForm>}
        <div className="ministry-service-note"><LockKeyhole size={16}/><span>Your personal notes are stored only in this browser. Official FNI resources and licensed Bible content are not connected yet.</span></div>
      </>}

      {area === 'forums' && <>
        <div className="ministry-forum-banner"><div className="ministry-banner-icon"><UsersRound size={25}/></div><div><span className="ministry-kicker">FNI FELLOWSHIP</span><h3>Faith grows in fellowship.</h3><p>Prepare meaningful conversations around the Word and ministry life.</p></div></div>
        <div className="ministry-forum-categories"><button className={formCategory === 'Bible Study' ? 'selected' : ''} onClick={() => setFormCategory('Bible Study')}>Bible Study</button><button className={formCategory === 'Faith & Life' ? 'selected' : ''} onClick={() => setFormCategory('Faith & Life')}>Faith & Life</button><button className={formCategory === 'Ministry' ? 'selected' : ''} onClick={() => setFormCategory('Ministry')}>Ministry</button><button className={formCategory === 'Testimonies' ? 'selected' : ''} onClick={() => setFormCategory('Testimonies')}>Testimonies</button></div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">DISCUSSIONS</span><h3>Community topics</h3><p>Start a topic draft for a future moderated forum.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/> New topic</button></div>
        <ItemList items={formCategory ? topics.filter(x => x.category === formCategory) : topics} emptyTitle="No topics yet" emptyText="Start a discussion draft. It will stay on this device until forums are connected." onRemove={removeAreaItem}/>
        {formOpen && <EntryForm title="Start a discussion draft" submitLabel="Save topic" onCancel={() => setFormOpen(false)} onSave={saveAreaItem}>
          <label>Topic title<input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="What would you like to discuss?"/></label>
          <label>Category<select value={formCategory} onChange={e => setFormCategory(e.target.value)}><option value="">Choose a category</option><option>Bible Study</option><option>Faith & Life</option><option>Ministry</option><option>Testimonies</option></select></label>
          <label>Opening message<textarea rows={4} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Share the question or thought behind this topic..."/></label>
        </EntryForm>}
        <div className="ministry-service-note"><MessageSquareText size={16}/><span>Forum drafts are local. Public discussions, replies and moderation require the FNI community service.</span></div>
      </>}

      {area === 'prayer' && <>
        <div className="ministry-prayer-banner"><div className="ministry-prayer-symbol"><HandHeart size={26}/></div><div><span className="ministry-kicker">WE STAND TOGETHER</span><h3>You are not alone.</h3><p>Share a prayer need or record what God has done.</p></div></div>
        <div className="ministry-tabs">{(['Requests','Testimonies'] as const).map(tab => <button key={tab} className={prayerTab === tab ? 'active' : ''} onClick={() => { setPrayerTab(tab); setFormOpen(false); }}>{tab}</button>)}</div>
        <div className="ministry-prayer-prompt"><Heart size={17}/><span>{prayerTab === 'Requests' ? 'Your request is personal and should be handled with care.' : 'Your testimony can encourage someone else in faith.'}</span></div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">MY {prayerTab.toUpperCase()}</span><h3>{prayerTab === 'Requests' ? 'Prayer requests' : 'Testimony drafts'}</h3><p>Keep a private record before sharing with the ministry.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/>{prayerTab === 'Requests' ? 'New request' : 'Add testimony'}</button></div>
        <ItemList items={prayers.filter(x => x.category === prayerTab)} emptyTitle={prayerTab === 'Requests' ? 'No prayer requests saved' : 'No testimony drafts'} emptyText="Use the button above to add your entry." onRemove={removeAreaItem}/>
        {formOpen && <EntryForm title={prayerTab === 'Requests' ? 'Write a prayer request' : 'Prepare a testimony'} submitLabel="Save privately" onCancel={() => setFormOpen(false)} onSave={saveAreaItem}>
          <label>Title<input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={prayerTab === 'Requests' ? 'A short title for your request' : 'What are you thankful for?'}/></label>
          <label>{prayerTab === 'Requests' ? 'Prayer details' : 'Testimony'}<textarea rows={5} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Write your message..."/></label>
          {prayerTab === 'Requests' && <label className="ministry-checkbox"><input type="checkbox" checked={privatePrayer} onChange={e => setPrivatePrayer(e.target.checked)}/> Keep this request private on this device</label>}
        </EntryForm>}
        <div className="ministry-service-note"><LockKeyhole size={16}/><span>Privacy note: these entries are saved locally in this browser only. They are not sent to Sir or a prayer team, and this is not a confidential pastoral channel yet.</span></div>
      </>}

      {area === 'checkin' && <>
        <div className="ministry-checkin-card"><div className="ministry-checkin-top"><div><span className="ministry-kicker">WORSHIP & FELLOWSHIP</span><h3>Be present. Stay connected.</h3><p>Keep track of services you attend.</p></div><div className="ministry-checkin-icon"><ScanLine size={27}/></div></div><div className="ministry-checkin-stats"><div><strong>{checkins.length}</strong><span>Personal records</span></div><div><strong>{checkins.length ? new Date(checkins[0].createdAt).toLocaleDateString() : '—'}</strong><span>Last check-in</span></div></div></div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">MY ATTENDANCE</span><h3>Service history</h3><p>Record your attendance locally for now.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><ScanLine size={15}/> Check in</button></div>
        <ItemList items={checkins} emptyTitle="No attendance recorded" emptyText="When you attend a service, add a personal attendance record here." onRemove={removeAreaItem}/>
        {formOpen && <EntryForm title="Record service attendance" submitLabel="Save attendance" onCancel={() => setFormOpen(false)} onSave={saveAreaItem}>
          <label>Service or programme<input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Sunday Worship Service"/></label>
          <label>Location and notes<textarea rows={3} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Church location, invited guest or notes..."/></label>
        </EntryForm>}
        <div className="ministry-service-note"><ScanLine size={16}/><span>This is a personal attendance note, not an official church check-in. QR validation, guest invitations and attendance reporting are not connected.</span></div>
      </>}

      {area === 'giving' && <>
        <div className="ministry-giving-banner"><div className="ministry-giving-mark"><Wallet size={26}/></div><span className="ministry-kicker">GENEROSITY & STEWARDSHIP</span><h3>Give with a joyful heart.</h3><p>Prepare your giving intention. Secure payments will be enabled only after an approved payment provider is connected.</p></div>
        <div className="ministry-giving-options"><div><span className="ministry-giving-option-icon"><Heart size={17}/></span><strong>Tithes</strong><small>Faithful giving</small></div><div><span className="ministry-giving-option-icon"><HandHeart size={17}/></span><strong>Offerings</strong><small>Worship through giving</small></div><div><span className="ministry-giving-option-icon"><Sparkles size={17}/></span><strong>Special gifts</strong><small>Support ministry work</small></div></div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">MY GIVING</span><h3>Giving intentions</h3><p>Keep a private note of what you plan to give.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/> New intention</button></div>
        <ItemList items={intentions} emptyTitle="No giving intentions" emptyText="Prepare a personal giving note. This will not process a payment." onRemove={removeAreaItem}/>
        {formOpen && <EntryForm title="Prepare a giving intention" submitLabel="Save intention" onCancel={() => setFormOpen(false)} onSave={() => { if (!givingAmount.trim()) { setNotice('Enter an amount or write “To decide”.'); return; } const item = makeItem(givingType + ' · GHS ' + givingAmount.trim(), formBody, givingType, 'Intention only'); const next = [item, ...intentions]; setIntentions(next); storage.write('fni-ministry-giving-intentions', next); setGivingAmount(''); setFormBody(''); setFormOpen(false); setNotice('Giving intention saved on this device. No payment was made.'); }}>
          <label>Giving type<select value={givingType} onChange={e => setGivingType(e.target.value)}><option>Tithe</option><option>Offering</option><option>Special donation</option><option>Pledge</option></select></label>
          <label>Amount (GHS)<input value={givingAmount} onChange={e => setGivingAmount(e.target.value)} placeholder="e.g. 100 or To decide"/></label>
          <label>Note (optional)<textarea rows={3} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Optional personal note"/></label>
        </EntryForm>}
        <div className="ministry-payment-methods"><strong>Payment methods planned</strong><span>VISA</span><span>Mastercard</span><span>Mobile Money</span></div>
        <div className="ministry-service-note"><LockKeyhole size={16}/><span>No payment details are collected and no money is transferred in this preview. Payment processing will require a secure provider and verified receipts.</span></div>
      </>}
    </>}

    {showDraft && <div className="ministry-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowDraft(false); }}><section className="ministry-modal" role="dialog" aria-modal="true" aria-labelledby="ministry-draft-title"><div className="ministry-modal-head"><div><span className="ministry-kicker">SERMONS & MEDIA</span><h3 id="ministry-draft-title">Prepare a message draft</h3></div><button onClick={() => setShowDraft(false)} aria-label="Close"><X size={18}/></button></div><p className="ministry-modal-intro">Prepare details for a sermon or teaching. This does not upload media or publish content.</p><label>Message title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter the message title"/></label><label>Speaker<input value={speaker} onChange={e => setSpeaker(e.target.value)} placeholder="Sir or guest speaker"/></label><label>Content format<select value={format} onChange={e => setFormat(e.target.value)}><option>Video</option><option>Audio</option><option>Article</option></select></label><label>Description<textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Summary, scripture references or key themes"/></label><div className="ministry-modal-warning"><ShieldCheck size={16}/> Drafts stay on this device. Publishing and media uploads are not active.</div><div className="ministry-modal-actions"><button className="ministry-secondary-action" onClick={() => setShowDraft(false)}>Cancel</button><button className="ministry-primary-action" onClick={saveDraft}>Save draft</button></div></section></div>}
    {notice && <div className="ministry-toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14}/></button></div>}
  </div>;
}

function BellIcon() { return <Radio size={18}/>; }

function ItemList({ items, emptyTitle, emptyText, onRemove }: { items: LocalItem[]; emptyTitle: string; emptyText: string; onRemove: (id: string) => void }) {
  if (!items.length) return <div className="ministry-empty"><div><FileText size={22}/></div><strong>{emptyTitle}</strong><p>{emptyText}</p></div>;
  return <div className="ministry-draft-list">{items.map(item => <article className="ministry-draft-card" key={item.id}><div className="ministry-draft-type"><Bookmark size={17}/></div><div className="ministry-draft-copy"><strong>{item.title}</strong><span>{item.category}{item.status ? ' · '+item.status : ''}</span>{item.body && <p>{item.body}</p>}<small>{new Date(item.createdAt).toLocaleString()}</small></div><button aria-label={'Delete '+item.title} onClick={() => onRemove(item.id)}><Trash2 size={16}/></button></article>)}</div>;
}

function EntryForm({ title, submitLabel, onCancel, onSave, children }: { title: string; submitLabel: string; onCancel: () => void; onSave: () => void; children: ReactNode }) {
  return <section className="ministry-entry-form"><div className="ministry-entry-head"><div><span className="ministry-kicker">PERSONAL WORKSPACE</span><h3>{title}</h3></div><button onClick={onCancel} aria-label="Close form"><X size={17}/></button></div><div className="ministry-entry-fields">{children}</div><div className="ministry-modal-actions"><button className="ministry-secondary-action" onClick={onCancel}>Cancel</button><button className="ministry-primary-action" onClick={onSave}><CheckCircle2 size={15}/>{submitLabel}</button></div></section>;
}
