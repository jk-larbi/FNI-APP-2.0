import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronRight, CirclePlus, Clock3, FileImage, HandHeart, LockKeyhole, MessageCircle, Plus, Search, ShieldCheck, Users, Video, X } from 'lucide-react';

type CellGroup = {
  id: string; name: string; description: string; moderator: string; meeting: string;
  location: string; prayerRoom: boolean; mediaSpace: boolean; status: 'Pending review' | 'Approved';
  createdAt: string;
};

const KEY = 'fni-cell-groups';
function readGroups(): CellGroup[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export default function CellGroupsWorkspace() {
  const [groups, setGroups] = useState<CellGroup[]>(readGroups);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [moderator, setModerator] = useState('');
  const [meeting, setMeeting] = useState('');
  const [location, setLocation] = useState('');
  const [prayerRoom, setPrayerRoom] = useState(true);
  const [mediaSpace, setMediaSpace] = useState(true);

  const visible = useMemo(() => groups.filter(group => (group.name + ' ' + group.description + ' ' + group.moderator).toLowerCase().includes(query.toLowerCase())), [groups, query]);
  const active = groups.find(group => group.id === selected);

  function saveGroup() {
    if (!name.trim() || !description.trim() || !moderator.trim()) {
      setNotice('Add a group name, description and moderator to continue.');
      return;
    }
    const item: CellGroup = {
      id: crypto.randomUUID(), name: name.trim(), description: description.trim(),
      moderator: moderator.trim(), meeting: meeting.trim(), location: location.trim(),
      prayerRoom, mediaSpace, status: 'Pending review', createdAt: new Date().toISOString()
    };
    const next = [item, ...groups];
    setGroups(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setName(''); setDescription(''); setModerator(''); setMeeting(''); setLocation('');
    setPrayerRoom(true); setMediaSpace(true); setShowCreate(false); setSelected(item.id);
    setNotice('Cell group request saved on this device. It has not been sent for approval.');
  }

  function updateGroup(item: CellGroup) {
    const next = groups.map(group => group.id === item.id ? item : group);
    setGroups(next); localStorage.setItem(KEY, JSON.stringify(next));
  }

  if (active) return <div className="cell-workspace">
    <button className="cell-back" onClick={() => setSelected(null)}><ChevronRight size={16}/> All cell groups</button>
    <div className="cell-detail-hero">
      <div className="cell-detail-icon"><Users size={25}/></div>
      <div><span className="cell-eyebrow">FNI CELL GROUP</span><h2>{active.name}</h2><p>{active.description}</p></div>
      <span className={active.status === 'Approved' ? 'cell-status approved' : 'cell-status'}>{active.status}</span>
    </div>
    <div className="cell-detail-grid">
      <article className="cell-info-card"><span>MODERATOR</span><strong>{active.moderator}</strong><small>Group moderator</small></article>
      <article className="cell-info-card"><span>NEXT MEETING</span><strong>{active.meeting || 'Not scheduled'}</strong><small>{active.location || 'Location not added'}</small></article>
    </div>
    <div className="cell-feature-grid">
      <article className="cell-feature-card"><div><MessageCircle size={19}/><strong>Group conversation</strong></div><p>Discuss the Word, share updates and encourage one another.</p><span>Messaging service not connected yet</span></article>
      <article className="cell-feature-card"><div><HandHeart size={19}/><strong>Prayer room</strong></div><p>Keep prayer needs and testimonies together in your cell.</p><span>{active.prayerRoom ? 'Included in group setup' : 'Not enabled for this group'}</span></article>
      <article className="cell-feature-card"><div><FileImage size={19}/><strong>Media & resources</strong></div><p>Share study notes, photos and approved ministry resources.</p><span>{active.mediaSpace ? 'Included in group setup' : 'Not enabled for this group'}</span></article>
      <article className="cell-feature-card"><div><CalendarDays size={19}/><strong>Meetings & attendance</strong></div><p>Keep meeting times and attendance records organised.</p><span>Scheduling and attendance sync require backend</span></article>
    </div>
    <div className="cell-governance-note"><ShieldCheck size={17}/><div><strong>Group oversight & approval</strong><p>New cell groups are marked for leadership review. Approval requests, administrator audit logs and notifications to ministry leadership will activate when FNI's backend is connected.</p></div></div>
    <div className="cell-local-note"><LockKeyhole size={15}/> Group details are saved in this browser only. Members, live chat, prayer-room access and shared media are not active yet.</div>
    {notice && <div className="cell-notice" role="status">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>;

  return <div className="cell-workspace">
    <div className="cell-hero">
      <div className="cell-hero-copy"><span className="cell-eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span><h2>Grow together.</h2><p>Find your cell, build meaningful fellowship and stay rooted in the Word.</p></div>
      <div className="cell-hero-mark"><Users size={29}/></div>
    </div>
    <div className="cell-summary-row">
      <div><strong>{groups.length}</strong><span>Groups created here</span></div>
      <div><strong>{groups.filter(group => group.status === 'Approved').length}</strong><span>Approved</span></div>
      <div><strong>{groups.filter(group => group.status === 'Pending review').length}</strong><span>Pending review</span></div>
    </div>
    <div className="cell-section-head"><div><span className="cell-eyebrow">YOUR FELLOWSHIP</span><h3>Cell groups</h3><p>Browse groups saved in this preview or prepare a new group request.</p></div><button className="cell-primary" onClick={() => setShowCreate(value => !value)}><Plus size={16}/>{showCreate ? 'Close form' : 'Create a cell'}</button></div>
    <label className="cell-search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search cell groups, descriptions or moderators"/></label>
    {showCreate && <section className="cell-create-card">
      <div className="cell-create-head"><div><span className="cell-eyebrow">NEW GROUP REQUEST</span><h3>Create a cell group</h3><p>Provide the basic details for leadership review.</p></div><button onClick={() => setShowCreate(false)} aria-label="Close"><X size={18}/></button></div>
      <div className="cell-form-grid">
        <label>Group name<input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Agape Cell"/></label>
        <label>Moderator<input value={moderator} onChange={event => setModerator(event.target.value)} placeholder="Moderator's name"/></label>
        <label className="wide">Description<textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} placeholder="What is this cell group about?"/></label>
        <label>Meeting schedule<input value={meeting} onChange={event => setMeeting(event.target.value)} placeholder="e.g. Fridays, 6:00 PM"/></label>
        <label>Meeting location<input value={location} onChange={event => setLocation(event.target.value)} placeholder="Location or online"/></label>
      </div>
      <div className="cell-options">
        <label><input type="checkbox" checked={prayerRoom} onChange={event => setPrayerRoom(event.target.checked)}/> <span><HandHeart size={16}/> Prayer room</span></label>
        <label><input type="checkbox" checked={mediaSpace} onChange={event => setMediaSpace(event.target.checked)}/> <span><FileImage size={16}/> Media & resources</span></label>
      </div>
      <div className="cell-form-foot"><span><ShieldCheck size={15}/> New groups require leadership approval.</span><button className="cell-primary" onClick={saveGroup}><CheckCircle2 size={16}/> Save request</button></div>
    </section>}
    {visible.length ? <div className="cell-group-list">{visible.map(group => <button className="cell-group-card" key={group.id} onClick={() => setSelected(group.id)}>
      <span className="cell-group-avatar"><Users size={20}/></span><span className="cell-group-copy"><strong>{group.name}</strong><small>{group.description}</small><span><Users size={13}/> {group.moderator} <i/> <Clock3 size={13}/> {group.meeting || 'Meeting not set'}</span></span><span className="cell-group-end"><small className={group.status === 'Approved' ? 'approved' : ''}>{group.status}</small><ChevronRight size={18}/></span>
    </button>)}</div> : <div className="cell-empty"><div><CirclePlus size={23}/></div><strong>{query ? 'No matching cell groups' : 'No cell groups added yet'}</strong><p>{query ? 'Try another name or moderator.' : 'Create a cell group request to get started. Approved groups will appear here once leadership review is connected.'}</p>{!query && <button className="cell-secondary" onClick={() => setShowCreate(true)}>Create your first cell</button>}</div>}
    <div className="cell-governance-note"><ShieldCheck size={17}/><div><strong>Leadership oversight</strong><p>Group approval, moderator permissions, member invitations, meeting-start alerts and administration logs will be handled by the FNI backend. No notifications are sent from this preview.</p></div></div>
    <div className="cell-local-note"><LockKeyhole size={15}/> Cell group requests and details are stored on this device only.</div>
    {notice && <div className="cell-notice" role="status">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>;
}
