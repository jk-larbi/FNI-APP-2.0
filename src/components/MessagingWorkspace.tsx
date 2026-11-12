import { useEffect, useMemo, useRef, useState } from 'react';
import SavedMessagesWorkspace from './SavedMessagesWorkspace';
import StoriesWorkspace from './StoriesWorkspace';
import ChatEmojiPicker from './ChatEmojiPicker';
import VoiceMessageButton from './VoiceMessageButton';
import { Archive, ArrowLeft, AtSign, Bookmark, Camera, Check, CheckCheck, ChevronRight, Copy, Download, Forward, Folder, Lock, MessageCircle, MoreHorizontal, MoreVertical, Paperclip, Pencil, Phone, Pin, Plus, Reply, Search, Send, Settings2, Shield, Smile, Square, SquareCheck, Sticker, Trash2, Users, Video, VolumeX, X } from 'lucide-react';

type PermissionKey = 'addMembers' | 'approveRequests' | 'editInfo' | 'pinDelete' | 'restrictMembers' | 'manageInvites' | 'appointAdmins';
type GroupMessage = { id: string; groupId: string; text: string; createdAt: string; replyTo?: string; reactions?: string[]; mentions?: string[]; sticker?: boolean; pinned?: boolean; mediaUrl?: string; mediaType?: 'image' | 'video' | 'audio'; editedAt?: string; scheduledAt?: string; silent?: boolean; };
type PersonalChat = { id: string; username: string; createdAt: string; lastMessage?: string; lastMessageAt?: string; };
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
  const [personalChats, setPersonalChats] = useState<PersonalChat[]>(() => { try { return JSON.parse(localStorage.getItem('fni-personal-chats') || '[]'); } catch { return []; } });
  const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState<string>('All chats');
  const [customFolders, setCustomFolders] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-custom-chat-folders') || '[]'); } catch { return []; } });
  const [chatFolderMap, setChatFolderMap] = useState<Record<string,string[]>>(() => { try { const raw = JSON.parse(localStorage.getItem('fni-chat-folder-map') || '{}') as Record<string,string|string[]>; return Object.fromEntries(Object.entries(raw).map(([id, folders]) => [id, Array.isArray(folders) ? folders : folders ? [folders] : []])); } catch { return {}; } });
  const [folderPicker, setFolderPicker] = useState<string | null>(null);
  const [folderSelection, setFolderSelection] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [archivedChats, setArchivedChats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-archived-chats') || '[]'); } catch { return []; } });
  const [readChats, setReadChats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-read-chats') || '[]'); } catch { return []; } });
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'group' | 'group-chat' | 'new-chat'>('list');
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>(() => { try { return JSON.parse(localStorage.getItem('fni-group-chat-messages') || '[]'); } catch { return []; } });
  const [groupDraft, setGroupDraft] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null);
  const [sendSilently, setSendSilently] = useState(false);
  const [replyTarget, setReplyTarget] = useState<GroupMessage | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [chatKeyboardOpen, setChatKeyboardOpen] = useState(false);
  const [messageMenu, setMessageMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const longPressOrigin = useRef<{ x: number; y: number } | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const groupAttachmentRef = useRef<HTMLInputElement>(null);
  const groupCameraRef = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMode, setGroupMode] = useState<Group['mode']>('Everyone');
  const [approval, setApproval] = useState(true);
  const [memberUsername, setMemberUsername] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [newChatUsername, setNewChatUsername] = useState('');
  const [notice, setNotice] = useState('');
  const [pinnedChats, setPinnedChats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-pinned-chats') || '[]'); } catch { return []; } });
  const [chatContextMenu, setChatContextMenu] = useState<{ chatId: string; x: number; y: number } | null>(null);
  const chatLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatLongPressTriggered = useRef(false);
  const chatLongPressOrigin = useRef<{ x: number; y: number } | null>(null);
  const clearChatLongPress = () => { if (chatLongPressTimer.current) clearTimeout(chatLongPressTimer.current); chatLongPressTimer.current = null; };
  const openChatContextMenu = (chatId: string, x: number, y: number) => {
    setChatContextMenu({ chatId, x: Math.max(8, Math.min(x, window.innerWidth - 230)), y: Math.max(8, Math.min(y, window.innerHeight - 380)) });
  };
  const handleChatContextAction = (action: string, chatId: string) => {
    setChatContextMenu(null);
    if (action === 'Open') { if (chatId === 'saved-messages') { setView('saved'); } else if (personalChats.some(chat => chat.id === chatId)) { const person = personalChats.find(chat => chat.id === chatId); setNotice(person ? 'Direct messaging with @' + person.username + ' will open when FNI member accounts and messaging are connected.' : 'Personal chat unavailable.'); } else { setSelectedId(chatId); setView('group-chat'); } }
    if (action === 'Pin') togglePinnedChat(chatId);
    if (action === 'Archive') { setArchivedChats(c => tab === 'Archived' ? c.filter(id => id !== chatId) : [...new Set([...c, chatId])]); setNotice(tab === 'Archived' ? 'Chat restored.' : 'Chat archived.'); }
    if (action === 'Mark as Read') { setReadChats(c => [...new Set([...c, chatId])]); setNotice('Marked as read.'); }
    if (action === 'Delete') { if (!confirm('Delete this chat from this browser preview?')) return; setGroups(c => c.filter(g => g.id !== chatId)); setPersonalChats(c => c.filter(chat => chat.id !== chatId)); setPinnedChats(c => c.filter(id => id !== chatId)); setArchivedChats(c => c.filter(id => id !== chatId)); setReadChats(c => c.filter(id => id !== chatId)); if (chatId === 'saved-messages') localStorage.removeItem('fni-personal-cloud-items'); setNotice('Chat deleted.'); }
    if (action.startsWith('Add to: ')) { const folder = action.slice(8); setChatFolderMap(current => ({ ...current, [chatId]: [...new Set([...(current[chatId] || []), folder])] })); setNotice('Added to ' + folder + '.'); }
    if (action.startsWith('Remove from: ')) { const folder = action.slice(13); setChatFolderMap(current => ({ ...current, [chatId]: (current[chatId] || []).filter(item => item !== folder) })); setNotice('Removed from ' + folder + '.'); }
    if (action === 'Select') { setSelectionMode(true); setSelectedChats([chatId]); }
  };
  const chatRowTouchHandlers = (chatId: string) => ({
    onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); openChatContextMenu(chatId, e.clientX, e.clientY); },
    onTouchStart: (e: React.TouchEvent) => {
      chatLongPressTriggered.current = false;
      const touch = e.touches[0];
      chatLongPressOrigin.current = { x: touch.clientX, y: touch.clientY };
      clearChatLongPress();
      chatLongPressTimer.current = setTimeout(() => {
        chatLongPressTriggered.current = true;
        if (navigator.vibrate) navigator.vibrate(12);
        openChatContextMenu(chatId, touch.clientX, touch.clientY);
      }, 550);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const origin = chatLongPressOrigin.current;
      if (origin && Math.hypot(touch.clientX - origin.x, touch.clientY - origin.y) > 14) clearChatLongPress();
    },
    onTouchEnd: () => { clearChatLongPress(); chatLongPressOrigin.current = null; },
    onTouchCancel: () => { clearChatLongPress(); chatLongPressOrigin.current = null; },
  });
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
  useEffect(() => { localStorage.setItem('fni-personal-chats', JSON.stringify(personalChats)); }, [personalChats]);
  useEffect(() => { localStorage.setItem('fni-group-chat-messages', JSON.stringify(groupMessages)); }, [groupMessages]);
  useEffect(() => { localStorage.setItem('fni-pinned-chats', JSON.stringify(pinnedChats)); }, [pinnedChats]);
  useEffect(() => { localStorage.setItem('fni-archived-chats', JSON.stringify(archivedChats)); }, [archivedChats]);
  useEffect(() => { localStorage.setItem('fni-read-chats', JSON.stringify(readChats)); }, [readChats]);
  useEffect(() => { localStorage.setItem('fni-custom-chat-folders', JSON.stringify(customFolders)); }, [customFolders]);
  useEffect(() => { localStorage.setItem('fni-chat-folder-map', JSON.stringify(chatFolderMap)); }, [chatFolderMap]);
  useEffect(() => { try { const globalWallpaper = localStorage.getItem('fni-global-wallpaper') || ''; const individual = JSON.parse(localStorage.getItem('fni-chat-wallpapers') || '{}') as Record<string,string>; const key = selected?.name.toLowerCase() || ''; const wallpaper = (key && individual[key]) || globalWallpaper; document.documentElement.style.setProperty('--fni-chat-wallpaper-image', wallpaper ? (wallpaper.startsWith('linear-gradient') ? wallpaper : 'url(' + wallpaper + ')') : 'none'); } catch { document.documentElement.style.setProperty('--fni-chat-wallpaper-image', 'none'); } }, [selected?.name, selectedId]);
  const filtered = useMemo(() => groups.filter(g => (tab === 'Archived' ? archivedChats.includes(g.id) : !archivedChats.includes(g.id)) && (customFolders.includes(tab) ? (chatFolderMap[g.id] || []).includes(tab) : true) && (g.name + ' ' + g.description).toLowerCase().includes(query.toLowerCase())).sort((a,b) => Number(pinnedChats.includes(b.id)) - Number(pinnedChats.includes(a.id))), [groups, query, tab, pinnedChats, archivedChats, customFolders, chatFolderMap]);
  const filteredPersonalChats = useMemo(() => personalChats.filter(chat => (tab === 'Archived' ? archivedChats.includes(chat.id) : !archivedChats.includes(chat.id)) && (customFolders.includes(tab) ? (chatFolderMap[chat.id] || []).includes(tab) : tab !== 'Groups') && chat.username.toLowerCase().includes(query.toLowerCase())).sort((a,b) => Number(pinnedChats.includes(b.id)) - Number(pinnedChats.includes(a.id))), [personalChats, query, tab, pinnedChats, archivedChats, customFolders, chatFolderMap]);
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
  const sendGroupMessage = (scheduledAt?: string) => { const text = groupDraft.trim(); if (!text || !selected) return; const mentions = [...text.matchAll(/@([a-zA-Z0-9_.-]+)/g)].map(match => match[1]); setGroupMessages(current => [...current, { id: crypto.randomUUID(), groupId: selected.id, text, createdAt: new Date().toISOString(), replyTo: replyTarget?.id, reactions: [], mentions, scheduledAt, silent: sendSilently }]); setGroupDraft(''); setReplyTarget(null); setEmojiOpen(false); setMentionOpen(false); if (scheduledAt) setNotice('Message scheduled on this device. It will appear in the conversation when this app is open at the scheduled time.'); setSendSilently(false); };
  const sendSticker = (sticker: string) => { if (!selected) return; setGroupMessages(current => [...current, { id: crypto.randomUUID(), groupId: selected.id, text: sticker, createdAt: new Date().toISOString(), reactions: [], sticker: true }]); setStickerOpen(false); setEmojiOpen(false); setMentionOpen(false); };
  const saveGroupVoiceMessage = async (blob: Blob, durationSeconds: number) => {
    if (!selected) return;
    try {
      const mediaUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
      setGroupMessages(current => [...current, { id: crypto.randomUUID(), groupId: selected.id, text: 'Voice message · ' + durationSeconds + 's', createdAt: new Date().toISOString(), reactions: [], mediaUrl, mediaType: 'audio' }]);
      setNotice('Voice message recorded and added to this chat on this device.');
    } catch { setNotice('The voice message could not be saved. Please try again.'); }
  };
  const attachGroupFile = async (file?: File) => {
    if (!file || !selected) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { setNotice('Choose an image or video to attach.'); return; }
    if (file.size > 3 * 1024 * 1024) { setNotice('Attachments are limited to 3 MB in this preview.'); return; }
    try {
      const mediaUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      setGroupMessages(current => [...current, { id: crypto.randomUUID(), groupId: selected.id, text: file.name, createdAt: new Date().toISOString(), reactions: [], mediaUrl, mediaType: file.type.startsWith('video/') ? 'video' : 'image' }]);
    } catch { setNotice('This attachment could not be added.'); }
  };
  const openMessageMenu = (message: GroupMessage, x: number, y: number) => {
    setMessageMenu({ messageId: message.id, x: Math.max(8, Math.min(x, window.innerWidth - 220)), y: Math.max(8, Math.min(y, window.innerHeight - 360)) });
  };
  useEffect(() => {
    if (!messageMenu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMessageMenu(null);
    };
    const closeOnResize = () => setMessageMenu(null);
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnResize);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnResize);
    };
  }, [messageMenu]);
  useEffect(() => { const promoteDueMessages = () => { const now = Date.now(); setGroupMessages(items => items.map(item => item.scheduledAt && new Date(item.scheduledAt).getTime() <= now ? { ...item, scheduledAt: undefined, createdAt: new Date().toISOString() } : item)); }; promoteDueMessages(); const timer = window.setInterval(promoteDueMessages, 15000); return () => window.clearInterval(timer); }, []);
  const clearLongPress = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); longPressTimer.current = null; };
  const handleMessageAction = async (action: string, message: GroupMessage) => {
    setMessageMenu(null);
    if (action === 'Reply') { setReplyTarget(message); setEmojiOpen(false); chatInputRef.current?.focus(); return; }
    if (action === 'Copy') {
      try { await navigator.clipboard.writeText(message.text); setNotice('Message copied.'); }
      catch { setNotice('Copy is unavailable in this browser.'); }
      return;
    }
    if (action === 'Edit') {
      const next = window.prompt('Edit message', message.text);
      if (next !== null && next.trim()) setGroupMessages(items => items.map(item => item.id === message.id ? { ...item, text: next.trim(), editedAt: new Date().toISOString() } : item));
      return;
    }
    if (action === 'React') { setReactionPickerFor(message.id); return; }
    if (action === 'Pin') {
      setGroupMessages(items => items.map(item => item.id === message.id ? { ...item, pinned: !item.pinned } : item));
      setNotice(message.pinned ? 'Message unpinned.' : 'Message pinned in this preview.');
      return;
    }
    if (action === 'Forward') {
      const destination = window.prompt('Enter the exact name of the FNI group to forward this message to', '');
      if (!destination) return;
      const target = groups.find(group => group.name.toLowerCase() === destination.trim().toLowerCase());
      if (!target) { setNotice('That group was not found in this preview.'); return; }
      setGroupMessages(items => [...items, { ...message, id: crypto.randomUUID(), groupId: target.id, createdAt: new Date().toISOString(), replyTo: undefined, pinned: false }]);
      setNotice('Message forwarded in this browser preview.');
      return;
    }
    if (action === 'Delete') {
      if (!confirm('Delete this message from this browser preview?')) return;
      setGroupMessages(items => items.filter(item => item.id !== message.id));
      setSelectedMessages(items => items.filter(id => id !== message.id));
      return;
    }
    if (action === 'Select') {
      setSelectedMessages(items => items.includes(message.id) ? items.filter(id => id !== message.id) : [...items, message.id]);
      return;
    }
    if (action === 'Save Image' || action === 'Save Video') {
      if (!message.mediaUrl) { setNotice('This media has no downloadable file attached.'); return; }
      const link = document.createElement('a');
      link.href = message.mediaUrl;
      link.download = message.mediaUrl.split('/').pop()?.split('?')[0] || (message.mediaType === 'video' ? 'fni-video' : 'fni-image');
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link); link.click(); link.remove();
    }
  };
  const toggleChatSelection = (id: string) => setSelectedChats(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const visibleChatIds = [...(tab === 'Groups' ? filtered.map(group => group.id) : tab === 'Personal' ? filteredPersonalChats.map(chat => chat.id) : [...filtered.map(group => group.id), ...filteredPersonalChats.map(chat => chat.id)]), ...((tab === 'Personal' && !archivedChats.includes('saved-messages')) || (tab === 'Archived' && archivedChats.includes('saved-messages')) ? ['saved-messages'] : [])];
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
    setPersonalChats(current => current.filter(chat => !selectedChats.includes(chat.id)));
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

  if (view === 'new-chat') return <div className="msg-workspace"><div className="msg-heading"><button className="msg-back" onClick={() => setView('list')}><ArrowLeft size={17}/> Back to chats</button><span className="msg-eyebrow">PERSONAL MESSAGE</span><h2>Start a conversation</h2><p>Add a member by their public FNI username.</p></div><div className="msg-form-card"><label>Username<input value={newChatUsername} onChange={e => setNewChatUsername(e.target.value)} placeholder="@username"/></label><div className="msg-info"><MessageCircle size={17}/><span>This adds the username to your Personal chat list on this device. Verifying FNI accounts and delivering messages will require the member directory and messaging backend.</span></div><button className="msg-primary" onClick={() => { const username = newChatUsername.trim().replace(/^@/, ''); if (!username) { setNotice('Enter a member username first.'); return; } const existing = personalChats.find(chat => chat.username.toLowerCase() === username.toLowerCase()); if (existing) { setNotice('@' + username + ' is already in your Personal chats.'); setNewChatUsername(''); setTab('Personal'); setView('list'); return; } setPersonalChats(current => [{ id: 'personal-' + crypto.randomUUID(), username, createdAt: new Date().toISOString() }, ...current]); setNewChatUsername(''); setTab('Personal'); setView('list'); setNotice('@' + username + ' was added to your Personal list on this device.'); }}>Add to Personal chats <ChevronRight size={16}/></button></div></div>;

  if (view === 'group-chat' && selected) return <div className={`msg-workspace msg-fullscreen-workspace fni-group-conversation${chatKeyboardOpen ? ' keyboard-visible' : ''}`}>
    <aside className="fni-desktop-chat-list" aria-label="Chats">
      <div className="fni-desktop-chat-list-head"><b>Chats</b><span>Forerunners Network International</span></div>
      <div className="fni-desktop-chat-list-search"><Search size={15}/><span>Search conversations</span></div>
      <div className="fni-desktop-chat-list-items">
        {groups.map(group => <button type="button" key={group.id} className={group.id === selected.id ? 'active' : ''} onClick={() => { setSelectedId(group.id); setView('group-chat'); }}>
          <span className="fni-desktop-chat-list-avatar"><Users size={17}/></span><span className="fni-desktop-chat-list-copy"><b>{group.name}</b><small>{groupMessages.filter(message => message.groupId === group.id).slice(-1)[0]?.text || group.description || 'Group conversation'}</small></span>
        </button>)}
        {personalChats.map(chat => <button type="button" key={chat.id} onClick={() => setNotice('Direct messaging with @' + chat.username + ' will open when FNI member accounts and messaging are connected.')}>
          <span className="fni-desktop-chat-list-avatar personal">{chat.username.slice(0,1).toUpperCase()}</span><span className="fni-desktop-chat-list-copy"><b>@{chat.username}</b><small>{chat.lastMessage || 'Start a conversation'}</small></span>
        </button>)}
        {!groups.length && !personalChats.length && <p className="fni-desktop-chat-list-empty">Your conversations will appear here.</p>}
      </div>
    </aside>
    <header className="fni-group-chat-header">
      <button className="saved-chat-back-button" onClick={closeToList} aria-label="Back to chats"><ArrowLeft size={21}/></button>
      <div className="msg-group-avatar"><Users size={20}/></div>
      <div className="fni-group-chat-identity"><b>{selected.name}</b><span>{selected.description || 'FNI group conversation'} · Preview</span></div>
      {showMessageSearch && <input className="fni-chat-inline-search" value={messageSearch} onChange={event => setMessageSearch(event.target.value)} placeholder="Search in conversation" aria-label="Search messages"/>}
      <button className="fni-group-chat-action" onClick={() => { setShowMessageSearch(value => !value); setMessageSearch(''); }} aria-label="Search messages" title="Search messages"><Search size={18}/></button>
      <button className="fni-group-chat-action" onClick={() => setView('group')} aria-label="Group settings" title="Group settings"><Settings2 size={19}/></button>
      <button className="fni-group-chat-action" onClick={() => onStartGroupCall?.(selected.name)} aria-label="Start video call" title="Start video call"><Video size={19}/></button>
      <button className="fni-group-chat-action" onClick={() => onStartGroupCall?.(selected.name)} aria-label="Start voice call" title="Start voice call"><Phone size={19}/></button>
    </header>
    <div className="fni-group-chat-messages" ref={chatMessagesRef}>
      {groupMessages.filter(message => message.groupId === selected.id && !message.scheduledAt && (!messageSearch.trim() || message.text.toLowerCase().includes(messageSearch.toLowerCase()))).length === 0
        ? <div className="fni-group-chat-empty"><div><MessageCircle size={24}/></div><b>{selected.name}</b><span>No messages yet. Start the conversation with your group.</span></div>
        : groupMessages.filter(message => message.groupId === selected.id && !message.scheduledAt && (!messageSearch.trim() || message.text.toLowerCase().includes(messageSearch.toLowerCase()))).map((message, messageIndex, messageList) => {
          const parent = groupMessages.find(item => item.id === message.replyTo);
          const previousMessage = messageList[messageIndex - 1];
          const messageDate = new Date(message.createdAt);
          const previousDate = previousMessage ? new Date(previousMessage.createdAt) : null;
          const showDateDivider = !previousDate || messageDate.toDateString() !== previousDate.toDateString();
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          const dateLabel = messageDate.toDateString() === today.toDateString() ? 'Today' : messageDate.toDateString() === yesterday.toDateString() ? 'Yesterday' : messageDate.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
          return <div className="fni-chat-day-group" key={message.id}>
            {showDateDivider && <div className="fni-chat-day-divider" style={{ display: 'flex', justifyContent: 'center', padding: '5px 0' }}><span style={{ padding: '5px 12px', borderRadius: '20px', background: '#34383d', color: '#f4f5f7', fontSize: '11px', fontWeight: 600 }}>{dateLabel}</span></div>}
            <article
            className={`fni-group-chat-entry${selectedMessages.includes(message.id) ? ' is-message-selected' : ''}`}
            onContextMenu={event => { event.preventDefault(); openMessageMenu(message, event.clientX, event.clientY); }}
            onTouchStart={event => {
              longPressTriggered.current = false;
              const touch = event.touches[0];
              longPressOrigin.current = { x: touch.clientX, y: touch.clientY };
              clearLongPress();
              longPressTimer.current = setTimeout(() => {
                longPressTriggered.current = true;
                if (navigator.vibrate) navigator.vibrate(12);
                openMessageMenu(message, touch.clientX, touch.clientY);
              }, 550);
            }}
            onTouchMove={event => {
              const touch = event.touches[0];
              const origin = longPressOrigin.current;
              if (origin && Math.hypot(touch.clientX - origin.x, touch.clientY - origin.y) > 14) clearLongPress();
            }}
            onTouchEnd={() => { clearLongPress(); longPressOrigin.current = null; }}
            onTouchCancel={() => { clearLongPress(); longPressOrigin.current = null; }}
            onClick={event => { if (longPressTriggered.current) { event.preventDefault(); longPressTriggered.current = false; } }}
          >
            <div className={`fni-group-chat-bubble${message.sticker ? ' fni-group-chat-sticker-bubble' : ''}`}>
              {message.pinned && <div className="fni-message-pinned-label"><Pin size={12}/> Pinned message</div>}
              {parent && <button className="fni-chat-reply-preview" onClick={() => document.getElementById('fni-message-'+parent.id)?.scrollIntoView({behavior:'smooth',block:'center'})}><b>You replied to</b><span>{parent.text}</span></button>}
              {message.mediaUrl && message.mediaType === 'image' && <img className="fni-chat-message-media" src={message.mediaUrl} alt={message.text || 'Shared image'} loading="lazy"/>}
              {message.mediaUrl && message.mediaType === 'video' && <video className="fni-chat-message-media" src={message.mediaUrl} controls playsInline/>}
              {message.mediaUrl && message.mediaType === 'audio' && <audio className="fni-chat-message-audio" src={message.mediaUrl} controls preload="metadata"/>}
              {!!message.text && <p className={message.sticker ? 'fni-group-chat-sticker' : undefined} id={'fni-message-'+message.id}>{message.text.split(/(@[a-zA-Z0-9_.-]+)/g).map((part,index) => part.startsWith('@') ? <strong className="fni-chat-mention" key={index}>{part}</strong> : part)}</p>}
              <div className="fni-chat-message-meta"><time>{new Date(message.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time>{message.editedAt && <small>edited</small>}{message.silent && <small>silent</small>}<span>✓</span></div>
              <div className="fni-chat-reaction-tools"><button type="button" aria-label="Add reaction" title="Add reaction" onClick={() => setReactionPickerFor(current => current === message.id ? null : message.id)}><Smile size={14}/></button>{reactionPickerFor === message.id && <div className="fni-chat-quick-reactions">{['👍','❤️','😂','😮','🙏','🔥','🎉'].map(emoji => <button type="button" key={emoji} onClick={() => { setGroupMessages(items => items.map(item => item.id === message.id ? {...item,reactions:item.reactions?.includes(emoji)?item.reactions.filter(value=>value!==emoji):[...(item.reactions||[]),emoji]} : item)); setReactionPickerFor(null); }}>{emoji}</button>)}</div>}</div>
              {!!message.reactions?.length && <div className="fni-chat-reactions">{message.reactions.map(emoji=><button key={emoji} onClick={()=>setGroupMessages(items=>items.map(item=>item.id===message.id?{...item,reactions:item.reactions?.filter(value=>value!==emoji)}:item))}>{emoji}</button>)}</div>}
            </div>
            <div className="fni-chat-message-tools">
              <button
                className="fni-message-more-button"
                title="Message options"
                aria-label="More options for this message"
                aria-haspopup="menu"
                aria-expanded={messageMenu?.messageId === message.id}
                onClick={event => {
                  event.stopPropagation();
                  const rect = event.currentTarget.getBoundingClientRect();
                  openMessageMenu(message, rect.right - 210, rect.bottom + 6);
                }}
              ><MoreVertical size={17}/></button>
              <button title="Forward" aria-label="Forward message" onClick={() => handleMessageAction('Forward', message)}><Forward size={15}/></button>
              <button title="Reply" aria-label="Reply to message" onClick={()=>{setReplyTarget(message);setEmojiOpen(false)}}><Reply size={15}/></button>
              {['❤️','👍','🙏','😂'].map(emoji=><button key={emoji} title={'React '+emoji} onClick={()=>setGroupMessages(items=>items.map(item=>item.id===message.id?{...item,reactions:item.reactions?.includes(emoji)?item.reactions.filter(value=>value!==emoji):[...(item.reactions||[]),emoji]}:item))}>{emoji}</button>)}
            </div>
            </article>
          </div>;
        })}
    </div>
    {messageMenu && (() => {
      const target = groupMessages.find(item => item.id === messageMenu.messageId);
      if (!target) return null;
      const actions = ['Reply','React','Copy','Edit',target.pinned ? 'Unpin' : 'Pin','Forward','Delete','Select',...(target.mediaUrl ? [target.mediaType === 'video' ? 'Save Video' : 'Save Image'] : [])];
      return <><button className="fni-message-menu-dismiss" aria-label="Close message menu" onClick={() => setMessageMenu(null)}/><div className="fni-message-context-menu" role="menu" style={{left:messageMenu.x,top:messageMenu.y}}>{actions.map(action=><button key={action} role="menuitem" className={action === 'Delete' ? 'danger' : ''} onClick={() => handleMessageAction(action === 'Unpin' ? 'Pin' : action,target)}>{action === 'Reply' ? <Reply size={16}/> : action === 'React' ? <Smile size={16}/> : action === 'Copy' ? <Copy size={16}/> : action === 'Edit' ? <Pencil size={16}/> : action === 'Pin' || action === 'Unpin' ? <Pin size={16}/> : action === 'Forward' ? <Forward size={16}/> : action === 'Delete' ? <Trash2 size={16}/> : action === 'Select' ? <SquareCheck size={16}/> : <Download size={16}/>}<span>{action}</span></button>)}</div></>;
    })()}
    {selectedMessages.length > 0 && <div className="fni-message-selection-bar"><span>{selectedMessages.length} selected</span><button onClick={() => setSelectedMessages([])}>Cancel selection</button><button onClick={() => { if(confirm('Delete selected messages?')) setGroupMessages(items=>items.filter(item=>!selectedMessages.includes(item.id))); setSelectedMessages([]); }}>Delete</button></div>}
    {replyTarget && <div className="fni-chat-replying"><div><b>Replying to your message</b><span>{replyTarget.text}</span></div><button type="button" onClick={()=>setReplyTarget(null)} aria-label="Cancel reply"><X size={17}/></button></div>}
    {emojiOpen && <ChatEmojiPicker onSelect={emoji => setGroupDraft(value => value + emoji)} />}
    {stickerOpen && <div className="fni-sticker-panel" role="group" aria-label="FNI sticker pack"><div className="fni-sticker-panel-heading"><b>FNI Stickers</b><span>Tap a sticker to send</span></div>{[{emoji:'🙏',label:'Praying for you'},{emoji:'🙌',label:'Hallelujah'},{emoji:'❤️',label:'God loves you'},{emoji:'✨',label:'Blessed'},{emoji:'🕊️',label:'Peace'},{emoji:'🔥',label:'On fire'},{emoji:'👏',label:'Well done'},{emoji:'💪',label:'Stay strong'},{emoji:'🌟',label:'Keep shining'},{emoji:'📖',label:'Word of God'},{emoji:'🤍',label:'Grace'},{emoji:'🎉',label:'Praise God'}].map(sticker=><button type="button" className="fni-sticker-tile" key={sticker.label} onClick={()=>sendSticker(sticker.emoji)}><span>{sticker.emoji}</span><small>{sticker.label}</small></button>)}</div>}
    {mentionOpen && <div className="fni-chat-mention-panel"><span>Insert a mention</span>{['you',...selected.admins.map(admin=>admin.username)].map(name=><button type="button" key={name} onClick={()=>{setGroupDraft(value=>value+'@'+name+' ');setMentionOpen(false)}}>@{name}</button>)}</div>}
    {groupMessages.some(message => message.groupId === selected.id && message.scheduledAt) && <div className="fni-scheduled-messages"><b>Scheduled messages</b>{groupMessages.filter(message => message.groupId === selected.id && message.scheduledAt).map(message => <div key={message.id}><span>{message.text}</span><small>{new Date(message.scheduledAt!).toLocaleString()}</small><button type="button" onClick={() => setGroupMessages(items => items.filter(item => item.id !== message.id))}>Cancel</button></div>)}</div>}
    {replyTarget && <div className="fni-reply-preview"><span><b>Replying to</b>{replyTarget.text}</span><button type="button" onClick={() => setReplyTarget(null)} aria-label="Cancel reply"><X size={16}/></button></div>}
    <form className="fni-group-chat-compose fni-unified-chat-composer" onSubmit={event => { event.preventDefault(); sendGroupMessage(); }}>
      <input ref={groupAttachmentRef} type="file" accept="image/*,video/*" hidden onChange={event => { void attachGroupFile(event.target.files?.[0]); event.currentTarget.value=''; }}/>
      <input ref={groupCameraRef} type="file" accept="image/*" capture="environment" hidden onChange={event => { void attachGroupFile(event.target.files?.[0]); event.currentTarget.value=''; }}/>
      <button type="button" className="fni-chat-compose-tool fni-composer-attach" aria-label="Attach a file" onClick={()=>groupAttachmentRef.current?.click()}><Plus size={22}/></button>
      <button type="button" className="fni-chat-compose-tool fni-composer-extra" aria-label="Insert mention" onClick={()=>{setMentionOpen(value=>!value);setEmojiOpen(false);setStickerOpen(false)}}><AtSign size={17}/></button>
      <button type="button" className="fni-chat-compose-tool fni-composer-extra" aria-label="Open FNI stickers" aria-pressed={stickerOpen} onClick={()=>{setStickerOpen(value=>!value);setEmojiOpen(false);setMentionOpen(false)}}><Sticker size={17}/></button>
      <div className="fni-composer-pill">
        <input ref={chatInputRef} value={groupDraft} onChange={event => setGroupDraft(event.target.value)} onFocus={() => requestAnimationFrame(() => { const panel = chatMessagesRef.current; if (panel) panel.scrollTop = panel.scrollHeight; })} placeholder="Message" aria-label="Message"/>
        <button type="button" className="fni-composer-emoji" aria-label="Open emoji picker" onClick={()=>{setEmojiOpen(value=>!value);setMentionOpen(false);setStickerOpen(false)}}><Smile size={20}/></button>
      </div>
      <button type="button" className="fni-chat-compose-tool fni-composer-camera" aria-label="Open camera" onClick={() => groupCameraRef.current?.click()}><Camera size={20}/></button>
      {groupDraft.trim()
        ? <><button type="button" className="fni-composer-schedule" title="Schedule message" aria-label="Schedule message" onClick={() => { const value = window.prompt('Enter date and time (YYYY-MM-DDTHH:MM)', ''); if (!value) return; const date = new Date(value); if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) { setNotice('Choose a valid future date and time.'); return; } sendGroupMessage(date.toISOString()); }}><MoreHorizontal size={18}/></button><button type="button" className={sendSilently ? 'fni-composer-mic is-silent' : 'fni-composer-mic'} aria-label={sendSilently ? 'Send silently enabled; click to send' : 'Toggle silent send'} title="Toggle silent send" onClick={() => setSendSilently(value => !value)}><VolumeX size={16}/></button><button type="submit" className="fni-composer-mic" aria-label="Send message"><Send size={18}/></button></>
        : <VoiceMessageButton onRecorded={(blob, duration) => { void saveGroupVoiceMessage(blob, duration); }} onNotice={setNotice} />}
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
      {selectionMode ? <button className="fni-chat-edit-toggle active" onClick={exitSelection}>Cancel</button> : <button className="fni-chat-edit-toggle" aria-label="Chat list options" title="Select chats" onClick={() => { setSelectionMode(true); setSelectedChats([]); }}><MoreHorizontal size={22}/></button>}
      <div className="fni-chat-home-title"><span className="msg-eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span><h2>{tab === 'Archived' ? 'Archived' : 'Chats'}</h2></div>
      <div className="fni-chat-home-actions"><button aria-label="New message" title="New message" onClick={() => setView('new-chat')}><Plus size={20}/></button><button aria-label="Create group" title="Create group" onClick={() => setView('create')}><Users size={19}/></button></div>
    </div>
    <StoriesWorkspace compact onReply={() => setNotice('Open a conversation to continue your reply.')} />
    <div className="fni-chat-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, @usernames, messages..." aria-label="Search chats"/></div>
    <div className="fni-chat-folder-bar"><div className="msg-tabs fni-chat-tabs" role="tablist" aria-label="Chat folders">{['All chats','Personal','Groups',...customFolders,'Archived'].map(t => <button role="tab" aria-selected={tab===t} key={t} className={tab===t?'active':''} onClick={() => { setTab(t); exitSelection(); }}>{t}</button>)}</div><button className="fni-add-folder" title="Create folder" aria-label="Create folder" onClick={() => { const value = window.prompt('Name your chat folder'); const folder = value?.trim(); if (!folder) return; if (['All chats','Personal','Groups','Archived'].some(item => item.toLowerCase() === folder.toLowerCase()) || customFolders.some(item => item.toLowerCase() === folder.toLowerCase())) { setNotice('A folder with that name already exists.'); return; } setCustomFolders(current => [...current, folder]); setTab(folder); setFolderSelection([]); setFolderPicker(folder); setNotice(folder + ' folder created. Select the people and groups to add.'); }}><Plus size={17}/></button></div>
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
      {tab !== 'Groups' && filteredPersonalChats.map(chat => <div className={`fni-chat-row-wrap ${selectionMode ? 'is-selectable' : ''}`} key={chat.id} {...(selectionMode ? {} : chatRowTouchHandlers(chat.id))}>
        {selectionMode && <button className="fni-chat-select-circle" aria-label={selectedChats.includes(chat.id) ? 'Deselect chat' : 'Select chat'} onClick={() => toggleChatSelection(chat.id)}>{selectedChats.includes(chat.id) ? <Check size={15}/> : null}</button>}
        <button className={`fni-chat-row ${selectedChats.includes(chat.id) ? 'selected' : ''}`} onClick={() => { if (selectionMode) { toggleChatSelection(chat.id); return; } setNotice('Direct messaging with @' + chat.username + ' will open when FNI member accounts and messaging are connected.'); }}>
          <div className="fni-chat-avatar"><span>{chat.username.slice(0,1).toUpperCase()}</span></div>
          <div className="fni-chat-row-copy"><div className="fni-chat-row-top"><b>@{chat.username}</b><time>{chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : new Date(chat.createdAt).toLocaleDateString([], {day:'numeric',month:'short'})}</time></div><div className="fni-chat-row-bottom"><span>{chat.lastMessage || 'Start a conversation'}</span>{pinnedChats.includes(chat.id) && <Pin size={12} className="fni-chat-row-pin-icon"/>}</div></div>
        </button>
      </div>)}
      {tab !== 'Personal' && filtered.map(group => { const lastMsg = groupMessages.filter(m => m.groupId === group.id).slice(-1)[0]; const unreadCount = groupMessages.filter(m => m.groupId === group.id && !readChats.includes(group.id)).length; return <div className={`fni-chat-row-wrap ${selectionMode ? 'is-selectable' : ''}`} key={group.id} {...(selectionMode ? {} : chatRowTouchHandlers(group.id))}>
        {selectionMode && <button className="fni-chat-select-circle" aria-label={selectedChats.includes(group.id) ? 'Deselect chat' : 'Select chat'} onClick={() => toggleChatSelection(group.id)}>{selectedChats.includes(group.id) ? <Check size={15}/> : null}</button>}
        <button className={`fni-chat-row ${selectedChats.includes(group.id) ? 'selected' : ''}`} onClick={(e) => { if (chatLongPressTriggered.current) { e.preventDefault(); chatLongPressTriggered.current = false; return; } selectionMode ? toggleChatSelection(group.id) : (setSelectedId(group.id),setView('group-chat')); }}>
          <div className="fni-chat-avatar fni-group-chat-avatar"><Users size={20}/></div>
          <div className="fni-chat-row-copy"><div className="fni-chat-row-top"><b>{group.name}</b><time>{lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : new Date(group.createdAt).toLocaleDateString([], {day:'numeric',month:'short'})}</time></div><div className="fni-chat-row-bottom"><span>{lastMsg ? lastMsg.text : (group.description || 'Group conversation')}</span>{pinnedChats.includes(group.id) && <Pin size={12} className="fni-chat-row-pin-icon"/>}{unreadCount > 0 && <span className="fni-chat-unread-badge">{unreadCount}</span>}</div></div>
        </button>
      </div>; })}
      {((tab === 'Personal' || tab === 'Archived') && ((tab === 'Archived') === archivedChats.includes('saved-messages'))) && <div className={`fni-chat-row-wrap ${selectionMode ? 'is-selectable' : ''}`} {...(selectionMode ? {} : chatRowTouchHandlers('saved-messages'))}>
        {selectionMode && <button className="fni-chat-select-circle" aria-label={selectedChats.includes('saved-messages') ? 'Deselect Saved Messages' : 'Select Saved Messages'} onClick={() => toggleChatSelection('saved-messages')}>{selectedChats.includes('saved-messages') ? <Check size={15}/> : null}</button>}
        <button className={`fni-chat-row fni-saved-row ${selectedChats.includes('saved-messages') ? 'selected' : ''}`} onClick={(e) => { if (chatLongPressTriggered.current) { e.preventDefault(); chatLongPressTriggered.current = false; return; } selectionMode ? toggleChatSelection('saved-messages') : setView('saved'); }}>
          <div className="fni-chat-avatar fni-saved-avatar"><Bookmark size={21}/></div>
          <div className="fni-chat-row-copy"><div className="fni-chat-row-top"><b>Saved Messages</b><time> </time></div><div className="fni-chat-row-bottom"><span>{savedPreview}</span><small><Lock size={11}/> Only you</small></div></div>
        </button>
      </div>}
      {tab === 'Personal' && !filteredPersonalChats.length && archivedChats.includes('saved-messages') && <div className="fni-chat-list-empty"><MessageCircle size={22}/><b>No personal chats yet</b><span>People you add for one-to-one conversations will appear here. No sample contacts are added.</span><button className="msg-secondary" onClick={() => setView('new-chat')}>New message</button></div>}
      {tab === 'Personal' && !filteredPersonalChats.length && !archivedChats.includes('saved-messages') && query && <div className="fni-chat-list-empty"><Search size={20}/><b>No matching personal chats</b><span>Try another name or keyword.</span></div>}
      {tab === 'Personal' && !filteredPersonalChats.length && !archivedChats.includes('saved-messages') && !query && <div className="fni-chat-list-empty"><MessageCircle size={22}/><b>No personal chats yet</b><span>People you add for one-to-one conversations will appear here. No sample contacts are added.</span><button className="msg-secondary" onClick={() => setView('new-chat')}>New message</button></div>}
      {tab === 'Groups' && !filtered.length && <div className="fni-chat-list-empty"><Users size={22}/><b>No group chats yet</b><span>Groups you create or join will appear here.</span><button className="msg-secondary" onClick={() => setView('create')}>Create group</button></div>}
      {query && !filtered.length && !filteredPersonalChats.length && tab !== 'Personal' && <div className="fni-chat-list-empty"><Search size={20}/><b>No matching chats</b><span>Try another name or keyword.</span></div>}
    </div>
    {chatContextMenu && (() => {
      const isPinned = pinnedChats.includes(chatContextMenu.chatId);
      const isArchived = archivedChats.includes(chatContextMenu.chatId);
      const assignedFolders = chatFolderMap[chatContextMenu.chatId] || [];
      const actions = ['Open', 'Mark as Read', isPinned ? 'Unpin' : 'Pin', isArchived ? 'Unarchive' : 'Archive', ...customFolders.map(folder => (assignedFolders.includes(folder) ? 'Remove from: ' : 'Add to: ') + folder), 'Select', 'Delete'];
      return <><button className="fni-chat-context-dismiss" aria-label="Close menu" onClick={() => setChatContextMenu(null)}/><div className="fni-chat-context-menu" role="menu" style={{left:chatContextMenu.x,top:chatContextMenu.y}}>{actions.map(action => <button key={action} role="menuitem" className={action === 'Delete' ? 'danger' : ''} onClick={() => handleChatContextAction(action === 'Unpin' ? 'Pin' : action === 'Unarchive' ? 'Archive' : action, chatContextMenu.chatId)}>{action === 'Open' ? <MessageCircle size={16}/> : action === 'Mark as Read' ? <CheckCheck size={16}/> : action === 'Pin' || action === 'Unpin' ? <Pin size={16}/> : action === 'Archive' || action === 'Unarchive' ? <Archive size={16}/> : action === 'Select' ? <SquareCheck size={16}/> : action.startsWith('Add to: ') || action.startsWith('Remove from: ') ? <Folder size={16}/> : <Trash2 size={16}/>}<span>{action}</span></button>)}</div></>;
    })()}
    {folderPicker && <div className="fni-folder-picker-backdrop" role="presentation"><section className="fni-folder-picker" role="dialog" aria-modal="true" aria-label={`Choose chats for ${folderPicker}`}><div className="fni-folder-picker-head"><div><span className="msg-eyebrow">CUSTOM CHAT FOLDER</span><h3>Add to {folderPicker}</h3><p>Select any people or groups. A chat can belong to more than one folder.</p></div><button type="button" aria-label="Close folder picker" onClick={() => setFolderPicker(null)}><X size={19}/></button></div><div className="fni-folder-picker-list">{[...personalChats.map(chat => ({id:chat.id,title:'@'+chat.username,subtitle:'Personal chat',group:false})),...groups.map(group => ({id:group.id,title:group.name,subtitle:'Group chat',group:true}))].map(item => <label className="fni-folder-picker-item" key={item.id}><span className="fni-folder-picker-avatar">{item.group ? <Users size={17}/> : item.title.slice(1,2).toUpperCase()}</span><span className="fni-folder-picker-copy"><b>{item.title}</b><small>{item.subtitle}</small></span><input type="checkbox" checked={folderSelection.includes(item.id)} onChange={e => setFolderSelection(current => e.target.checked ? [...current,item.id] : current.filter(id => id !== item.id))}/></label>)}{!personalChats.length && !groups.length && <div className="fni-folder-picker-empty">Your people and groups will appear here when you add or create them.</div>}</div><div className="fni-folder-picker-actions"><button type="button" className="msg-secondary" onClick={() => setFolderPicker(null)}>Skip for now</button><button type="button" className="msg-primary" onClick={() => { setChatFolderMap(current => { const next={...current}; [...personalChats.map(c=>c.id),...groups.map(g=>g.id)].forEach(id => { const existing=next[id] || []; const selected=folderSelection.includes(id); const updated=selected ? [...new Set([...existing,folderPicker])] : existing.filter(folder=>folder!==folderPicker); if(updated.length) next[id]=updated; else delete next[id]; }); return next; }); setFolderPicker(null); setNotice(folderSelection.length + ' chat' + (folderSelection.length===1?'':'s') + ' added to ' + folderPicker + '.'); }}><Check size={16}/> Add selected ({folderSelection.length})</button></div></section></div>}
    <div className="msg-footer-note"><Shield size={15}/> Your chat list is stored in this browser preview. Real member conversations and cross-device sync will be enabled with the FNI backend.</div>
    {notice && <div className="msg-toast" role="status">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>;
}