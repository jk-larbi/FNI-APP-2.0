import { useEffect, useMemo, useState } from 'react';
import SavedMessagesWorkspace from './SavedMessagesWorkspace';
import { ArrowLeft, Bookmark, Check, ChevronRight, Lock, MessageCircle, Phone, Pin, Plus, Search, Settings2, Shield, Users, X } from 'lucide-react';

type PermissionKey = 'addMembers' | 'approveRequests' | 'editInfo' | 'pinDelete' | 'restrictMembers' | 'manageInvites' | 'appointAdmins';
type Group = {
  id: string; name: string; description: string; createdAt: string;
  mode: 'Everyone' | 'Admins only' | 'Selected members';
  infoAccess: 'Owner' | 'Admins' | 'Everyone';
  inviteAccess: 'Owner' | 'Admins' | 'Everyone';
  approval: boolean; pictureAccess: 'Owner' | 'Admins' | 'Everyone';
  admins: { username: string; permissions: Record<PermissionKey, boolean> }[];
  permitted: string[];
};
const permissionLabels: { key: PermissionKey; label: string }[] = [
  { key: 'addMembers', label: 'Add or remove members' },
  { key: 'approveRequests', label: 'Approve join requests' },
  { key: 'editInfo', label: 'Edit group information' },
  { key: 'pinDelete', label: 'Pin and delete messages' },
  { key: 'restrictMembers', label: 'Restrict or mute members' },
  { key: 'manageInvites', label: 'Manage invitation links' },
  { key: 'appointAdmins', label: 'Appoint other administrators' },
];
const blankPermissions = Object.fromEntries(permissionLabels.map(p => [p.key, false])) as Record<PermissionKey, boolean>;

