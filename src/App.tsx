import { useEffect, useRef, useState } from 'react';
import { Menu, Search, Plus, MessageCircle, Users, Phone, Settings, ChevronDown, X, ArrowLeft, Send, Paperclip, Smile, MoreVertical, Video, PhoneCall } from 'lucide-react';

type Section = 'Chats' | 'Contacts' | 'Calls' | 'Settings';
type Folder = 'All chats' | 'Personal' | 'Groups' | 'Archived';
type Message = { id: number; text: string; time: string; replyTo?: string; mediaUrl?: string; mediaType?: 'photo' | 'video'; mediaName?: string; reactions?: string[]; edited?: boolean; forwardedFrom?: string };

export default function App() {
  const [section, setSection] = useState<Section>('Chats');
  const [folder, setFolder] = useState<Folder>('All chats');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newActionOpen, setNewActionOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMemberInput, setGroupMemberInput] = useState('');
  const [prayerRequestInput, setPrayerRequestInput] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceSelection, setAttendanceSelection] = useState<string[]>([]);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [groupDetails, setGroupDetails] = useState<Record<string, { name: string; description: string; members?: string[]; moderators?: string[]; meeting?: { date: string; time: string; location: string; link: string }; prayerRequests?: { id: number; text: string; createdAt: string; prayed: boolean }[]; attendance?: { date: string; present: string[] }[] }>>(() => {
    try { return JSON.parse(localStorage.getItem('fni-local-groups') || '{}'); }
    catch { return {}; }
  });
  const [username, setUsername] = useState('');
  const [activeChat, setActiveChat] = useState('');
  const [unreadChats, setUnreadChats] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('fni-local-unread') || '{}'); }
    catch { return {}; }
  });
  const [chatOptionsOpen, setChatOptionsOpen] = useState(false);
  const [chatInfoOpen, setChatInfoOpen] = useState(false);
  const [videoRoomOpen, setVideoRoomOpen] = useState(false);
  const [videoRoomStarted, setVideoRoomStarted] = useState(false);
  const [videoMicOn, setVideoMicOn] = useState(true);
  const [videoCameraOn, setVideoCameraOn] = useState(true);
  const [sharedMediaPreview, setSharedMediaPreview] = useState<Message | null>(null);
  const [mutedChats, setMutedChats] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('fni-local-muted') || '[]'); }
    catch { return []; }
  });
  const [archivedChats, setArchivedChats] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('fni-local-archived') || '[]'); }
    catch { return []; }
  });
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('fni-local-drafts') || '{}'); }
    catch { return {}; }
  });
  const draft = activeChat ? drafts[activeChat] || '' : '';
  const setDraft = (value: string | ((current: string) => string)) => {
    if (!activeChat) return;
    setDrafts((current) => ({
      ...current,
      [activeChat]: typeof value === 'function' ? value(current[activeChat] || '') : value,
    }));
  };
  const [draftBeforeEdit, setDraftBeforeEdit] = useState('');
  const [conversations, setConversations] = useState<Record<string, Message[]>>(() => {
    try { return JSON.parse(localStorage.getItem('fni-local-conversations') || '{}'); }
    catch { return {}; }
  });
  const messages = activeChat ? conversations[activeChat] || [] : [];
  const setMessages = (update: Message[] | ((current: Message[]) => Message[])) => {
    if (!activeChat) return;
    setConversations((current) => ({
      ...current,
      [activeChat]: typeof update === 'function' ? update(current[activeChat] || []) : update,
    }));
  };
  useEffect(() => {
    try { localStorage.setItem('fni-local-groups', JSON.stringify(groupDetails)); } catch { /* storage may be unavailable */ }
  }, [groupDetails]);
  useEffect(() => {
    try { localStorage.setItem('fni-local-drafts', JSON.stringify(drafts)); } catch { /* storage may be unavailable */ }
  }, [drafts]);
  useEffect(() => {
    try { localStorage.setItem('fni-local-unread', JSON.stringify(unreadChats)); } catch { /* storage may be unavailable */ }
  }, [unreadChats]);
  useEffect(() => {
    try { localStorage.setItem('fni-local-archived', JSON.stringify(archivedChats)); } catch { /* storage may be unavailable */ }
  }, [archivedChats]);
  useEffect(() => {
    try { localStorage.setItem('fni-local-muted', JSON.stringify(mutedChats)); } catch { /* storage may be unavailable */ }
  }, [mutedChats]);
  useEffect(() => {
    const textOnly: Record<string, Message[]> = {};
    Object.entries(conversations).forEach(([chat, items]) => {
      textOnly[chat] = items.filter((item) => !item.mediaType);
    });
    try { localStorage.setItem('fni-local-conversations', JSON.stringify(textOnly)); } catch { /* storage may be unavailable */ }
  }, [conversations]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [pinnedMessageId, setPinnedMessageId] = useState<number | null>(null);
  const [openMessageMenu, setOpenMessageMenu] = useState<number | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [forwardRecipient, setForwardRecipient] = useState('');
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const attachmentInput = useRef<HTMLInputElement>(null);

  const matchingMessages = chatSearch.trim() ? messages.filter((message) => message.text.toLowerCase().includes(chatSearch.trim().toLowerCase()) || (message.mediaName || '').toLowerCase().includes(chatSearch.trim().toLowerCase())) : messages;
  const recentChats = Object.entries(conversations)
    .filter(([chat, items]) => {
      const isArchived = archivedChats.includes(chat);
      const matchesFolder = folder === 'Archived' ? isArchived : !isArchived && (folder === 'All chats' || (folder === 'Personal' && chat.startsWith('@')) || (folder === 'Groups' && !chat.startsWith('@')));
      const query = search.trim().toLowerCase();
      const matchesConversation = !query || chat.toLowerCase().includes(query) || items.some((message) =>
        message.text.toLowerCase().includes(query) || (message.mediaName || '').toLowerCase().includes(query)
      );
      return matchesFolder && matchesConversation;
    })
    .sort((a, b) => (b[1][b[1].length - 1]?.id || 0) - (a[1][a[1].length - 1]?.id || 0));

  const navigation = [
    { label: 'Chats' as const, icon: MessageCircle },
    { label: 'Contacts' as const, icon: Users },
    { label: 'Calls' as const, icon: Phone },
    { label: 'Settings' as const, icon: Settings },
  ];

  const createGroup = () => {
    const name = groupName.trim();
    if (!name) return;
    const groupId = `group-${Date.now()}`;
    setGroupDetails((current) => ({ ...current, [groupId]: { name, description: groupDescription.trim(), members: [] } }));
    setConversations((current) => ({ ...current, [groupId]: [] }));
    setActiveChat(groupId);
    setFolder('Groups');
    setSection('Chats');
    setNewGroupOpen(false);
    setNewActionOpen(false);
    setGroupName('');
    setGroupDescription('');
    setReplyTo(null);
  };

  const startChat = () => {
    const handle = username.trim().replace(/^@/, '');
    if (!handle) return;
    const nextChat = handle.startsWith('@') ? handle : `@${handle}`;
    setActiveChat(nextChat);
    setUnreadChats((current) => ({ ...current, [nextChat]: false }));
    setChatOptionsOpen(false);
    setNewChatOpen(false);
    setUsername('');
    setReplyTo(null);
    setOpenMessageMenu(null);
  };

  const attachMedia = (file?: File) => {
    if (!file) return;
    const mediaType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'photo' : null;
    if (!mediaType) return;
    const mediaUrl = URL.createObjectURL(file);
    setMessages((current) => [...current, { id: Date.now(), text: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mediaUrl, mediaType, mediaName: file.name }]);
  };

  const saveMedia = (message: Message) => {
    if (!message.mediaUrl) return;
    const link = document.createElement('a');
    link.href = message.mediaUrl;
    link.download = message.mediaName || (message.mediaType === 'video' ? 'fni-video' : 'fni-photo');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setOpenMessageMenu(null);
  };

  const addEmoji = (emoji: string) => { setDraft((current) => current + emoji); setEmojiOpen(false); };

  const addReaction = (messageId: number, emoji: string) => {
    setMessages((current) => current.map((message) => message.id === messageId ? { ...message, reactions: message.reactions?.includes(emoji) ? message.reactions.filter((item) => item !== emoji) : [...(message.reactions || []), emoji] } : message));
    setOpenMessageMenu(null);
  };

  const confirmForward = () => {
    const recipient = forwardRecipient.trim().replace(/^@/, '');
    if (!recipient || !forwardingMessage) return;
    const forwarded: Message = {
      ...forwardingMessage,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: undefined, reactions: [], edited: false, forwardedFrom: activeChat,
    };
    const recipientChat = '@' + recipient;
    setConversations((current) => ({ ...current, [recipientChat]: [...(current[recipientChat] || []), forwarded] }));
    setActiveChat(recipientChat);
    setPinnedMessageId(null); setReplyTo(null); setEditingMessage(null); setOpenMessageMenu(null);
    setForwardingMessage(null); setForwardRecipient('');
  };
  const sendMessage = () => {
    const value = draft.trim();
    if (!value) return;

    if (editingMessage) {
      setMessages((current) =>
        current.map((message) =>
          message.id === editingMessage.id
            ? { ...message, text: value, edited: true }
            : message
        )
      );
      setEditingMessage(null);
    } else {
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          text: value,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          replyTo: replyTo?.text,
        },
      ]);
      setReplyTo(null);
    }

    setDraft('');
  };

  return (
    <main className="app-shell">
      <aside className={`navigation-drawer ${menuOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-heading">
          <div className="brand-lockup">
            <img src="/FNI-APP-2.0/fni-logo.jpg" alt="FNI" />
            <div><strong>FNI</strong><span>Forerunners Network International</span></div>
          </div>
          <button className="icon-button drawer-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X /></button>
        </div>
        <div className="profile-summary">
          <div className="profile-avatar">F</div>
          <div className="profile-copy"><strong>FNI Member</strong><span><i /> Online</span></div>
          <ChevronDown size={17} />
        </div>
        <nav className="main-navigation" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={section === label ? 'nav-item active' : 'nav-item'} onClick={() => { setSection(label); setActiveChat(''); setMenuOpen(false); }}>
              <Icon size={20} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="drawer-footer"><span className="footer-dot" /> FNI Connect <span className="version">Preview</span></div>
      </aside>

      {menuOpen && <button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <section className={`chat-list-panel ${activeChat ? 'list-hidden-mobile' : ''}`}>
        <header className="list-header">
          <div className="list-title-row">
            <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></button>
            <div><h1>{section}</h1><p>FORERUNNERS NETWORK INTERNATIONAL</p></div>
            <div className="new-action-wrap"><button className="icon-button new-chat-button" aria-label="Create chat" title="Create chat or group" aria-expanded={newActionOpen} onClick={() => setNewActionOpen((open) => !open)}><Plus /></button>{newActionOpen && <div className="new-action-menu"><button onClick={() => { setNewChatOpen(true); setNewActionOpen(false); }}>New message</button><button onClick={() => { setNewGroupOpen(true); setNewActionOpen(false); }}>New group</button></div>}</div>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people, @usernames, messages..." />
          </label>
          {section === 'Chats' && (
            <div className="folder-tabs" role="tablist" aria-label="Chat folders">
              {(['All chats', 'Personal', 'Groups', 'Archived'] as Folder[]).map((item) => (
                <button key={item} role="tab" aria-selected={folder === item} className={folder === item ? 'folder-tab selected' : 'folder-tab'} onClick={() => setFolder(item)}>{item}</button>
              ))}
            </div>
          )}
        </header>
        {section === 'Chats' && recentChats.length > 0 ? (
          <div className="recent-chat-list">
            {recentChats.map(([chat, items]) => {
              const latest = items[items.length - 1];
              return <button className={`recent-chat-row ${activeChat === chat ? 'selected' : ''}`} key={chat} onClick={() => { setActiveChat(chat); setUnreadChats((current) => ({ ...current, [chat]: false })); setReplyTo(null); setEditingMessage(null); setOpenMessageMenu(null); setChatOptionsOpen(false); }}>
                <span className="recent-chat-avatar">{(groupDetails[chat]?.name || chat.replace('@','')).slice(0,1).toUpperCase()}</span>
                <span className="recent-chat-copy"><strong>{groupDetails[chat]?.name || chat}{mutedChats.includes(chat) && <span className="muted-chat-indicator" title="Muted"> · Muted</span>}</strong><span>{search.trim() ? ([...items].reverse().find((message) => message.text.toLowerCase().includes(search.trim().toLowerCase()) || (message.mediaName || '').toLowerCase().includes(search.trim().toLowerCase()))?.text || [...items].reverse().find((message) => (message.mediaName || '').toLowerCase().includes(search.trim().toLowerCase()))?.mediaName || latest?.text || (latest?.mediaType === 'photo' ? 'Photo' : latest?.mediaType === 'video' ? 'Video' : 'No messages yet')) : (latest?.text || (latest?.mediaType === 'photo' ? 'Photo' : latest?.mediaType === 'video' ? 'Video' : 'No messages yet'))}</span></span>
                <span className="recent-chat-meta"><span className="recent-chat-time">{latest?.time || ''}</span>{unreadChats[chat] && <span className="unread-chat-badge">1</span>}</span>
              </button>;
            })}
          </div>
        ) : (
          <div className="empty-list">
            <div className="empty-icon"><MessageCircle size={27} strokeWidth={1.5} /></div>
            <h2>{search ? 'No matches found' : section === 'Chats' ? (folder === 'Groups' ? 'No groups yet' : folder === 'Archived' ? 'No archived chats' : 'No conversations yet') : section === 'Contacts' ? 'Your contacts will appear here' : section === 'Calls' ? 'No recent calls' : 'Your settings will appear here'}</h2>
            <p>{search ? 'Try another name or keyword.' : 'When you connect with people on FNI, you will find them here.'}</p>
            {section === 'Chats' && folder !== 'Groups' && folder !== 'Archived' && <button className="start-chat-button" onClick={() => setNewChatOpen(true)}>Start a conversation</button>}
          </div>
        )}
      </section>

      <section className={`conversation-panel ${activeChat ? 'conversation-active' : ''}`}>
        {activeChat ? (
          <>
            <header className="active-chat-header">
              <button className="icon-button chat-back-button" aria-label="Back to chats" onClick={() => setActiveChat('')}><ArrowLeft /></button>
              <div className="chat-person-avatar">{(groupDetails[activeChat]?.name || activeChat.replace('@','')).slice(0,1).toUpperCase()}</div>
              <button className="chat-person-details chat-info-trigger" onClick={() => { const meeting = groupDetails[activeChat]?.meeting; setMeetingDate(meeting?.date || ''); setMeetingTime(meeting?.time || ''); setMeetingLocation(meeting?.location || ''); setMeetingLink(meeting?.link || ''); setChatInfoOpen(true); }} aria-label="View chat information"><strong>{groupDetails[activeChat]?.name || activeChat}</strong><span>{groupDetails[activeChat] ? 'FNI group' : 'FNI member'}</span></button>
              <div className="active-chat-actions">
                <button className="icon-button" aria-label="Search messages" title="Search messages" onClick={() => { setChatSearchOpen((open) => !open); setChatSearch(''); }}><Search /></button>
                <button className="icon-button" aria-label="Voice call"><PhoneCall /></button>
                <button className="icon-button" aria-label="Video call"><Video /></button>
                <button className="icon-button" aria-label="Chat options" aria-expanded={chatOptionsOpen} onClick={() => setChatOptionsOpen((open) => !open)}><MoreVertical /></button>
              </div>
            </header>
            {chatOptionsOpen && <div className="chat-options-menu"><button onClick={() => { setUnreadChats((current) => ({ ...current, [activeChat]: true })); setActiveChat(''); setChatOptionsOpen(false); }}>Mark as unread</button><button onClick={() => { setMutedChats((current) => current.includes(activeChat) ? current.filter((chat) => chat !== activeChat) : [...current, activeChat]); setChatOptionsOpen(false); }}>{mutedChats.includes(activeChat) ? 'Unmute chat' : 'Mute chat'}</button><button onClick={() => { setArchivedChats((current) => current.includes(activeChat) ? current.filter((chat) => chat !== activeChat) : [...current, activeChat]); setActiveChat(''); setChatOptionsOpen(false); setFolder(archivedChats.includes(activeChat) ? 'All chats' : 'Archived'); }}>{archivedChats.includes(activeChat) ? 'Unarchive chat' : 'Archive chat'}</button><button className="delete-action" onClick={() => { if (window.confirm('Clear all messages in this conversation? This cannot be undone.')) { setMessages([]); setDraft(''); setReplyTo(null); setEditingMessage(null); setPinnedMessageId(null); setChatSearch(''); setChatSearchOpen(false); } setChatOptionsOpen(false); }}>Clear chat history</button><button className="delete-action" onClick={() => { const chatToDelete = activeChat; if (window.confirm(`Delete this conversation with ${chatToDelete}? This removes its local messages and drafts.`)) { setConversations((current) => { const next = { ...current }; delete next[chatToDelete]; return next; }); setDrafts((current) => { const next = { ...current }; delete next[chatToDelete]; return next; }); setUnreadChats((current) => { const next = { ...current }; delete next[chatToDelete]; return next; }); setArchivedChats((current) => current.filter((chat) => chat !== chatToDelete)); setMutedChats((current) => current.filter((chat) => chat !== chatToDelete)); setActiveChat(''); setPinnedMessageId(null); setReplyTo(null); setEditingMessage(null); setFolder('All chats'); } setChatOptionsOpen(false); }}>Delete conversation</button></div>}
            {chatSearchOpen && <div className="chat-search-bar"><Search size={17} /><input autoFocus value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="Search in conversation" /><span>{chatSearch.trim() ? `${matchingMessages.length} found` : ''}</span><button aria-label="Close search" onClick={() => { setChatSearchOpen(false); setChatSearch(''); }}><X size={17} /></button></div>}
            {pinnedMessageId !== null && messages.find((item) => item.id === pinnedMessageId) && (
              <button
                className="pinned-message-banner"
                onClick={() => document.getElementById(`message-${pinnedMessageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              >
                <strong>Pinned message</strong>
                <span>{messages.find((item) => item.id === pinnedMessageId)?.text || 'Photo or video'}</span>
                <span
                  role="button"
                  aria-label="Unpin message"
                  onClick={(event) => { event.stopPropagation(); setPinnedMessageId(null); }}
                >×</span>
              </button>
            )}
            <div className="message-history">
              {messages.length === 0 ? (
                <div className="first-message-note"><span>Conversation started</span><p>Send a message to begin.</p></div>
              ) : matchingMessages.length === 0 ? <div className="first-message-note"><span>No messages found</span><p>Try another search term.</p></div> : matchingMessages.map((message) => (
                <div className="message-row outgoing" id={`message-${message.id}`} key={message.id}>
                  <div className="message-action-wrap">
                    <button className="message-more-button" aria-label="Message actions" onClick={() => setOpenMessageMenu(openMessageMenu === message.id ? null : message.id)}><MoreVertical size={17} /></button>
                    {openMessageMenu === message.id && <div className="message-action-menu">
                      <div className="reaction-choices">{['👍','❤️','😂','😮','🙏','🔥'].map((emoji) => <button key={emoji} aria-label="Add reaction" onClick={() => addReaction(message.id, emoji)}>{emoji}</button>)}</div>
                      <button onClick={() => { setReplyTo(message); setEditingMessage(null); setOpenMessageMenu(null); }}>Reply</button>\n                      {!message.mediaType && <button onClick={() => { setDraftBeforeEdit(draft); setEditingMessage(message); setDraft(message.text); setReplyTo(null); setOpenMessageMenu(null); }}>Edit message</button>}\n                      <button onClick={() => { setPinnedMessageId(pinnedMessageId === message.id ? null : message.id); setOpenMessageMenu(null); }}>{pinnedMessageId === message.id ? 'Unpin message' : 'Pin message'}</button>
                      <button onClick={() => { setForwardingMessage(message); setForwardRecipient(''); setOpenMessageMenu(null); }}>Forward</button>
                      {message.mediaType ? (
                        <button onClick={() => saveMedia(message)}>Save {message.mediaType === 'video' ? 'video' : 'photo'}</button>
                      ) : (
                        <button onClick={() => { void navigator.clipboard?.writeText(message.text); setOpenMessageMenu(null); }}>Copy text</button>
                      )}
                      <button className="delete-action" onClick={() => { setMessages((current) => current.filter((item) => item.id !== message.id)); setOpenMessageMenu(null); }}>Delete</button>
                    </div>}
                    <div className="message-bubble">
                      {message.forwardedFrom && <div className="forwarded-label">Forwarded from {message.forwardedFrom}</div>}
                      {message.replyTo && <div className="quoted-message">{message.replyTo}</div>}
                      {message.mediaType === 'photo' && message.mediaUrl && <img className="message-media" src={message.mediaUrl} alt={message.mediaName || 'Shared photo'} />}
                      {message.mediaType === 'video' && message.mediaUrl && <video className="message-media" src={message.mediaUrl} controls playsInline />}
                      {message.text && <div>{message.text.split(/(@[\w.]+)/g).map((part, index) => part.startsWith('@') ? <strong className="message-mention" key={index}>{part}</strong> : part)}</div>}<span>{message.edited ? 'edited · ' : ''}{message.time} <b>✓✓</b></span>
                      {message.reactions && message.reactions.length > 0 && <div className="message-reactions">{message.reactions.map((emoji) => <button key={emoji} onClick={() => addReaction(message.id, emoji)}>{emoji}</button>)}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(replyTo || editingMessage) && <div className="reply-preview"><div><strong>{editingMessage ? 'Editing message' : 'Replying to your message'}</strong><span>{editingMessage ? editingMessage.text : replyTo?.text}</span></div><button onClick={() => { setReplyTo(null); setEditingMessage(null); setDraft(editingMessage ? draftBeforeEdit : draft); }} aria-label="Cancel reply"><X size={17} /></button></div>}
            <div className="message-composer">
              <button className="composer-icon" aria-label="Attach photo or video" title="Attach photo or video" onClick={() => attachmentInput.current?.click()}><Paperclip /></button>
              <input ref={attachmentInput} className="attachment-input" type="file" accept="image/*,video/*" onChange={(event) => { attachMedia(event.target.files?.[0]); event.target.value = ''; }} />
              <div className="composer-input-wrap">
                <textarea value={draft} onChange={(event) => { setDraft(event.target.value); const tail = event.target.value.split(/\s/).pop() || ''; setMentionOpen(tail.startsWith('@') && tail.length > 0); }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } if (event.key === 'Escape') { setMentionOpen(false); setEmojiOpen(false); } }} placeholder="Message" rows={1} />
                {mentionOpen && activeChat && <div className="mention-suggestions"><button onClick={() => { setDraft((current) => current.replace(/@[\w.]*$/, activeChat + ' ')); setMentionOpen(false); }}>{activeChat}<span>FNI member in this chat</span></button></div>}
              </div>
              <div className="emoji-picker-wrap"><button className="composer-icon emoji-button" aria-label="Emoji" onClick={() => setEmojiOpen((open) => !open)}><Smile /></button>
                {emojiOpen && <div className="emoji-picker">{['😀','😂','🥹','😍','😊','🙏','❤️','👍','🔥','🎉','😢','😮','👏','✨','💯','🤝','🙌','💙','🤣','😉'].map((emoji) => <button key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</button>)}</div>}
              </div>
              <button className="send-button" aria-label={editingMessage ? 'Save edited message' : 'Send message'} onClick={sendMessage} disabled={!draft.trim()}><Send size={19} /></button>
            </div>
            <div className="local-preview-note">Messages are currently stored only in this preview. Connect the FNI messaging service to deliver them.</div>
          </>
        ) : (
          <>
            <div className="conversation-topbar"><span className="topbar-label">FNI CONNECT</span><div className="topbar-actions"><span className="secure-indicator"><i /> Connected</span></div></div>
            <div className="welcome-state">
              <div className="welcome-logo"><img src="/FNI-APP-2.0/fni-logo.jpg" alt="Forerunners Network International logo" /></div>
              <h2>Stay connected.</h2>
              <p>Your conversations, community and ministry connections in one place.</p>
              <span className="welcome-caption">FORERUNNERS NETWORK INTERNATIONAL</span>
            </div>
            <div className="conversation-footer">Select a conversation to start messaging</div>
          </>
        )}
      </section>

      {chatInfoOpen && activeChat && (
        <div className="modal-backdrop chat-info-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setChatInfoOpen(false); }}>
          <section className="chat-info-modal" role="dialog" aria-modal="true" aria-label="Chat information">
            <div className="modal-heading"><h2>Chat information</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setChatInfoOpen(false)}><X /></button></div>
            <div className="chat-info-profile"><div className="chat-info-avatar">{(groupDetails[activeChat]?.name || activeChat.replace('@','')).slice(0,1).toUpperCase()}</div><strong>{groupDetails[activeChat]?.name || activeChat}</strong><span>{groupDetails[activeChat] ? 'FNI group' : 'FNI member'}</span>{groupDetails[activeChat]?.description && <p className="group-description">{groupDetails[activeChat].description}</p>}</div>
            {groupDetails[activeChat] && (
              <div className="group-members-section">
                <div className="shared-media-heading"><strong>Members</strong><span>{groupDetails[activeChat].members?.length || 0}</span></div>
                <form className="group-member-add" onSubmit={(event) => {
                  event.preventDefault();
                  const handle = groupMemberInput.trim().replace(/^@/, '');
                  if (!handle) return;
                  const member = '@' + handle;
                  setGroupDetails((current) => ({
                    ...current,
                    [activeChat]: { ...current[activeChat], members: Array.from(new Set([...(current[activeChat].members || []), member])) },
                  }));
                  setGroupMemberInput('');
                }}>
                  <input aria-label="Add member username" value={groupMemberInput} onChange={(event) => setGroupMemberInput(event.target.value)} placeholder="Add member by @username" />
                  <button type="submit" disabled={!groupMemberInput.trim()}>Add</button>
                </form>
                {(groupDetails[activeChat].members || []).length > 0 ? (
                  <div className="group-member-list">
                    {(groupDetails[activeChat].members || []).map((member) => (
                      <div className="group-member-row" key={member}>
                        <span className="group-member-avatar">{member.slice(1, 2).toUpperCase()}</span>
                        <div className="group-member-identity"><strong>{member}</strong>{groupDetails[activeChat].moderators?.includes(member) && <span className="group-moderator-label">Moderator</span>}</div>
                        <button type="button" className="group-role-button" onClick={() => setGroupDetails((current) => ({
                          ...current,
                          [activeChat]: {
                            ...current[activeChat],
                            moderators: current[activeChat].moderators?.includes(member)
                              ? (current[activeChat].moderators || []).filter((item) => item !== member)
                              : [...(current[activeChat].moderators || []), member],
                          },
                        }))}>{groupDetails[activeChat].moderators?.includes(member) ? 'Remove role' : 'Make moderator'}</button>
                        <button type="button" aria-label={'Remove ' + member} onClick={() => setGroupDetails((current) => ({
                          ...current,
                          [activeChat]: {
                            ...current[activeChat],
                            members: (current[activeChat].members || []).filter((item) => item !== member),
                            moderators: (current[activeChat].moderators || []).filter((item) => item !== member),
                          },
                        }))}>Remove</button>
                      </div>
                    ))}
                  </div>
                ) : <p className="group-members-empty">No members added yet. Add FNI usernames to organise this group preview.</p>}
              </div>
            )}
            {groupDetails[activeChat] && (
              <section className="group-meeting-section">
                <div className="shared-media-heading"><strong>Group meeting</strong><span>{groupDetails[activeChat].meeting ? 'Scheduled' : 'Not scheduled'}</span></div>
                <div className="group-video-actions">
                  <button type="button" className="start-video-chat-button" onClick={() => { setVideoRoomStarted(false); setVideoMicOn(true); setVideoCameraOn(true); setVideoRoomOpen(true); }}><Video size={17} /> Start Video Chat</button>
                  {groupDetails[activeChat].meeting?.link && <a className="external-meeting-button" href={groupDetails[activeChat].meeting.link} target="_blank" rel="noreferrer">Join external meeting</a>}
                </div>
                {groupDetails[activeChat].meeting && (
                  <div className="group-meeting-summary">
                    <strong>{new Date(`${groupDetails[activeChat].meeting.date}T${groupDetails[activeChat].meeting.time || '00:00'}`).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    <span>{groupDetails[activeChat].meeting.time || 'Time not set'}{groupDetails[activeChat].meeting.location ? ` · ${groupDetails[activeChat].meeting.location}` : ''}</span>
                    {groupDetails[activeChat].meeting.link && <a href={groupDetails[activeChat].meeting.link} target="_blank" rel="noreferrer">Join meeting</a>}
                  </div>
                )}
                <form className="group-meeting-form" onSubmit={(event) => {
                  event.preventDefault();
                  if (!meetingDate || !meetingTime) return;
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { date: meetingDate, time: meetingTime, location: meetingLocation.trim(), link: meetingLink.trim() } } }));
                }}>
                  <label>Meeting date<input type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} required /></label>
                  <label>Start time<input type="time" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} required /></label>
                  <label>Location <span className="optional-label">Optional</span><input value={meetingLocation} onChange={(event) => setMeetingLocation(event.target.value)} placeholder="e.g. UCC campus or online" /></label>
                  <label>Meeting link <span className="optional-label">Optional</span><input type="url" value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} placeholder="https://..." /></label>
                  <button type="submit" disabled={!meetingDate || !meetingTime}>{groupDetails[activeChat].meeting ? 'Update meeting' : 'Schedule meeting'}</button>
                  {groupDetails[activeChat].meeting && <button type="button" className="group-meeting-cancel" onClick={() => { setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: undefined } })); setMeetingDate(''); setMeetingTime(''); setMeetingLocation(''); setMeetingLink(''); }}>Remove meeting</button>}
                </form>
                <p className="group-meeting-note">Meeting details are saved on this device only. Member notifications and live meeting rooms require the FNI backend.</p>
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-prayer-section">
                <div className="shared-media-heading"><strong>Prayer room</strong><span>{groupDetails[activeChat].prayerRequests?.length || 0} requests</span></div>
                <form className="group-prayer-form" onSubmit={(event) => {
                  event.preventDefault();
                  const prayer = prayerRequestInput.trim();
                  if (!prayer) return;
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], prayerRequests: [{ id: Date.now(), text: prayer, createdAt: new Date().toLocaleDateString([], { day: 'numeric', month: 'short' }), prayed: false }, ...(current[activeChat].prayerRequests || [])] } }));
                  setPrayerRequestInput('');
                }}>
                  <textarea value={prayerRequestInput} onChange={(event) => setPrayerRequestInput(event.target.value)} maxLength={500} rows={2} placeholder="Share a prayer request with this group..." aria-label="Prayer request" />
                  <button type="submit" disabled={!prayerRequestInput.trim()}>Add prayer request</button>
                </form>
                {(groupDetails[activeChat].prayerRequests || []).length > 0 ? (
                  <div className="group-prayer-list">
                    {(groupDetails[activeChat].prayerRequests || []).map((request) => (
                      <article className={`group-prayer-card ${request.prayed ? 'prayer-answered' : ''}`} key={request.id}>
                        <div className="group-prayer-card-top"><span>{request.prayed ? 'Prayed for' : 'Prayer request'}</span><time>{request.createdAt}</time></div>
                        <p>{request.text}</p>
                        <div className="group-prayer-actions"><button type="button" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], prayerRequests: (current[activeChat].prayerRequests || []).map((item) => item.id === request.id ? { ...item, prayed: !item.prayed } : item) } }))}>{request.prayed ? 'Undo' : 'Mark as prayed'}</button><button type="button" className="prayer-delete" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], prayerRequests: (current[activeChat].prayerRequests || []).filter((item) => item.id !== request.id) } }))}>Remove</button></div>
                      </article>
                    ))}
                  </div>
                ) : <p className="group-members-empty">No prayer requests yet. Share the group's first request here.</p>}
                <p className="group-meeting-note">Prayer requests are saved on this device only. Sharing with members and private prayer rooms require the FNI backend.</p>
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-attendance-section">
                <div className="shared-media-heading"><strong>Attendance register</strong><span>{groupDetails[activeChat].attendance?.length || 0} records</span></div>
                <form className="group-attendance-form" onSubmit={(event) => {
                  event.preventDefault();
                  if (!attendanceDate) return;
                  setGroupDetails((current) => {
                    const previous = current[activeChat].attendance || [];
                    const nextRecord = { date: attendanceDate, present: attendanceSelection };
                    return { ...current, [activeChat]: { ...current[activeChat], attendance: [...previous.filter((record) => record.date !== attendanceDate), nextRecord].sort((a, b) => b.date.localeCompare(a.date)) } };
                  });
                  setAttendanceSelection([]);
                }}>
                  <label>Meeting date<input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} required /></label>
                  <strong className="attendance-select-title">Mark members present</strong>
                  {(groupDetails[activeChat].members || []).length ? (
                    <div className="attendance-member-list">
                      {(groupDetails[activeChat].members || []).map((member) => <label className="attendance-member-option" key={member}><input type="checkbox" checked={attendanceSelection.includes(member)} onChange={(event) => setAttendanceSelection((current) => event.target.checked ? [...current, member] : current.filter((item) => item !== member))} /><span>{member}</span></label>)}
                    </div>
                  ) : <p className="group-members-empty">Add group members above before taking attendance.</p>}
                  <button type="submit" disabled={!attendanceDate || !(groupDetails[activeChat].members || []).length}>Save attendance</button>
                </form>
                {(groupDetails[activeChat].attendance || []).length > 0 ? (
                  <div className="attendance-history-list">
                    {(groupDetails[activeChat].attendance || []).map((record) => <article className="attendance-history-card" key={record.date}><div><strong>{new Date(`${record.date}T12:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong><span>{record.present.length} of {groupDetails[activeChat].members?.length || 0} present</span></div><p>{record.present.length ? record.present.join(', ') : 'No members marked present'}</p><button type="button" onClick={() => { setAttendanceDate(record.date); setAttendanceSelection(record.present); }}>Edit record</button></article>)}
                  </div>
                ) : <p className="group-members-empty">No attendance records yet. Choose a meeting date to get started.</p>}
                <p className="group-meeting-note">Attendance is stored on this device only. Member check-in and leader reports require the FNI backend.</p>
              </section>
            )}
            <div className="chat-info-stat"><span>Messages</span><strong>{messages.length}</strong></div>
            <div className="chat-info-stat"><span>Photos and videos</span><strong>{messages.filter((message) => !!message.mediaType).length}</strong></div>
            {messages.some((message) => !!message.mediaType && !!message.mediaUrl) && (
              <div className="shared-media-section">
                <div className="shared-media-heading"><strong>Shared media</strong><span>{messages.filter((message) => !!message.mediaType).length}</span></div>
                <div className="shared-media-grid">
                  {messages.filter((message) => !!message.mediaType && !!message.mediaUrl).map((message) => (
                    <button key={message.id} className="shared-media-thumb" onClick={() => setSharedMediaPreview(message)} aria-label={'Open shared ' + message.mediaType}>
                      {message.mediaType === 'photo' ? <img src={message.mediaUrl} alt={message.mediaName || 'Shared photo'} /> : <><video src={message.mediaUrl} muted playsInline preload="metadata" /><span className="shared-video-mark">VIDEO</span></>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="chat-info-stat"><span>Notifications</span><strong>{mutedChats.includes(activeChat) ? 'Muted' : 'On'}</strong></div>
            <div className="chat-info-actions"><button onClick={() => { setMutedChats((current) => current.includes(activeChat) ? current.filter((chat) => chat !== activeChat) : [...current, activeChat]); }}>{mutedChats.includes(activeChat) ? 'Unmute notifications' : 'Mute notifications'}</button><button onClick={() => setChatInfoOpen(false)}>Done</button></div>
            <p className="chat-info-note">This preview shows information available on this device. Member profiles will appear when FNI accounts are connected.</p>
          </section>
        </div>
      )}
      {videoRoomOpen && activeChat && (
        <div className="modal-backdrop video-room-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setVideoRoomOpen(false); setVideoRoomStarted(false); } }}>
          <section className="video-room-modal" role="dialog" aria-modal="true" aria-label="FNI group video chat">
            <div className="modal-heading"><h2>{videoRoomStarted ? 'Video Chat' : 'Start Video Chat'}</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => { setVideoRoomOpen(false); setVideoRoomStarted(false); }}><X /></button></div>
            <div className="video-room-stage">
              <div className="video-room-avatar">{(groupDetails[activeChat]?.name || 'FNI').slice(0,1).toUpperCase()}</div>
              <strong>{groupDetails[activeChat]?.name || activeChat}</strong>
              <span>{videoRoomStarted ? 'Meeting room preview is open' : 'Start an online meeting with this group'}</span>
            </div>
            <div className="video-room-controls">
              <button type="button" className={videoMicOn ? '' : 'control-off'} onClick={() => setVideoMicOn((value) => !value)}>{videoMicOn ? 'Mic on' : 'Mic off'}</button>
              <button type="button" className={videoCameraOn ? '' : 'control-off'} onClick={() => setVideoCameraOn((value) => !value)}>{videoCameraOn ? 'Camera on' : 'Camera off'}</button>
            </div>
            {!videoRoomStarted ? <button type="button" className="video-room-primary" onClick={() => setVideoRoomStarted(true)}>Start Video Chat</button> : <button type="button" className="video-room-leave" onClick={() => { setVideoRoomOpen(false); setVideoRoomStarted(false); }}>Leave meeting</button>}
            <p className="video-room-note">This is the FNI meeting-room interface preview. Live audio, video, member joining and automatic attendance will work when FNI's meeting service and backend are connected.</p>
          </section>
        </div>
      )}
      {sharedMediaPreview && (
        <div className="shared-media-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSharedMediaPreview(null); }}>
          <button className="shared-media-close" aria-label="Close media preview" onClick={() => setSharedMediaPreview(null)}><X /></button>
          {sharedMediaPreview.mediaType === 'photo' ? <img src={sharedMediaPreview.mediaUrl} alt={sharedMediaPreview.mediaName || 'Shared photo'} /> : <video src={sharedMediaPreview.mediaUrl} controls autoPlay playsInline />}
          <span>{sharedMediaPreview.mediaName || (sharedMediaPreview.mediaType === 'video' ? 'Shared video' : 'Shared photo')}</span>
        </div>
      )}
      {forwardingMessage && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setForwardingMessage(null); }}>
          <form className="new-chat-modal" onSubmit={(event) => { event.preventDefault(); confirmForward(); }}>
            <div className="modal-heading"><h2>Forward message</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setForwardingMessage(null)}><X /></button></div>
            <div className="forward-message-preview">{forwardingMessage.mediaType ? (forwardingMessage.mediaType === 'photo' ? 'Photo' : 'Video') : forwardingMessage.text}</div>
            <label htmlFor="forward-recipient">Forward to username</label>
            <input id="forward-recipient" autoFocus value={forwardRecipient} onChange={(event) => setForwardRecipient(event.target.value)} placeholder="@username" />
            <p>This is a local preview. Delivery to another FNI member will be available when messaging is connected.</p>
            <button className="modal-submit" type="submit" disabled={!forwardRecipient.trim()}>Forward message</button>
          </form>
        </div>
      )}
      {newGroupOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewGroupOpen(false); }}>
          <form className="new-chat-modal" onSubmit={(event) => { event.preventDefault(); createGroup(); }}>
            <div className="modal-heading"><h2>New group</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setNewGroupOpen(false)}><X /></button></div>
            <label htmlFor="group-name">Group name</label>
            <input id="group-name" autoFocus maxLength={60} value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Enter a group name" />
            <label htmlFor="group-description">Description <span className="optional-label">Optional</span></label>
            <textarea id="group-description" maxLength={180} rows={3} value={groupDescription} onChange={(event) => setGroupDescription(event.target.value)} placeholder="What is this group about?" />
            <p>Members and invitations can be added when FNI accounts are connected.</p>
            <button className="modal-submit" type="submit" disabled={!groupName.trim()}>Create group</button>
          </form>
        </div>
      )}
      {newChatOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewChatOpen(false); }}>
          <form className="new-chat-modal" onSubmit={(event) => { event.preventDefault(); startChat(); }}>
            <div className="modal-heading"><h2>New message</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setNewChatOpen(false)}><X /></button></div>
            <label htmlFor="username">Username</label>
            <input id="username" autoFocus value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter an FNI username" />
            <p>Enter the username of the person you want to message.</p>
            <button className="modal-submit" type="submit" disabled={!username.trim()}>Continue</button>
          </form>
        </div>
      )}
    </main>
  );
}
