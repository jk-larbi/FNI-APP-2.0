import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign,
  FileText, HandHeart, Headphones, MessageSquareText, PlayCircle, Plus, Radio,
  ScanLine, Search, ShieldCheck, UsersRound, X, Bookmark,
  Heart, LockKeyhole, CalendarCheck, Wallet, Sparkles, Trash2, Gift, Images as ImagesIcon
} from 'lucide-react';

type MinistryArea = 'home' | 'media' | 'sermons' | 'events' | 'resources' | 'forums' | 'prayer' | 'checkin' | 'giving';
type LocalItem = { id: string; title: string; body: string; category: string; createdAt: string; status?: string };
type SermonDraft = { id: string; title: string; speaker: string; format: string; description: string; createdAt: string };

const areas: { id: Exclude<MinistryArea, 'home'>; title: string; description: string; detail: string; icon: typeof BookOpen }[] = [
  { id: 'media', title: 'Media Library', description: 'Ministry photos and video highlights.', detail: 'A visual library for approved FNI photos and video highlights.', icon: ImagesIcon },
  { id: 'sermons', title: 'Sermons & Messages', description: 'Video, audio, teachings and shared links.', detail: 'Watch and listen to messages from Sir and appointed ministry leaders.', icon: PlayCircle },
  { id: 'events', title: 'Events & Announcements', description: 'Programmes, conferences and service updates.', detail: 'Stay informed about FNI programmes, conferences and service arrangements.', icon: CalendarDays },
  { id: 'resources', title: 'Spiritual Resources', description: 'Scriptures, declarations and study notes.', detail: 'Keep your Bible study, declarations and personal spiritual notes together.', icon: BookOpen },
  { id: 'forums', title: 'Community Forums', description: 'Topic-based conversations and fellowship.', detail: 'Join thoughtful conversations around faith, ministry and fellowship.', icon: MessageSquareText },
  { id: 'prayer', title: 'Prayer Requests & Testimonies', description: 'Private prayer needs, follow-ups and approved testimonies.', detail: 'Share prayer needs with the right privacy choice and submit testimonies for review.', icon: HandHeart },
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
  const [mediaDrafts, setMediaDrafts] = useState<LocalItem[]>(() => storage.read('fni-ministry-media-drafts', []));
  const [messageLink, setMessageLink] = useState('');
  const [mediaLink, setMediaLink] = useState('');
  const [mediaKind, setMediaKind] = useState('Video');
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
  const [events, setEvents] = useState<LocalItem[]>(() => storage.read('fni-ministry-event-drafts', []));
  const [resources, setResources] = useState<LocalItem[]>(() => storage.read('fni-ministry-resource-notes', []));
  const [topics, setTopics] = useState<LocalItem[]>(() => storage.read('fni-ministry-forum-topics', []));
  const [prayers, setPrayers] = useState<LocalItem[]>(() => { const saved=storage.read<LocalItem[]>('fni-ministry-prayer-items', []); const legacy=storage.read<LocalItem[]>('fni-ministry-prayer-wall', []).map(item=>({...item,category:'Prayer request',status:item.status||'Confidential'})); const merged=[...saved,...legacy.filter(item=>!saved.some(existing=>existing.id===item.id))]; if(legacy.length) storage.write('fni-ministry-prayer-items',merged); return merged; });
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
  const [resourceTab, setResourceTab] = useState<'Daily Scripture' | 'Declarations' | 'Bible Studies' | 'Sermon Notes' | 'My Notes'>('My Notes');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceFolder, setResourceFolder] = useState('All folders');
  const [resourceFolders, setResourceFolders] = useState<string[]>(() => storage.read('fni-resource-folders', ['General', 'Bible Study', 'Sermons']));
  const [resourceFavorites, setResourceFavorites] = useState<string[]>(() => storage.read('fni-resource-favorites', []));
  const [showResourceFavorites, setShowResourceFavorites] = useState(false);
  const [prayerTab, setPrayerTab] = useState<'Requests' | 'Testimonies'>('Requests');
  const [prayerCategory, setPrayerCategory] = useState('Personal');
  const [prayerVisibility, setPrayerVisibility] = useState<'Confidential' | 'Prayer team'>('Confidential');
  const [resourceFolderDraft, setResourceFolderDraft] = useState('');

  const filteredAreas = useMemo(() => areas.filter(item => (item.title + ' ' + item.description).toLowerCase().includes(search.toLowerCase())), [search]);
  const selected = areas.find(item => item.id === area);

  function saveDraft() {
    if (!title.trim() || !speaker.trim()) { setNotice('Add a message title and speaker before saving.'); return; }
    if (messageLink.trim() && !/^https?:\/\//i.test(messageLink.trim())) { setNotice('Enter a valid http or https link.'); return; }
    const next = [{ id: crypto.randomUUID(), title: title.trim(), speaker: speaker.trim(), format, description: [description.trim(), messageLink.trim() ? 'Link: ' + messageLink.trim() : ''].filter(Boolean).join('\n'), createdAt: new Date().toISOString() }, ...drafts];
    setDrafts(next); storage.write('fni-ministry-sermon-drafts', next);
    setTitle(''); setSpeaker(''); setDescription(''); setMessageLink(''); setFormat('Video'); setShowDraft(false);
    setNotice('Sermon draft saved on this device. It has not been published.');
  }

  function removeDraft(id: string) {
    const next = drafts.filter(item => item.id !== id);
    setDrafts(next); storage.write('fni-ministry-sermon-drafts', next);
  }

  function saveAreaItem() {
    if (area !== 'prayer' && !formTitle.trim()) { setNotice('Add a title before saving.'); return; }
    if (area === 'prayer' && !formBody.trim()) { setNotice('Add some details before saving.'); return; }
    let item: LocalItem;
    if (area === 'media') {
      if (!mediaLink.trim()) { setNotice('Add a media link before saving.'); return; }
      if (!/^https?:\/\//i.test(mediaLink.trim())) { setNotice('Enter a valid http or https media link.'); return; }
      item = makeItem(formTitle, [formBody, eventDate ? 'Event date: ' + eventDate : '', 'Media link: ' + mediaLink.trim()].filter(Boolean).join('\n'), mediaKind, 'Media draft');
      const next = [item, ...mediaDrafts]; setMediaDrafts(next); storage.write('fni-ministry-media-drafts', next);
    } else if (area === 'events') {
      item = makeItem(formTitle, formBody + (eventDate ? '\nDate: ' + eventDate : ''), 'Event draft', 'Draft');
      const next = [item, ...events]; setEvents(next); storage.write('fni-ministry-event-drafts', next);
    } else if (area === 'resources') {
      item = makeItem(formTitle, formBody, resourceTab); const next = [item, ...resources]; setResources(next); storage.write('fni-ministry-resource-notes', next);
    } else if (area === 'forums') {
      item = makeItem(formTitle, formBody, formCategory || 'General'); const next = [item, ...topics]; setTopics(next); storage.write('fni-ministry-forum-topics', next);
    } else if (area === 'prayer') {
      const category = prayerTab === 'Requests' ? 'Prayer request' : 'Testimony';
      if (prayerTab === 'Testimonies' && mediaLink.trim() && !/^https?:\/\//i.test(mediaLink.trim())) { setNotice('Enter a valid http or https media link.'); return; }
      item = makeItem(formTitle.trim() || (prayerTab === 'Requests' ? 'Prayer request' : 'Testimony'), [formBody.trim(), prayerTab === 'Requests' ? 'Category: ' + prayerCategory + ' · ' + prayerVisibility : 'Sharing: Pending member approval', mediaLink.trim() ? 'Attachment link: ' + mediaLink.trim() : ''].filter(Boolean).join('\n'), category, prayerTab === 'Requests' ? 'Submitted · ' + prayerVisibility : 'Awaiting review');
      const next = [item, ...prayers]; setPrayers(next); storage.write('fni-ministry-prayer-items', next);
    } else if (area === 'checkin') {
      item = makeItem(formTitle, formBody, 'Personal attendance', 'Saved locally');
      const next = [item, ...checkins]; setCheckins(next); storage.write('fni-ministry-checkins', next);
    } else {
      item = makeItem(formTitle, formBody, givingType, 'Intention only');
      const next = [item, ...intentions]; setIntentions(next); storage.write('fni-ministry-giving-intentions', next);
    }
    setFormTitle(''); setFormBody(''); setFormCategory(''); setEventDate(''); setMediaLink(''); setFormOpen(false);
    setNotice(area === 'giving' ? 'Giving intention saved on this device. No payment was made.' : 'Saved on this device. It has not been sent or published.');
  }

  function removeAreaItem(id: string) {
    if (area === 'media') { const next = mediaDrafts.filter(x => x.id !== id); setMediaDrafts(next); storage.write('fni-ministry-media-drafts', next); }
    if (area === 'events') { const next = events.filter(x => x.id !== id); setEvents(next); storage.write('fni-ministry-event-drafts', next); }
    if (area === 'resources') { const next = resources.filter(x => x.id !== id); setResources(next); storage.write('fni-ministry-resource-notes', next); }
    if (area === 'forums') { const next = topics.filter(x => x.id !== id); setTopics(next); storage.write('fni-ministry-forum-topics', next); }
    if (area === 'prayer') { const next = prayers.filter(x => x.id !== id); setPrayers(next); storage.write('fni-ministry-prayer-items', next); }
    if (area === 'checkin') { const next = checkins.filter(x => x.id !== id); setCheckins(next); storage.write('fni-ministry-checkins', next); }
    if (area === 'giving') { const next = intentions.filter(x => x.id !== id); setIntentions(next); storage.write('fni-ministry-giving-intentions', next); }
  }

  function openAreaForm() {
    setFormTitle(''); setFormBody(''); setFormCategory(''); setEventDate(''); setMediaLink(''); setFormOpen(true);
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
      <div className="ministry-governance"><ShieldCheck size={17}/><div><strong>Ministry oversight</strong><p>Sir provides overall oversight. The media team manages photos and video highlights; Sir, the admin and appointed leaders manage sermons, audio and written messages. Published ministry content is intended for all FNI members.</p></div></div>
    </> : <>
      <button className="ministry-back" onClick={() => { setArea('home'); setFormOpen(false); }}><ArrowLeft size={16}/> All Ministry</button>
      <div className="ministry-page-heading">
        <span className="ministry-kicker">FNI MINISTRY</span>
        <div className="ministry-page-title-row"><div><h2>{selected?.title}</h2><p>{selected?.detail}</p></div>
          {area !== 'giving' && <button className="ministry-primary-action" onClick={openAreaForm}><Plus size={16}/>{area === 'media' ? 'Add media' : area === 'events' ? 'Add event' : area === 'resources' ? 'New note' : area === 'forums' ? 'New topic' : area === 'prayer' ? (prayerTab === 'Requests' ? 'New request' : 'Add testimony') : 'Check in'}</button>}
        </div>
      </div>

      {area === 'media' && <>
        <div className="ministry-media-feature"><div className="ministry-media-art"><div className="ministry-media-emblem"><ImagesIcon size={30}/></div><span>FNI MEDIA LIBRARY</span></div><div className="ministry-media-copy"><span className="ministry-kicker">PHOTOS & VIDEO HIGHLIGHTS</span><h3>Moments from FNI</h3><p>Approved ministry photographs and video highlights, curated by the FNI media team.</p></div></div>
        <div className="ministry-permission-note"><ShieldCheck size={17}/><span>Media upload and management are reserved for authorised media-team accounts. Account-level role enforcement and shared publishing are not connected in this preview.</span></div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">MEDIA WORKSPACE</span><h3>Media submissions</h3><p>Prepare a photo or video submission for the media team to review.</p></div></div>
        {mediaDrafts.length ? <ItemList items={mediaDrafts} emptyTitle="No media submissions" emptyText="Add a photo or video link." onRemove={removeAreaItem}/> : <div className="ministry-empty"><div><ImagesIcon size={22}/></div><strong>No media added</strong><p>Media submissions will appear here on this device.</p></div>}
        {formOpen && <EntryForm title="Add media link" submitLabel="Save media draft" onCancel={() => setFormOpen(false)} onSave={saveAreaItem}>
          <label>Media title<input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Give this photo or video a title"/></label>
          <label>Media type<select value={mediaKind} onChange={e => setMediaKind(e.target.value)}><option>Video</option><option>Photo</option></select></label>
          <label>Event date<input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}/></label>
          <label>Photo or video URL<input type="url" value={mediaLink} onChange={e => setMediaLink(e.target.value)} placeholder="https://..."/></label>
          <label>Caption (optional)<textarea rows={3} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Add a caption or event context"/></label>
        </EntryForm>}
        <div className="ministry-service-note"><LockKeyhole size={16}/><span>Only media-team members should manage this library. These are local drafts; uploaded media, role checks and shared member access require the FNI backend.</span></div>
      </>}

      {area === 'sermons' && <>
        <div className="ministry-media-feature">
          <div className="ministry-media-art"><div className="ministry-media-emblem"><PlayCircle size={32}/></div><span>FNI MESSAGE LIBRARY</span></div>
          <div className="ministry-media-copy"><span className="ministry-kicker">SERMONS & TEACHINGS</span><h3>Grow through the Word</h3><p>Watch, listen to and revisit messages from Sir and approved guest speakers.</p><button className="ministry-primary-action" onClick={() => setShowDraft(true)}><Plus size={16}/> Prepare a message draft</button></div>
        </div>
        <div className="ministry-feature-strip">
          <div><PlayCircle size={19}/><strong>Video teachings</strong><span>Watch messages and services</span></div>
          <div><Headphones size={19}/><strong>Audio teachings</strong><span>Listen wherever you are</span></div>
          <div><FileText size={19}/><strong>Message notes</strong><span>Teaching notes and resources</span></div>
        </div>
        <div className="ministry-permission-note"><ShieldCheck size={17}/><span>Only the FNI admin and leaders appointed to publish sermons can manage messages. Published messages are intended for every member; secure role checks, shared publishing and member notifications require the FNI backend.</span></div>
        <div className="ministry-section-heading draft-heading"><div><span className="ministry-kicker">LEADER WORKSPACE</span><h3>Message drafts</h3><p>Prepare video, audio, written messages or external links.</p></div></div>
        {drafts.length ? <div className="ministry-draft-list">{drafts.map(item => <article className="ministry-draft-card" key={item.id}><div className="ministry-draft-type">{item.format === 'Audio' ? <Headphones size={17}/> : item.format === 'Article' ? <FileText size={17}/> : <PlayCircle size={17}/>}</div><div className="ministry-draft-copy"><strong>{item.title}</strong><span>{item.speaker} · {item.format}</span>{item.description && <p>{item.description}</p>}{externalLinkFrom(item.description) && <a className="ministry-external-link" href={externalLinkFrom(item.description)} target="_blank" rel="noreferrer">Open shared video or audio link <ChevronRight size={13}/></a>}<small>Saved {new Date(item.createdAt).toLocaleString()}</small></div><button aria-label={'Delete '+item.title} onClick={() => removeDraft(item.id)}><Trash2 size={16}/></button></article>)}</div> : <div className="ministry-empty"><div><BookOpen size={23}/></div><strong>No message drafts yet</strong><p>Prepare a message draft for an approved ministry leader.</p><button className="ministry-secondary-action" onClick={() => setShowDraft(true)}>Prepare first draft</button></div>}
        <div className="ministry-service-note"><Radio size={17}/><span>The published media library will appear when FNI's content service is connected. Drafting works locally; media upload and publishing are not active yet.</span></div>
      </>}

      {area === 'events' && <>
        <div className="ministry-event-banner"><div className="ministry-banner-icon"><CalendarDays size={25}/></div><div><span className="ministry-kicker">FNI CHURCH LIFE</span><h3>Gather. Grow. Connect.</h3><p>Programmes, conferences and service updates in one place.</p></div></div>
        <div className="ministry-stats-row"><div><CalendarCheck size={18}/><strong>{events.length}</strong><span>Your event drafts</span></div><div><span className="ministry-update-emoji" aria-hidden="true">📢</span><strong>Updates</strong><span>Official notices appear here</span></div></div>
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
        <div className="ministry-permission-note"><ShieldCheck size={17}/><span>Sir oversees official declarations and ministry resources. Appointed leaders may prepare approved materials. Your personal notes remain private in this browser preview.</span></div>
        <div className="ministry-tabs ministry-resource-tabs">{(['Daily Scripture','Declarations','Bible Studies','Sermon Notes','My Notes'] as const).map(tab => <button key={tab} className={resourceTab === tab ? 'active' : ''} onClick={() => setResourceTab(tab)}>{tab}</button>)}</div>
        {resourceTab === 'Daily Scripture' && <article className="ministry-resource-feature"><span className="ministry-kicker">SCRIPTURE FOR TODAY</span><h3>Psalm 119:105</h3><p>“Thy word is a lamp unto my feet, and a light unto my path.”</p><small>King James Version · Sample daily scripture</small></article>}
        {resourceTab === 'Declarations' && <article className="ministry-resource-feature"><span className="ministry-kicker">YEARLY PROPHETIC DECLARATIONS</span><h3>Official declarations</h3><p>Approved yearly declarations from Sir and the ministry leadership will be published in this library.</p></article>}
        <div className="ministry-section-heading"><div><span className="ministry-kicker">{resourceTab === 'My Notes' ? 'PERSONAL LIBRARY' : 'RESOURCE LIBRARY'}</span><h3>{resourceTab}</h3><p>{resourceTab === 'My Notes' ? 'Write, organise and search your private notes.' : 'Browse ministry-approved material and save resources for later.'}</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/>{resourceTab === 'My Notes' || resourceTab === 'Sermon Notes' ? 'New note' : 'Add resource'}</button></div>
        <div className="ministry-resource-tools"><label className="ministry-search"><Search size={16}/><input value={resourceSearch} onChange={e => setResourceSearch(e.target.value)} placeholder="Search titles, scriptures and notes..."/></label><select value={resourceFolder} onChange={e => setResourceFolder(e.target.value)}><option>All folders</option>{resourceFolders.map(folder => <option key={folder}>{folder}</option>)}</select><button className={showResourceFavorites ? 'selected' : ''} onClick={() => setShowResourceFavorites(v => !v)}><Heart size={15}/> Favourites</button></div>
        {resourceTab === 'My Notes' && <div className="ministry-folder-create"><input value={resourceFolderDraft} onChange={e => setResourceFolderDraft(e.target.value)} placeholder="New folder name"/><button onClick={() => {const name=resourceFolderDraft.trim();if(name && !resourceFolders.includes(name)){const next=[...resourceFolders,name];setResourceFolders(next);storage.write('fni-resource-folders',next);setResourceFolderDraft('');setNotice('Folder created.');}else setNotice('Enter a new folder name.');}}>Create folder</button></div>}
        <div className="ministry-resource-list">{resources.filter(x => x.category === resourceTab && (resourceFolder === 'All folders' || x.body.includes('Folder: '+resourceFolder)) && (!showResourceFavorites || resourceFavorites.includes(x.id)) && (x.title+' '+x.body).toLowerCase().includes(resourceSearch.toLowerCase())).map(item => <article className="ministry-draft-card" key={item.id}><div className="ministry-draft-type"><BookOpen size={17}/></div><div className="ministry-draft-copy"><strong>{item.title}</strong><span>{item.category} · {item.body.match(/Folder: ([^\n]+)/)?.[1] || 'General'}</span><p>{item.body.replace(/\nFolder: [^\n]+/,'')}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div><button aria-label="Toggle favourite" onClick={() => {const next=resourceFavorites.includes(item.id)?resourceFavorites.filter(id=>id!==item.id):[...resourceFavorites,item.id];setResourceFavorites(next);storage.write('fni-resource-favorites',next);}}><Heart size={16} fill={resourceFavorites.includes(item.id)?'currentColor':'none'}/></button><button aria-label={'Delete '+item.title} onClick={() => removeAreaItem(item.id)}><Trash2 size={16}/></button></article>)}</div>
        {formOpen && <EntryForm title={'New '+resourceTab.toLowerCase()} submitLabel="Save resource" onCancel={() => setFormOpen(false)} onSave={() => {if(!formTitle.trim()||!formBody.trim()){setNotice('Add a title and content first.');return;}const folder=resourceTab==='My Notes'?(resourceFolder==='All folders'?'General':resourceFolder):'Official';const item=makeItem(formTitle,formBody+'\nFolder: '+folder,resourceTab,'Saved locally');const next=[item,...resources];setResources(next);storage.write('fni-ministry-resource-notes',next);setFormTitle('');setFormBody('');setFormOpen(false);setNotice('Resource saved on this device.');}}>
          <label>Title<input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Title or scripture reference"/></label>
          <label>Content, scripture or study notes<textarea rows={6} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Write or paste the resource content..."/></label>
        </EntryForm>}
        <div className="ministry-service-note"><LockKeyhole size={16}/><span>Search, folders and favourites work on this device. Official publishing permissions, Bible-version licensing and cross-device sync require the FNI backend.</span></div>
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
        <div className="ministry-prayer-banner"><div className="ministry-prayer-symbol"><HandHeart size={26}/></div><div><span className="ministry-kicker">WE STAND TOGETHER</span><h3>There is strength in prayer.</h3><p>Share a prayer need with the privacy you choose, or submit a testimony to encourage the FNI family.</p></div></div>
        <div className="ministry-tabs">{(['Requests','Testimonies'] as const).map(tab=><button key={tab} className={prayerTab===tab?'active':''} onClick={()=>{setPrayerTab(tab);setFormOpen(false);}}>{tab}</button>)}</div>
        {prayerTab === 'Requests' ? <>
          <div className="ministry-permission-note"><LockKeyhole size={17}/><span>Prayer requests are private by default. Confidential requests should only be visible to the requester and specifically authorised leaders; prayer-team sharing must be chosen explicitly.</span></div>
          <div className="ministry-section-heading"><div><span className="ministry-kicker">PERSONAL PRAYER</span><h3>Your prayer requests</h3><p>Submit a request and keep track of its local follow-up status.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/> New request</button></div>
          <ItemList items={prayers.filter(x=>x.category==='Prayer request')} emptyTitle="No prayer requests" emptyText="Your prayer requests will appear here after you save one." onRemove={removeAreaItem}/>
          {formOpen && <EntryForm title="Submit a prayer request" submitLabel="Save request" onCancel={()=>setFormOpen(false)} onSave={saveAreaItem}>
            <label>Prayer request title (optional)<input value={formTitle} onChange={e=>setFormTitle(e.target.value)} placeholder="A short title"/></label>
            <label>Request details<textarea rows={5} value={formBody} onChange={e=>setFormBody(e.target.value)} placeholder="Share what you would like prayer for..."/></label>
            <label>Category<select value={prayerCategory} onChange={e=>setPrayerCategory(e.target.value)}>{['Personal','Family','Health','Work or studies','Spiritual growth','Other'].map(v=><option key={v}>{v}</option>)}</select></label>
            <label>Who may see this request?<select value={prayerVisibility} onChange={e=>setPrayerVisibility(e.target.value as 'Confidential'|'Prayer team')}><option>Confidential</option><option>Prayer team</option></select></label>
            <p className="ministry-form-hint">This browser preview does not transmit requests. Do not include details you would not want stored on this device.</p>
          </EntryForm>}
        </> : <>
          <div className="ministry-permission-note"><ShieldCheck size={17}/><span>Testimonies are private drafts until the member explicitly submits them for review and an authorised leader approves public sharing.</span></div>
          <div className="ministry-section-heading"><div><span className="ministry-kicker">SHARE YOUR STORY</span><h3>Testimony submissions</h3><p>Prepare a testimony for leadership review.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/> Add testimony</button></div>
          <ItemList items={prayers.filter(x=>x.category==='Testimony')} emptyTitle="No testimonies submitted" emptyText="Your testimony drafts will appear here." onRemove={removeAreaItem}/>
          {formOpen && <EntryForm title="Submit a testimony" submitLabel="Save for review" onCancel={()=>setFormOpen(false)} onSave={saveAreaItem}>
            <label>Title<input value={formTitle} onChange={e=>setFormTitle(e.target.value)} placeholder="What are you thankful for?"/></label>
            <label>Your testimony<textarea rows={5} value={formBody} onChange={e=>setFormBody(e.target.value)} placeholder="Share what God has done..."/></label>
            <label>Photo or video link (optional)<input type="url" value={mediaLink} onChange={e=>setMediaLink(e.target.value)} placeholder="https://..."/></label>
            <p className="ministry-form-hint">A public testimony must be reviewed and approved before it appears to other members. Media attachments are not uploaded in this preview.</p>
          </EntryForm>}
        </>}
        <div className="ministry-service-note"><LockKeyhole size={16}/><span>Request assignment, leader responses, private follow-up notes, secure anonymity, testimony moderation and public publishing require authenticated backend services. Local drafts are stored only on this device.</span></div>
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
        <div className="ministry-giving-options"><div><span className="ministry-giving-option-icon"><Heart size={17}/></span><strong>Tithes</strong><small>Faithful giving</small></div><div><span className="ministry-giving-option-icon"><HandHeart size={17}/></span><strong>Offerings</strong><small>Worship through giving</small></div><div><span className="ministry-giving-option-icon" aria-hidden="true"><Gift size={17}/></span><strong>Special gifts</strong><small>Support ministry work</small></div></div>
        <div className="ministry-payment-methods"><strong>Available payment methods (planned)</strong><span>VISA</span><span>Mastercard</span><span>Mobile Money</span></div>
        <div className="ministry-section-heading"><div><span className="ministry-kicker">MY GIVING</span><h3>Giving intentions</h3><p>Choose a giving purpose and prepare an amount before secure checkout is connected.</p></div><button className="ministry-primary-action" onClick={openAreaForm}><Plus size={15}/> New intention</button></div>
        <ItemList items={intentions} emptyTitle="No giving intentions" emptyText="Prepare a personal giving note. This will not process a payment." onRemove={removeAreaItem}/>
        {formOpen && <EntryForm title="Prepare a giving intention" submitLabel="Save intention" onCancel={() => setFormOpen(false)} onSave={() => { if (!givingAmount.trim() || !Number.isFinite(Number(givingAmount)) || Number(givingAmount) <= 0) { setNotice('Enter a valid amount greater than zero.'); return; } const item = makeItem(givingType + ' · GHS ' + Number(givingAmount).toFixed(2), formBody + (paymentMethod ? '\nPreferred method: ' + paymentMethod : ''), givingType, 'Intention only'); const next = [item, ...intentions]; setIntentions(next); storage.write('fni-ministry-giving-intentions', next); setGivingAmount(''); setFormBody(''); setFormOpen(false); setNotice('Giving intention saved on this device. No payment was made.'); }}>
          <label>Giving type<select value={givingType} onChange={e => setGivingType(e.target.value)}><option>Tithe</option><option>Offering</option><option>Special donation</option><option>Pledge</option></select></label>
          <label>Amount (GHS)<input inputMode="decimal" type="number" min="1" step="0.01" value={givingAmount} onChange={e => setGivingAmount(e.target.value)} placeholder="e.g. 100"/></label>
          <label>Preferred payment method<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><option>Mobile Money</option><option>VISA</option><option>Mastercard</option></select></label>
          <label>Note (optional)<textarea rows={3} value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Optional personal note"/></label>
        </EntryForm>}
        <div className="ministry-service-note"><LockKeyhole size={16}/><span>Giving intentions save locally. VISA, Mastercard and Mobile Money checkout, payment verification and receipts are not live yet; no money is collected or transferred in this preview.</span></div>
      </>}
    </>}

    {showDraft && <div className="ministry-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowDraft(false); }}><section className="ministry-modal" role="dialog" aria-modal="true" aria-labelledby="ministry-draft-title"><div className="ministry-modal-head"><div><span className="ministry-kicker">SERMONS & MEDIA</span><h3 id="ministry-draft-title">Prepare a message draft</h3></div><button onClick={() => setShowDraft(false)} aria-label="Close"><X size={18}/></button></div><p className="ministry-modal-intro">Prepare details for a sermon or teaching. This does not upload media or publish content.</p><label>Message title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter the message title"/></label><label>Speaker<input value={speaker} onChange={e => setSpeaker(e.target.value)} placeholder="Sir or guest speaker"/></label><label>Content format<select value={format} onChange={e => setFormat(e.target.value)}><option>Video</option><option>Audio</option><option>Article</option></select></label><label>Description<textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Summary, scripture references or key themes"/></label><label>YouTube or external audio/video link (optional)<input type="url" value={messageLink} onChange={e => setMessageLink(e.target.value)} placeholder="https://youtube.com/..."/></label><div className="ministry-modal-warning"><ShieldCheck size={16}/> Drafts stay on this device. Only appointed leaders/admin should publish. Shared publishing and notifications are not active.</div><div className="ministry-modal-actions"><button className="ministry-secondary-action" onClick={() => setShowDraft(false)}>Cancel</button><button className="ministry-primary-action" onClick={saveDraft}>Save draft</button></div></section></div>}
    {notice && <div className="ministry-toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14}/></button></div>}
  </div>;
}

function externalLinkFrom(value: string) { return value.match(/https?:\/\/[^\s]+/i)?.[0]; }

function BellIcon() { return <span className="ministry-update-emoji" aria-hidden="true">📢</span>; }

function ItemList({ items, emptyTitle, emptyText, onRemove }: { items: LocalItem[]; emptyTitle: string; emptyText: string; onRemove: (id: string) => void }) {
  if (!items.length) return <div className="ministry-empty"><div><FileText size={22}/></div><strong>{emptyTitle}</strong><p>{emptyText}</p></div>;
  return <div className="ministry-draft-list">{items.map(item => <article className="ministry-draft-card" key={item.id}><div className="ministry-draft-type"><Bookmark size={17}/></div><div className="ministry-draft-copy"><strong>{item.title}</strong><span>{item.category}{item.status ? ' · '+item.status : ''}</span>{item.body && <p>{item.body}</p>}{externalLinkFrom(item.body) && <a className="ministry-external-link" href={externalLinkFrom(item.body)} target="_blank" rel="noreferrer">Open media link <ChevronRight size={13}/></a>}<small>{new Date(item.createdAt).toLocaleString()}</small></div><button aria-label={'Delete '+item.title} onClick={() => onRemove(item.id)}><Trash2 size={16}/></button></article>)}</div>;
}

function EntryForm({ title, submitLabel, onCancel, onSave, children }: { title: string; submitLabel: string; onCancel: () => void; onSave: () => void; children: ReactNode }) {
  return <section className="ministry-entry-form"><div className="ministry-entry-head"><div><span className="ministry-kicker">PERSONAL WORKSPACE</span><h3>{title}</h3></div><button onClick={onCancel} aria-label="Close form"><X size={17}/></button></div><div className="ministry-entry-fields">{children}</div><div className="ministry-modal-actions"><button className="ministry-secondary-action" onClick={onCancel}>Cancel</button><button className="ministry-primary-action" onClick={onSave}><CheckCircle2 size={15}/>{submitLabel}</button></div></section>;
}
