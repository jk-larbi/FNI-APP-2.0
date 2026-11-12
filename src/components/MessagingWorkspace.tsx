import { useEffect, useMemo, useRef, useState } from 'react';
import SavedMessagesWorkspace from './SavedMessagesWorkspace';
import { Archive, ArrowLeft, AtSign, Bookmark, Check, CheckCheck, ChevronRight, Lock, MessageCircle, Phone, Pin, Plus, Reply, Search, Send, Settings2, Shield, Smile, Square, SquareCheck, Sticker, Trash2, Users, X } from 'lucide-react';

type PermissionKey = 'addMembers' | 'approveRequests' | 'editInfo' | 'pinDelete' | 'restrictMembers' | 'manageInvites' | 'appointAdmins';
type GroupMessage = { id: string; groupId: string; text: string; createdAt: string; replyTo?: string; reactions?: string[]; mentions?: string[]; sticker?: boolean; };
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
  const [tab, setTab] = useState<'All chats' | 'Personal' | 'Groups' | 'Archived'>('All chats');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [archivedChats, setArchivedChats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-archived-chats') || '[]'); } catch { return []; } });
  const [readChats, setReadChats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-read-chats') || '[]'); } catch { return []; } });
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'group' | 'group-chat' | 'new-chat'>('list');
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>(() => { try { return JSON.parse(localStorage.getItem('fni-group-chat-messages') || '[]'); } catch { return []; } });
  const [groupDraft, setGroupDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<GroupMessage | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [chatKeyboardOpen, setChatKeyboardOpen] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMode, setGroupMode] = useState<Group['mode']>('Everyone');
  const [approval, setApproval] = useState(true);
  const [memberUsername, setMemberUsername] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [newChatUsername, setNewChatUsername] = useState('');
  const [notice, setNotice] = useState('');
  const [pinnedChats, setPinnedChats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-pinned-chats') || '[]'); } catch { return []; } });
  useEffect(() => {
    if (view !== 'group-chat') return;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const height = viewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--fni-chat-visual-height', height + 'px');
      document.documentElement.style.setProperty('--fni-chat-visual-offset', (viewport?.offsetTop || 0) + 'px');
      const keyboardVisible = !!viewport && window.innerHeight - viewport.height > 120;
      setChatKeyboardOpen(keyboardVisible);
      if (keyboardVisible) requestAnimationFrame(() => {
        const panel = chatMessagesRef.current;
        if (panel) panel.scrollTop = panel.scrollHeight;
      });
    };
    updateViewport();
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      document.documentElement.style.removeProperty('--fni-chat-visual-height');
      document.documentElement.style.removeProperty('--fni-chat-visual-offset');
      setChatKeyboardOpen(false);
    };
  }, [view, selectedId]);
  useEffect(() => {
    if (view !== 'group-chat') return;
    const panel = chatMessagesRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [groupMessages, view, selectedId]);
  const selected = groups.find(g => g.id === selectedId);
  useEffect(() => { localStorage.setItem('fni-chat-groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('fni-group-chat-messages', JSON.stringify(groupMessages)); }, [groupMessages]);
  useEffect(() => { localStorage.setItem('fni-pinned-chats', JSON.stringify(pinnedChats)); }, [pinnedChats]);
  useEffect(() => { localStorage.setItem('fni-archived-chats', JSON.stringify(archivedChats)); }, [archivedChats]);
  useEffect(() => { localStorage.setItem('fni-read-chats', JSON.stringify(readChats)); }, [readChats]);
  useEffect(() => { try { const globalWallpaper = localStorage.getItem('fni-global-wallpaper') || ''; const individual = JSON.parse(localStorage.getItem('fni-chat-wallpapers') || '{}') as Record<string,string>; const key = selected?.name.toLowerCase() || ''; const wallpaper = (key && individual[key]) || globalWallpaper; document.documentElement.style.setProperty('--fni-chat-wallpaper-image', wallpaper ? (wallpaper.startsWith('linear-gradient') ? wallpaper : 'url(' + wallpaper + ')') : 'none'); } catch { document.documentElement.style.setProperty('--fni-chat-wallpaper-image', 'none'); } }, [selected?.name, selectedId]);
  const filtered = useMemo(() => tab === 'Personal' ? [] : groups.filter(g => (tab === 'Archived' ? archivedChats.includes(g.id) : !archivedChats.includes(g.id)) && (g.name + ' ' + g.description).toLowerCase().includes(query.toLowerCase())).sort((a,b) => Number(pinnedChats.includes(b.id)) - Number(pinnedChats.includes(a.id))), [groups, query, tab, pinnedChats, archivedChats]);
  const updateGroup = (patch: Partial<Group>) => setGroups(current => current.map(g => g.id === selectedId ? { ...g, ...patch } : g));
  const createGroup = () => {
    if (!groupName.trim()) { setNotice('Enter a group name to continue.'); return; }
    const group: Group = { id: crypto.randomUUID(), name: groupName.trim(), description: groupDescription.trim(), createdAt: new Date().toISOString(), mode: groupMode, infoAccess: 'Admins', inviteAccess: 'Admins', approval, pictureAccess: 'Admins', admins: [], permitted: [] };
    setGroups(current => [group, ...current]); setSelectedId(group.id); setGroupName(''); setGroupDescription(''); setView('group-chat');
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
  const closeToList = () => { setView('list'); setSelectedId(''); setGroupDraft(''); };
  const sendGroupMessage = () => { const text = groupDraft.trim(); if (!text || !selected) return; const mentions = [...text.matchAll(/@([a-zA-Z0-9_.-]+)/g)].map(match => match[1]); setGroupMessages(current => [...current, { id: crypto.randomUUID(), groupId: selected.id, text, createdAt: new Date().toISOString(), replyTo: replyTarget?.id, reactions: [], mentions }]); setGroupDraft(''); setReplyTarget(null); setEmojiOpen(false); setMentionOpen(false); };
  const sendSticker = (sticker: string) => { if (!selected) return; setGroupMessages(current => [...current, { id: crypto.randomUUID(), groupId: selected.id, text: sticker, createdAt: new Date().toISOString(), reactions: [], sticker: true }]); setStickerOpen(false); setEmojiOpen(false); setMentionOpen(false); };
  const toggleChatSelection = (id: string) => setSelectedChats(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const visibleChatIds = [...filtered.map(group => group.id), ...(tab === 'All chats' && !archivedChats.includes('saved-messages') ? ['saved-messages'] : tab === 'Personal' && !archivedChats.includes('saved-messages') ? ['saved-messages'] : tab === 'Archived' && archivedChats.includes('saved-messages') ? ['saved-messages'] : [])];
  const toggleSelectAll = () => setSelectedChats(current => visibleChatIds.every(id => current.includes(id)) ? current.filter(id => !visibleChatIds.includes(id)) : [...new Set([...current, ...visibleChatIds])]);
  const exitSelection = () => { setSelectionMode(false); setSelectedChats([]); };
  const markSelectedRead = () => { setReadChats(current => [...new Set([...current, ...selectedChats])]); setNotice(`Marked ${selectedChats.length} chat${selectedChats.length === 1 ? '' : 's'} as read in this preview.`); exitSelection(); };
  const archiveSelected = () => {
    if (tab === 'Archived') setArchivedChats(current => current.filter(id => !selectedChats.includes(id)));
    else setArchivedChats(current => [...new Set([...current, ...selectedChats])]);
    setNotice(tab === 'Archived' ? 'Selected chats restored to your chat list.' : `Archived ${selectedChats.length} chat${selectedChats.length === 1 ? '' : 's'}.`);
    exitSelection();
  };
  const deleteSelected = () => {
    if (!selectedChats.length || !confirm(`Permanently delete ${selectedChats.length} selected chat${selectedChats.length === 1 ? '' : 's'} from this browser preview? This cannot be undone.`)) return;
    setGroups(current => current.filter(group => !selectedChats.includes(group.id)));
    setPinnedChats(current => current.filter(id => !selectedChats.includes(id)));
    setArchivedChats(current => current.filter(id => !selectedChats.includes(id)));
    setReadChats(current => current.filter(id => !selectedChats.includes(id)));
    if (selectedChats.includes('saved-messages')) localStorage.removeItem('fni-personal-cloud-items');
    setNotice('Selected chats deleted from this browser preview.');
    exitSelection();
  };
  const togglePinnedChat = (id: string) => {
    setPinnedChats(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      if (current.length >= 5) { setNotice('You can pin up to 5 chats. Unpin one before adding another.'); return current; }
      return [...current, id];
    });
  };

  if (view === 'saved') return <div className="msg-workspace msg-fullscreen-workspace"><SavedMessagesWorkspace onBack={() => setView('list')} /></div>;

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

  if (view === 'group-chat' && selected) return <div className={`msg-workspace msg-fullscreen-workspace fni-group-conversation${chatKeyboardOpen ? ' keyboard-visible' : ''}`}>
    <header className="fni-group-chat-header">
      <button className="saved-chat-back-button" onClick={closeToList} aria-label="Back to chats"><ArrowLeft size={21}/></button>
      <div className="msg-group-avatar"><Users size={20}/></div>
      <div className="fni-group-chat-identity"><b>{selected.name}</b><span>{selected.description || 'FNI group conversation'} · Preview</span></div>
      <button className="fni-group-chat-action" onClick={() => setView('group')} aria-label="Group settings" title="Group settings"><Settings2 size={19}/></button>
      <button className="fni-group-chat-action" onClick={() => onStartGroupCall?.(selected.name)} aria-label="Start group call" title="Start group call"><Phone size={19}/></button>
    </header>
    <div className="fni-group-chat-messages" ref={chatMessagesRef}>
      {groupMessages.filter(message => message.groupId === selected.id).length === 0
        ? <div className="fni-group-chat-empty"><div><MessageCircle size={24}/></div><b>{selected.name}</b><span>No messages yet. Start the conversation with your group.</span></div>
        : groupMessages.filter(message => message.groupId === selected.id).map(message => {
          const parent = groupMessages.find(item => item.id === message.replyTo);
          return <article className="fni-group-chat-entry" key={message.id}>
            <div className={`fni-group-chat-bubble${message.sticker ? ' fni-group-chat-sticker-bubble' : ''}`}>
              {parent && <button className="fni-chat-reply-preview" onClick={() => document.getElementById('fni-message-'+parent.id)?.scrollIntoView({behavior:'smooth',block:'center'})}><b>You replied to</b><span>{parent.text}</span></button>}
              <p className={message.sticker ? 'fni-group-chat-sticker' : undefined} id={'fni-message-'+message.id}>{message.text.split(/(@[a-zA-Z0-9_.-]+)/g).map((part,index) => part.startsWith('@') ? <strong className="fni-chat-mention" key={index}>{part}</strong> : part)}</p>
              <div className="fni-chat-message-meta"><time>{new Date(message.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time><span>✓✓</span></div>
              {!!message.reactions?.length && <div className="fni-chat-reactions">{message.reactions.map(emoji=><button key={emoji} onClick={()=>setGroupMessages(items=>items.map(item=>item.id===message.id?{...item,reactions:item.reactions?.filter(value=>value!==emoji)}:item))}>{emoji}</button>)}</div>}
            </div>
            <div className="fni-chat-message-tools">
              <button title="Reply" aria-label="Reply to message" onClick={()=>{setReplyTarget(message);setEmojiOpen(false)}}><Reply size={15}/></button>
              {['❤️','👍','🙏','😂'].map(emoji=><button key={emoji} title={'React '+emoji} onClick={()=>setGroupMessages(items=>items.map(item=>item.id===message.id?{...item,reactions:item.reactions?.includes(emoji)?item.reactions.filter(value=>value!==emoji):[...(item.reactions||[]),emoji]}:item))}>{emoji}</button>)}
            </div>
          </article>;
        })}
    </div>
    {replyTarget && <div className="fni-chat-replying"><div><b>Replying to your message</b><span>{replyTarget.text}</span></div><button type="button" onClick={()=>setReplyTarget(null)} aria-label="Cancel reply"><X size={17}/></button></div>}
    {emojiOpen && <div className="fni-ios-emoji-panel" role="group" aria-label="Emoji picker">{['😀','😃','😄','😁','😆','🥹','😂','🤣','😊','😍','🥰','😘','😎','😭','🙏','👏','👍','👎','❤️','🧡','💛','💚','💙','💜','🔥','🎉','✨','🙌','🤍','💯','🤝','🕊️'].map(emoji=><button type="button" key={emoji} onClick={()=>setGroupDraft(value=>value+emoji)}>{emoji}</button>)}</div>}
    {stickerOpen && <div className="fni-sticker-panel" role="group" aria-label="FNI sticker pack"><div className="fni-sticker-panel-heading"><b>FNI Stickers</b><span>Tap a sticker to send</span></div>{[{emoji:'🙏',label:'Praying for you'},{emoji:'🙌',label:'Hallelujah'},{emoji:'❤️',label:'God loves you'},{emoji:'✨',label:'Blessed'},{emoji:'🕊️',label:'Peace'},{emoji:'🔥',label:'On fire'},{emoji:'👏',label:'Well done'},{emoji:'💪',label:'Stay strong'},{emoji:'🌟',label:'Keep shining'},{emoji:'📖',label:'Word of God'},{emoji:'🤍',label:'Grace'},{emoji:'🎉',label:'Praise God'}].map(sticker=><button type="button" className="fni-sticker-tile" key={sticker.label} onClick={()=>sendSticker(sticker.emoji)}><span>{sticker.emoji}</span><small>{sticker.label}</small></button>)}</div>}
    {mentionOpen && <div className="fni-chat-mention-panel"><span>Insert a mention</span>{['you',...selected.admins.map(admin=>admin.username)].map(name=><button type="button" key={name} onClick={()=>{setGroupDraft(value=>value+'@'+name+' ');setMentionOpen(false)}}>@{name}</button>)}</div>}
    <form className="fni-group-chat-compose" onSubmit={event => { event.preventDefault(); sendGroupMessage(); }}>
      <button type="button" className="fni-chat-compose-tool" aria-label="Insert mention" onClick={()=>{setMentionOpen(value=>!value);setEmojiOpen(false);setStickerOpen(false)}}><AtSign size={19}/></button>
      <button type="button" className="fni-chat-compose-tool" aria-label="Open emoji picker" onClick={()=>{setEmojiOpen(value=>!value);setMentionOpen(false);setStickerOpen(false)}}><Smile size={19}/></button>
      <button type="button" className="fni-chat-compose-tool" aria-label="Open FNI stickers" aria-pressed={stickerOpen} onClick={()=>{setStickerOpen(value=>!value);setEmojiOpen(false);setMentionOpen(false)}}><Sticker size={19}/></button>
      <input ref={chatInputRef} value={groupDraft} onChange={event => setGroupDraft(event.target.value)} onFocus={() => requestAnimationFrame(() => { const panel = chatMessagesRef.current; if (panel) panel.scrollTop = panel.scrollHeight; })} placeholder="Message the group..." aria-label="Message the group"/>
      <button type="submit" disabled={!groupDraft.trim()} aria-label="Send message"><Send size={18}/></button>
    </form>
    <div className="fni-group-chat-local-note">Preview messages stay on this device. Replies, mentions and reactions are stored locally; live delivery needs the FNI messaging backend.</div>
  </div>;

  if (view === 'group' && selected) return <div className="msg-workspace msg-fullscreen-workspace">
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
      {selectionMode ? <button className="fni-chat-edit-toggle active" onClick={exitSelection}>Cancel</button> : <button className="fni-chat-edit-toggle" onClick={() => { setSelectionMode(true); setSelectedChats([]); }}>Edit</button>}
      <div className="fni-chat-home-title"><span className="msg-eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span><h2>{tab === 'Archived' ? 'Archived' : 'Chats'}</h2></div>
      <div className="fni-chat-home-actions"><button aria-label="New message" title="New message" onClick={() => setView('new-chat')}><Plus size={20}/></button><button aria-label="Create group" title="Create group" onClick={() => setView('create')}><Users size={19}/></button></div>
    </div>
    <div className="fni-chat-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, @usernames or messages" aria-label="Search chats"/></div>
    <div className="msg-tabs fni-chat-tabs" role="tablist" aria-label="Chat folders">{(['All chats','Personal','Groups','Archived'] as const).map(t => <button role="tab" aria-selected={tab===t} key={t} className={tab===t?'active':''} onClick={() => { setTab(t); exitSelection(); }}>{t}</button>)}</div>
    {selectionMode && <div className="fni-chat-bulk-bar">
      <button className="fni-chat-select-all" onClick={toggleSelectAll}>{visibleChatIds.length > 0 && visibleChatIds.every(id => selectedChats.includes(id)) ? <SquareCheck size={17}/> : <Square size={17}/>} Select all</button>
      <span>{selectedChats.length} selected</span>
      <div className="fni-chat-bulk-actions">
        <button disabled={!selectedChats.length} onClick={markSelectedRead} title="Mark as read"><CheckCheck size={18}/><span>Read</span></button>
        <button disabled={!selectedChats.length} onClick={archiveSelected} title="Archive"><Archive size={18}/><span>{tab === 'Archived' ? 'Unarchive' : 'Archive'}</span></button>
        <button disabled={!selectedChats.length} onClick={deleteSelected} title="Delete"><Trash2 size={18}/><span>Delete</span></button>
      </div>
    </div>}
    <div className="fni-chat-list">
      {tab !== 'Personal' && filtered.map(group => <div className={`fni-chat-row-wrap ${selectionMode ? 'is-selectable' : ''}`} key={group.id}>
        {selectionMode && <button className="fni-chat-select-circle" aria-label={selectedChats.includes(group.id) ? 'Deselect chat' : 'Select chat'} onClick={() => toggleChatSelection(group.id)}>{selectedChats.includes(group.id) ? <Check size={15}/> : null}</button>}
        <button className={`fni-chat-row ${selectedChats.includes(group.id) ? 'selected' : ''}`} onClick={() => selectionMode ? toggleChatSelection(group.id) : (setSelectedId(group.id),setView('group-chat'))}>
          <div className="fni-chat-avatar fni-group-chat-avatar"><Users size={20}/></div>
          <div className="fni-chat-row-copy"><div className="fni-chat-row-top"><b>{group.name}</b><time>{new Date(group.createdAt).toLocaleDateString([], {day:'numeric',month:'short'})}</time></div><div className="fni-chat-row-bottom"><span>{group.description || 'Group conversation'}</span><small>{group.admins.length} admins</small></div></div>
        </button>
        {!selectionMode && <button className={pinnedChats.includes(group.id) ? 'fni-chat-pin active' : 'fni-chat-pin'} title={pinnedChats.includes(group.id) ? 'Unpin chat' : 'Pin chat'} onClick={() => togglePinnedChat(group.id)}><Pin size={14}/></button>}
      </div>)}
      {((tab === 'All chats' || tab === 'Personal' || tab === 'Archived') && ((tab === 'Archived') === archivedChats.includes('saved-messages'))) && <div className={`fni-chat-row-wrap ${selectionMode ? 'is-selectable' : ''}`}>
        {selectionMode && <button className="fni-chat-select-circle" aria-label={selectedChats.includes('saved-messages') ? 'Deselect Saved Messages' : 'Select Saved Messages'} onClick={() => toggleChatSelection('saved-messages')}>{selectedChats.includes('saved-messages') ? <Check size={15}/> : null}</button>}
        <button className={`fni-chat-row fni-saved-row ${selectedChats.includes('saved-messages') ? 'selected' : ''}`} onClick={() => selectionMode ? toggleChatSelection('saved-messages') : setView('saved')}>
          <div className="fni-chat-avatar fni-saved-avatar"><Bookmark size={21}/></div>
          <div className="fni-chat-row-copy"><div className="fni-chat-row-top"><b>Saved Messages</b><time> </time></div><div className="fni-chat-row-bottom"><span>{savedPreview}</span><small><Lock size={11}/> Only you</small></div></div>
        </button>
      </div>}
      {tab === 'Personal' && <div className="fni-chat-list-empty"><MessageCircle size={22}/><b>No personal chats yet</b><span>Your conversations with FNI members will appear here when you start chatting. No sample contacts are added.</span><button className="msg-secondary" onClick={() => setView('new-chat')}>New message</button></div>}
      {tab === 'Groups' && !filtered.length && <div className="fni-chat-list-empty"><Users size={22}/><b>No group chats yet</b><span>Groups you create or join will appear here.</span><button className="msg-secondary" onClick={() => setView('create')}>Create group</button></div>}
      {query && !filtered.length && tab !== 'Personal' && <div className="fni-chat-list-empty"><Search size={20}/><b>No matching chats</b><span>Try another name or keyword.</span></div>}
    </div>
    <div className="msg-footer-note"><Shield size={15}/> Your chat list is stored in this browser preview. Real member conversations and cross-device sync will be enabled with the FNI backend.</div>
    {notice && <div className="msg-toast" role="status">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>;
}