export default function MessagingWorkspace({ onStartGroupCall }: { onStartGroupCall?: (groupName: string) => void }) {
  const [groups, setGroups] = useState<Group[]>(() => { try { return JSON.parse(localStorage.getItem('fni-chat-groups') || '[]'); } catch { return []; } });
  const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState<'All chats' | 'Personal' | 'Groups'>('All chats');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'group' | 'new-chat'>('list');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMode, setGroupMode] = useState<Group['mode']>('Everyone');
  const [approval, setApproval] = useState(true);
  const [memberUsername, setMemberUsername] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [newChatUsername, setNewChatUsername] = useState('');
  const [notice, setNotice] = useState('');
  const [pinnedChats, setPinnedChats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-pinned-chats') || '[]'); } catch { return []; } });
  const selected = groups.find(g => g.id === selectedId);
  useEffect(() => { localStorage.setItem('fni-chat-groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('fni-pinned-chats', JSON.stringify(pinnedChats)); }, [pinnedChats]);
  useEffect(() => { try { const globalWallpaper = localStorage.getItem('fni-global-wallpaper') || ''; const individual = JSON.parse(localStorage.getItem('fni-chat-wallpapers') || '{}') as Record<string,string>; const key = selected?.name.toLowerCase() || ''; const wallpaper = (key && individual[key]) || globalWallpaper; document.documentElement.style.setProperty('--fni-chat-wallpaper-image', wallpaper ? (wallpaper.startsWith('linear-gradient') ? wallpaper : 'url(' + wallpaper + ')') : 'none'); } catch { document.documentElement.style.setProperty('--fni-chat-wallpaper-image', 'none'); } }, [selected?.name, selectedId]);
  const filtered = useMemo(() => tab === 'Personal' ? [] : groups.filter(g => (g.name + ' ' + g.description).toLowerCase().includes(query.toLowerCase())).sort((a,b) => Number(pinnedChats.includes(b.id)) - Number(pinnedChats.includes(a.id))), [groups, query, tab, pinnedChats]);
  const updateGroup = (patch: Partial<Group>) => setGroups(current => current.map(g => g.id === selectedId ? { ...g, ...patch } : g));
  const createGroup = () => {
    if (!groupName.trim()) { setNotice('Enter a group name to continue.'); return; }
    const group: Group = { id: crypto.randomUUID(), name: groupName.trim(), description: groupDescription.trim(), createdAt: new Date().toISOString(), mode: groupMode, infoAccess: 'Admins', inviteAccess: 'Admins', approval, pictureAccess: 'Admins', admins: [], permitted: [] };
    setGroups(current => [group, ...current]); setSelectedId(group.id); setGroupName(''); setGroupDescription(''); setView('group');
    setNotice('Group created in this browser preview. It is not yet shared with other FNI accounts.');
  };
  const addAdmin = () => {
    const username = adminUsername.trim().replace(/^@/, '');
    if (!username || !selected || selected.admins.some(a => a.username.toLowerCase() === username.toLowerCase())) return;
    updateGroup({ admins: [...selected.admins, { username, permissions: { ...blankPermissions } }] }); setAdminUsername('');
  };
  const addPermitted = () => {
    const username = memberUsername.trim().replace(/^@/, '');
    if (!username || !selected || selected.permitted.includes(username)) return;
    updateGroup({ permitted: [...selected.permitted, username] }); setMemberUsername('');
  };
  const updateAdmin = (username: string, key: PermissionKey, value: boolean) => {
    if (!selected) return;
    updateGroup({ admins: selected.admins.map(a => a.username === username ? { ...a, permissions: { ...a.permissions, [key]: value } } : a) });
  };
  const closeToList = () => { setView('list'); setSelectedId(''); };
  const togglePinnedChat = (id: string) => {
    setPinnedChats(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      if (current.length >= 5) { setNotice('You can pin up to 5 chats. Unpin one before adding another.'); return current; }
      return [...current, id];
    });
  };

  if (view === 'saved') return <div className="msg-workspace"><SavedMessagesWorkspace onBack={() => setView('list')} /></div>;

  if (view === 'create') return <div className="msg-workspace">
    <div className="msg-heading"><button className="msg-back" onClick={() => setView('list')}><ArrowLeft size={17}/> Back to chats</button><span className="msg-eyebrow">NEW GROUP</span><h2>Create a group</h2><p>Set up the group and decide how members can participate.</p></div>
    <div className="msg-form-card">
      <label>Group name<input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Project team" maxLength={60}/></label>
      <label>Description<textarea value={groupDescription} onChange={e => setGroupDescription(e.target.value)} placeholder="What is this group for?" rows={3} maxLength={240}/></label>
      <label>Who can send messages?<select value={groupMode} onChange={e => setGroupMode(e.target.value as Group['mode'])}><option>Everyone</option><option>Admins only</option><option>Selected members</option></select></label>
      {groupMode === 'Selected members' && <p className="msg-hint">You will choose permitted members in group settings after creation.</p>}
      <label className="msg-check"><input type="checkbox" checked={approval} onChange={e => setApproval(e.target.checked)}/> Require owner or administrator approval for new members</label>
      <div className="msg-info"><Shield size={17}/><span>You will automatically become the <b>Group Owner</b>. Only you can grant administrators permissions or transfer ownership.</span></div>
      <button className="msg-primary" onClick={createGroup}>Create group <ChevronRight size={16}/></button>
    </div>
  </div>;

  if (view === 'new-chat') return <div className="msg-workspace"><div className="msg-heading"><button className="msg-back" onClick={() => setView('list')}><ArrowLeft size={17}/> Back to chats</button><span className="msg-eyebrow">PERSONAL MESSAGE</span><h2>Start a conversation</h2><p>Find a member using their public FNI username.</p></div><div className="msg-form-card"><label>Username<input value={newChatUsername} onChange={e => setNewChatUsername(e.target.value)} placeholder="@username"/></label><div className="msg-info"><MessageCircle size={17}/><span>Member search and message delivery will activate when FNI accounts and messaging services are connected. No sample conversations are shown.</span></div><button className="msg-primary" onClick={() => setNotice('Username search requires the FNI account directory and backend.')}>Find member <Search size={16}/></button></div></div>;

  if (view === 'group' && selected) return <div className="msg-workspace">
    <div className="msg-heading"><button className="msg-back" onClick={closeToList}><ArrowLeft size={17}/> All chats</button><div className="msg-group-title"><div className="msg-group-avatar"><Users size={21}/></div><div><span className="msg-eyebrow">GROUP SETTINGS</span><h2>{selected.name}</h2><p>{selected.description || 'No group description yet'}</p></div><button className="msg-secondary" onClick={() => onStartGroupCall?.(selected.name)}><Phone size={16}/> Start group call</button></div></div>
    <div className="msg-detail-grid">
      <section className="msg-panel"><div className="msg-panel-title"><div><h3>Group ownership</h3><p>Authority and roles</p></div><span className="msg-role owner">OWNER</span></div><div className="msg-role-row"><b>You · Group Owner</b><span>Full control over group settings and permissions</span></div>
        <div className="msg-section-label">ADMINISTRATORS</div>
        {selected.admins.map(admin => <div className="msg-admin-card" key={admin.username}><div className="msg-admin-head"><b>@{admin.username}</b><button onClick={() => updateGroup({admins:selected.admins.filter(a => a.username !== admin.username)})}>Remove admin</button></div>{permissionLabels.map(p => <label className="msg-permission" key={p.key}><span>{p.label}</span><input type="checkbox" checked={admin.permissions[p.key]} onChange={e => updateAdmin(admin.username,p.key,e.target.checked)}/></label>)}</div>)}
        <div className="msg-inline-add"><input value={adminUsername} onChange={e => setAdminUsername(e.target.value)} placeholder="Add admin by @username"/><button onClick={addAdmin}><Plus size={15}/> Add</button></div>
        <p className="msg-hint">New administrators receive no permissions by default. Enable only the actions you want to delegate.</p>
        <div className="msg-section-label">OWNERSHIP TRANSFER</div><div className="msg-info"><Lock size={16}/><span>Ownership transfer will require a verified existing member and backend confirmation. It is not simulated in this preview.</span></div>
      </section>
      <section className="msg-panel"><div className="msg-panel-title"><div><h3>Group permissions</h3><p>Owner-controlled participation rules</p></div><Settings2 size={18}/></div>
        <label className="msg-setting">Who can send messages?<select value={selected.mode} onChange={e => updateGroup({mode:e.target.value as Group['mode']})}><option>Everyone</option><option>Admins only</option><option>Selected members</option></select></label>
        {selected.mode === 'Selected members' && <><div className="msg-inline-add"><input value={memberUsername} onChange={e => setMemberUsername(e.target.value)} placeholder="Permitted @username"/><button onClick={addPermitted}><Plus size={15}/> Add</button></div>{selected.permitted.map(name => <div className="msg-list-row" key={name}>@{name}<button onClick={() => updateGroup({permitted:selected.permitted.filter(n => n !== name)})}>Remove</button></div>)}</>}
        <label className="msg-setting">Who can edit group information?<select value={selected.infoAccess} onChange={e => updateGroup({infoAccess:e.target.value as Group['infoAccess']})}><option>Owner</option><option>Admins</option><option>Everyone</option></select></label>
        <label className="msg-setting">Who can invite members?<select value={selected.inviteAccess} onChange={e => updateGroup({inviteAccess:e.target.value as Group['inviteAccess']})}><option>Owner</option><option>Admins</option><option>Everyone</option></select></label>
        <label className="msg-setting">Who can change group picture and description?<select value={selected.pictureAccess} onChange={e => updateGroup({pictureAccess:e.target.value as Group['pictureAccess']})}><option>Owner</option><option>Admins</option><option>Everyone</option></select></label>
        <label className="msg-check"><input type="checkbox" checked={selected.approval} onChange={e => updateGroup({approval:e.target.checked})}/> Require approval before joining</label>
        <div className="msg-info"><Shield size={17}/><span>Administrator controls cannot exceed the permissions granted by the owner. Owner restrictions remain authoritative.</span></div>
      </section>
    </div>
    <div className="msg-panel msg-lower-panel"><div className="msg-panel-title"><div><h3>Pinned messages</h3><p>Important messages stay easy to find in this group</p></div><Pin size={18}/></div><div className="msg-empty"><Pin size={22}/><b>No pinned messages yet</b><span>Once group messaging is connected, owners and administrators with pin permission can pin as many messages as needed. There is no pin limit inside a group.</span></div></div>
    <div className="msg-panel msg-lower-panel"><div className="msg-panel-title"><div><h3>Conversation</h3><p>Messages and live member activity</p></div><MessageCircle size={18}/></div><div className="msg-empty"><MessageCircle size={22}/><b>No messages yet</b><span>Live messaging, member lists, invitations, read receipts and moderation history require the FNI backend. This group setup is saved only in this browser.</span></div></div>
    <div className="msg-actions"><button className="msg-secondary" onClick={() => { if (confirm('Delete this locally saved group?')) { setGroups(current => current.filter(g => g.id !== selected.id)); closeToList(); } }}>Delete local group</button><button className="msg-primary" onClick={closeToList}><Check size={16}/> Done</button></div>
  </div>;

  const savedPreview = (() => { try { const saved = JSON.parse(localStorage.getItem('fni-personal-cloud-items') || '[]') as {content?:string;createdAt?:string;type?:string}[]; const latest = saved[saved.length - 1]; return latest?.content ? (latest.type === 'message' ? latest.content : latest.type === 'image' ? 'Photo' : latest.type === 'video' ? 'Video' : latest.type === 'audio' ? 'Audio' : latest.type === 'link' ? 'Link' : 'Attachment') : 'Messages you save appear here'; } catch { return 'Messages you save appear here'; } })();

  return <div className="msg-workspace fni-chat-home">
    <div className="fni-chat-home-header">
      <div><span className="msg-eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span><h2>Chats</h2></div>
      <div className="fni-chat-home-actions"><button aria-label="New message" title="New message" onClick={() => setView('new-chat')}><Plus size={20}/></button><button aria-label="Create group" title="Create group" onClick={() => setView('create')}><Users size={19}/></button></div>
    </div>
    <div className="fni-chat-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, @usernames or messages" aria-label="Search chats"/></div>
    <div className="msg-tabs fni-chat-tabs" role="tablist" aria-label="Chat folders">{(['All chats','Personal','Groups'] as const).map(t => <button role="tab" aria-selected={tab===t} key={t} className={tab===t?'active':''} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="fni-chat-list">
      {tab !== 'Groups' && <button className="fni-chat-row fni-saved-row" onClick={() => setView('saved')}>
        <div className="fni-chat-avatar fni-saved-avatar"><Bookmark size={21}/></div>
        <div className="fni-chat-row-copy"><div className="fni-chat-row-top"><b>Saved Messages</b><time>Personal</time></div><div className="fni-chat-row-bottom"><span>{savedPreview}</span><small><Lock size={11}/> Only you</small></div></div>
      </button>}
      {tab !== 'Personal' && filtered.map(group => <div className="fni-chat-row-wrap" key={group.id}>
        <button className="fni-chat-row" onClick={() => {setSelectedId(group.id);setView('group')}}>
          <div className="fni-chat-avatar fni-group-chat-avatar"><Users size={20}/></div>
          <div className="fni-chat-row-copy"><div className="fni-chat-row-top"><b>{group.name}</b><time>{new Date(group.createdAt).toLocaleDateString([], {day:'numeric',month:'short'})}</time></div><div className="fni-chat-row-bottom"><span>{group.description || 'Group conversation'}</span><small>{group.admins.length} admins</small></div></div>
        </button>
        <button className={pinnedChats.includes(group.id) ? 'fni-chat-pin active' : 'fni-chat-pin'} title={pinnedChats.includes(group.id) ? 'Unpin chat' : 'Pin chat'} onClick={() => togglePinnedChat(group.id)}><Pin size={14}/></button>
      </div>)}
      {tab === 'Personal' && <div className="fni-chat-list-empty"><MessageCircle size={22}/><b>No personal chats yet</b><span>Your conversations with FNI members will appear here when you start chatting. No sample contacts are added.</span><button className="msg-secondary" onClick={() => setView('new-chat')}>New message</button></div>}
      {tab === 'Groups' && !filtered.length && <div className="fni-chat-list-empty"><Users size={22}/><b>No group chats yet</b><span>Groups you create or join will appear here.</span><button className="msg-secondary" onClick={() => setView('create')}>Create group</button></div>}
      {query && !filtered.length && tab !== 'Personal' && <div className="fni-chat-list-empty"><Search size={20}/><b>No matching chats</b><span>Try another name or keyword.</span></div>}
    </div>
    <div className="msg-footer-note"><Shield size={15}/> Your chat list is stored in this browser preview. Real member conversations and cross-device sync will be enabled with the FNI backend.</div>
    {notice && <div className="msg-toast" role="status">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>;
}