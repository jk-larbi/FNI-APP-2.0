import { useState } from 'react';
import { ShieldCheck, Users, UserPlus, ClipboardCheck, Settings2, Crown, Search, Trash2 } from 'lucide-react';

type Assignment = { id: string; name: string; role: string; area: string };
const KEY = 'fni-demo-leadership-v1';
const roles = ['Administrator', 'Ministry Leader', 'Cell Leader', 'Group Moderator', 'Media Team', 'Prayer Team', 'Resource Publisher'];

export default function AdministrationWorkspace() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } });
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cell Leader');
  const [area, setArea] = useState('');
  const [query, setQuery] = useState('');
  function save(next: Assignment[]) { setAssignments(next); localStorage.setItem(KEY, JSON.stringify(next)); }
  return <div className="fni-admin-workspace">
    <div className="fni-admin-heading"><div><span className="settings-kicker">MINISTRY CONTROL CENTRE</span><h2>Administration</h2><p>Oversee people, leadership appointments and ministry operations.</p></div><div className="fni-admin-crown"><Crown size={23}/></div></div>
    <div className="fni-admin-notice"><ShieldCheck size={17}/><span>Administrator demo mode. Changes are saved on this device only; real permissions and approvals require the secure FNI backend.</span></div>
    <div className="fni-admin-stats"><div><Users/><strong>Member directory</strong><span>Prepared for member management</span></div><div><Crown/><strong>Leadership</strong><span>{assignments.length} local appointments</span></div><div><ClipboardCheck/><strong>Approvals</strong><span>Approval queue integration pending</span></div></div>
    <section className="fni-admin-panel"><div className="fni-admin-panel-title"><div><h3>Appoint ministry leaders</h3><p>Assign demo roles to members for this prototype.</p></div><UserPlus size={20}/></div>
      <form className="fni-admin-form" onSubmit={e=>{e.preventDefault();if(!name.trim()||!area.trim())return;save([{id:crypto.randomUUID(),name:name.trim(),role,area:area.trim()},...assignments]);setName('');setArea('');}}>
        <label>Member full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter member name" required/></label>
        <label>Leadership role<select value={role} onChange={e=>setRole(e.target.value)}>{roles.map(v=><option key={v}>{v}</option>)}</select></label>
        <label>Department / group<input value={area} onChange={e=>setArea(e.target.value)} placeholder="e.g. Agape Cell, Media" required/></label>
        <button type="submit"><UserPlus size={16}/> Appoint leader</button>
      </form>
    </section>
    <section className="fni-admin-panel"><div className="fni-admin-panel-title"><div><h3>Leadership appointments</h3><p>Review and manage locally assigned demo roles.</p></div><Settings2 size={20}/></div>
      <div className="fni-admin-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search appointments"/></div>
      {assignments.filter(a=>(a.name+' '+a.role+' '+a.area).toLowerCase().includes(query.toLowerCase())).length ? assignments.filter(a=>(a.name+' '+a.role+' '+a.area).toLowerCase().includes(query.toLowerCase())).map(a=><div className="fni-admin-assignment" key={a.id}><div className="fni-admin-avatar">{a.name.slice(0,1).toUpperCase()}</div><div><strong>{a.name}</strong><span>{a.role} · {a.area}</span></div><button aria-label={'Remove '+a.name} onClick={()=>save(assignments.filter(item=>item.id!==a.id))}><Trash2 size={16}/></button></div>) : <div className="fni-admin-empty"><Users size={23}/><strong>No appointments yet</strong><span>Use the form above to appoint your first demo leader.</span></div>}
    </section>
    <section className="fni-admin-panel fni-admin-coming"><h3>More administration controls</h3><div><span>Member management and role permissions</span><b>Planned</b></div><div><span>Cell group approvals and oversight</span><b>Planned</b></div><div><span>Prayer and testimony review queue</span><b>Planned</b></div><div><span>Official declarations and resource publishing</span><b>Planned</b></div><div><span>Ministry-wide announcements and audit log</span><b>Planned</b></div></section>
  </div>;
}
