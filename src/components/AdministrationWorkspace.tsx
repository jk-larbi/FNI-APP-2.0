import { useMemo, useState, type FormEvent } from 'react';
import { ShieldCheck, Users, UserPlus, ClipboardCheck, Settings2, Crown, Search, Trash2, ArrowUpRight, Megaphone, BookOpen, Images, HeartHandshake, Video, Bell, ScrollText } from 'lucide-react';

type Assignment = { id: string; name: string; role: string; area: string };
type AuditEntry = { id: string; action: string; detail: string; at: string };
type Props = { onNavigate: (section: 'cells' | 'ministry' | 'mediahub' | 'notifications' | 'calls') => void };
const KEY = 'fni-demo-leadership-v1';
const AUDIT_KEY = 'fni-admin-audit-v1';
const roles = ['Administrator', 'Ministry Leader', 'Cell Leader', 'Group Moderator', 'Media Team', 'Prayer Team', 'Resource Publisher'];

function read<T,>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

export default function AdministrationWorkspace({ onNavigate }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>(() => read(KEY, []));
  const [audit, setAudit] = useState<AuditEntry[]>(() => read(AUDIT_KEY, []));
  const [members] = useState<Array<{name:string;email:string}>>(() => read('fni-demo-users-v1', []));
  const [showMembers, setShowMembers] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cell Leader');
  const [area, setArea] = useState('');
  const [query, setQuery] = useState('');
  const filteredAssignments = useMemo(() => assignments.filter(a => (a.name+' '+a.role+' '+a.area).toLowerCase().includes(query.toLowerCase())), [assignments, query]);
  function record(action: string, detail: string) {
    const next = [{ id: crypto.randomUUID(), action, detail, at: new Date().toISOString() }, ...audit].slice(0, 60);
    setAudit(next); localStorage.setItem(AUDIT_KEY, JSON.stringify(next));
  }
  function save(next: Assignment[]) { setAssignments(next); localStorage.setItem(KEY, JSON.stringify(next)); }
  function appoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !area.trim()) return;
    const item = { id: crypto.randomUUID(), name: name.trim(), role, area: area.trim() };
    save([item, ...assignments]); record('Leadership appointment', item.name + ' · ' + item.role + ' · ' + item.area);
    setName(''); setArea('');
  }
  function remove(item: Assignment) {
    save(assignments.filter(value => value.id !== item.id));
    record('Leadership appointment removed', item.name + ' · ' + item.role + ' · ' + item.area);
  }
  const destinations = [
    { title: 'Cell groups', detail: 'Open cell groups, meetings and group oversight.', icon: Users, target: 'cells' as const },
    { title: 'Ministry operations', detail: 'Open ministry content, prayer, events and resources.', icon: HeartHandshake, target: 'ministry' as const },
    { title: 'Media Hub', detail: 'Review the ministry photo and video gallery.', icon: Images, target: 'mediahub' as const },
    { title: 'Announcements', detail: 'Open FNI notifications and ministry updates.', icon: Megaphone, target: 'notifications' as const },
    { title: 'Calls & meetings', detail: 'Open the meeting and calling workspace.', icon: Video, target: 'calls' as const },
  ];
  return <div className="fni-admin-workspace">
    <div className="fni-admin-heading"><div><span className="settings-kicker">MINISTRY CONTROL CENTRE</span><h2>Administration</h2><p>Oversee people, leadership appointments and ministry operations.</p></div><div className="fni-admin-crown"><Crown size={23}/></div></div>
    <div className="fni-admin-notice"><ShieldCheck size={17}/><span>Administrator demo mode. Changes are saved on this device only. Shared approvals, account permissions and ministry-wide records activate with the secure FNI backend.</span></div>
    <div className="fni-admin-stats">
      <button type="button" onClick={() => setShowMembers(v => !v)}><Users/><strong>Member directory</strong><span>{members.length} registered demo members · {showMembers ? 'Hide list' : 'View list'}</span></button>
      <div><Crown/><strong>Leadership</strong><span>{assignments.length} local appointments</span></div>
      <div><ClipboardCheck/><strong>Admin activity</strong><span>{audit.length} recorded actions</span></div>
    </div>
    {showMembers && <section className="fni-admin-panel"><div className="fni-admin-panel-title"><div><h3>Registered members on this device</h3><p>Accounts created in this browser's FNI demo.</p></div><Users size={20}/></div>
      {members.length ? members.map((member,index)=><div className="fni-admin-assignment" key={member.email}><div className="fni-admin-avatar">{member.name.slice(0,1).toUpperCase()}</div><div><strong>{member.name}</strong><span>{member.email}</span></div><small>Member {index+1}</small></div>) : <div className="fni-admin-empty"><Users size={23}/><strong>No demo members registered</strong><span>Member accounts created on this device will appear here.</span></div>}
    </section>}
    <section className="fni-admin-panel"><div className="fni-admin-panel-title"><div><h3>Appoint ministry leaders</h3><p>Assign demo roles to members for this prototype.</p></div><UserPlus size={20}/></div>
      <form className="fni-admin-form" onSubmit={appoint}>
        <label>Member full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter member name" required/></label>
        <label>Leadership role<select value={role} onChange={e=>setRole(e.target.value)}>{roles.map(v=><option key={v}>{v}</option>)}</select></label>
        <label>Department / group<input value={area} onChange={e=>setArea(e.target.value)} placeholder="e.g. Agape Cell, Media" required/></label>
        <button type="submit"><UserPlus size={16}/> Appoint leader</button>
      </form>
    </section>
    <section className="fni-admin-panel"><div className="fni-admin-panel-title"><div><h3>Leadership appointments</h3><p>Search and manage roles assigned in this browser.</p></div><Settings2 size={20}/></div>
      <div className="fni-admin-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search appointments"/></div>
      {filteredAssignments.length ? filteredAssignments.map(a=><div className="fni-admin-assignment" key={a.id}><div className="fni-admin-avatar">{a.name.slice(0,1).toUpperCase()}</div><div><strong>{a.name}</strong><span>{a.role} · {a.area}</span></div><button aria-label={'Remove '+a.name} onClick={()=>remove(a)}><Trash2 size={16}/></button></div>) : <div className="fni-admin-empty"><Users size={23}/><strong>No appointments found</strong><span>Use the form above to appoint a demo leader.</span></div>}
    </section>
    <section className="fni-admin-panel"><div className="fni-admin-panel-title"><div><h3>Administration workspaces</h3><p>Open the actual FNI section for each ministry operation.</p></div><ArrowUpRight size={20}/></div>
      <div className="fni-admin-links">{destinations.map(item=>{const Icon=item.icon;return <button type="button" key={item.title} onClick={()=>onNavigate(item.target)}><span className="fni-admin-link-icon"><Icon size={18}/></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowUpRight size={16}/></button>;})}</div>
    </section>
    <section className="fni-admin-panel"><div className="fni-admin-panel-title"><div><h3>Administrator activity log</h3><p>Recent changes made from this browser.</p></div><ScrollText size={20}/></div>
      {audit.length ? audit.slice(0,12).map(item=><div className="fni-admin-audit-row" key={item.id}><div><strong>{item.action}</strong><span>{item.detail}</span></div><time>{new Date(item.at).toLocaleString()}</time></div>) : <div className="fni-admin-empty"><ScrollText size={23}/><strong>No activity recorded</strong><span>Leadership appointments and removals will appear here.</span></div>}
    </section>
    <div className="fni-admin-notice"><BookOpen size={17}/><span>Prayer review, cell approvals, secure member-role enforcement and official publishing are not simulated as completed. Their dedicated workspaces open above; approval workflows and audit history shared across devices need backend services.</span></div>
  </div>;
}
