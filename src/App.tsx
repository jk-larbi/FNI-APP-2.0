import { useEffect, useMemo, useRef, useState } from 'react';
import { auth, api, ws, invitesClient } from '@appdeploy/client';
import {
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronLeft,
  CirclePlus,
  FileText,
  Flame,
  Hash,
  Heart,
  Image as ImageIcon,
  LogOut,
  Menu,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Play,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Users,
  Video,
  Wifi,
  X,
} from 'lucide-react';

type User = { userId: string; name?: string; email?: string; picture?: string };
type Message = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
  replyTo?: string;
};
type Room = {
  id: string;
  name: string;
  type: 'chat' | 'group' | 'channel';
  subtitle: string;
  unread: number;
  avatar: string;
  online?: boolean;
};
type Cell = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  leaderId: string;
  leaderName: string;
  moderatorIds: string[];
  memberIds: string[];
  status: 'pending_approval' | 'approved' | 'rejected';
  meetingAt?: string;
  meetingTitle?: string;
  createdAt: number;
  updatedAt: number;
};

type CellDetail = {
  cell: Cell;
  activities: Array<{ action: string; detail: string; createdAt: number }>;
  attendance: Array<{ presentCount: number; memberCount: number; meetingAt: string }>;
  growth: Array<{ memberId: string; category: string; note: string; createdAt: number }>;
  mentorship: Array<{ mentorId: string; menteeId: string; focus: string }>;
  media: Array<{ fileName: string; url: string; contentType: string }>;
  members: Array<{ userId: string; displayName: string; role: string; joinedAt: number }>;
  prayerRooms: Array<{ id: string; name: string; createdAt: number }>;
  prayerRequests: Array<{ id: string; roomId: string; authorName: string; request: string; createdAt: number; prayedCount: number; prayedByMe: boolean }>;
};

const roomsSeed: Room[] = [
  {
    id: 'general',
    name: 'FNI Community',
    type: 'channel',
    subtitle: 'Global announcements & fellowship',
    unread: 3,
    avatar: 'F',
    online: true,
  },
  {
    id: 'prayer',
    name: 'Prayer & Intercession',
    type: 'group',
    subtitle: '12 members online',
    unread: 0,
    avatar: 'P',
    online: true,
  },
  {
    id: 'agape',
    name: 'Agape Cell',
    type: 'group',
    subtitle: 'Joshua • 18 members',
    unread: 2,
    avatar: 'A',
  },
  {
    id: 'media',
    name: 'Media Team',
    type: 'group',
    subtitle: '7 members',
    unread: 0,
    avatar: 'M',
  },
  {
    id: 'saved',
    name: 'Saved Messages',
    type: 'chat',
    subtitle: 'Private cloud notes',
    unread: 0,
    avatar: '★',
  },
];

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? 'brand brand-small' : 'brand'}>
      <div className="brand-mark">
        <img
          src="/resources/fni-logo.png"
          alt=""
          onError={e => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <span>FNI</span>
      </div>
      {!small && (
        <div>
          <strong>FNI</strong>
          <small>Forerunners Network International</small>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState('general');
  const [rooms, setRooms] = useState(roomsSeed);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'chats' | 'calls' | 'cells' | 'admin'>(
    'chats'
  );
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list');
  const [showMeeting, setShowMeeting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notice, setNotice] = useState('');
  const connRef = useRef<ReturnType<typeof ws.connect> | null>(null);
  const inviteHandledRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await auth.getUser();
        setUser(u);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user || inviteHandledRef.current) return;
    const code = invitesClient.getPendingCode();
    if (!code) return;
    inviteHandledRef.current = true;
    api.post('/api/cell-invites/' + encodeURIComponent(code) + '/join', {})
      .then(() => setNotice('You have joined the cell group. Open Cells to view it.'))
      .catch(() => setNotice('This cell invitation could not be used. It may have expired or been revoked.'))
      .finally(() => invitesClient.clearPendingCode());
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const r = await api.get(
          '/api/messages?roomId=' + encodeURIComponent(activeRoom)
        );
        if (alive) setMessages(r.data.messages || []);
      } catch {
        setNotice('Could not load messages. Try again.');
      }
    })();
    if (!connRef.current) {
      const conn = ws.connect();
      connRef.current = conn;
      conn.onMessage((msg: any) => {
        if (
          msg?.type === 'entity.update' &&
          msg.payload?.entity_type === 'room_message'
        ) {
          const incoming = msg.payload.data as Message;
          if (incoming.roomId === activeRoom)
            setMessages(prev =>
              prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]
            );
        }
      });
    }
    const conn = connRef.current;
    conn?.ready.then(() => {
      if (conn.connectionId)
        api.post('/api/subscriptions', {
          entity_type: 'room_message',
          entity_id: activeRoom,
          connection_id: conn.connectionId,
        });
    });
    return () => {
      if (conn?.connectionId)
        api.post('/api/subscriptions/remove', {
          entity_type: 'room_message',
          entity_id: activeRoom,
          connection_id: conn.connectionId,
        });
    };
  }, [user, activeRoom]);

  const filteredRooms = useMemo(
    () =>
      rooms.filter(r =>
        (r.name + ' ' + r.subtitle).toLowerCase().includes(search.toLowerCase())
      ),
    [rooms, search]
  );

  async function signIn() {
    try {
      const result = await auth.signIn({
        scope: 'openid email profile offline_access',
      });
      setUser(result.user);
    } catch (err: any) {
      setNotice(
        err?.code === 'popup_blocked'
          ? 'Please allow popups to sign in.'
          : err?.code === 'popup_closed'
            ? 'Sign in cancelled.'
            : 'Sign in failed.'
      );
    }
  }
  async function sendMessage() {
    const text = draft.trim();
    if (!text || !user) return;
    setDraft('');
    try {
      const r = await api.post('/api/messages', { roomId: activeRoom, text });
      setMessages(prev => [...prev, r.data.message]);
    } catch {
      setNotice('Message failed to send.');
      setDraft(text);
    }
  }
  function selectRoom(id: string) {
    setActiveRoom(id);
    setMobilePanel('chat');
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, unread: 0 } : r)));
  }

  if (authLoading)
    return (
      <div className="splash">
        <Logo />
        <div className="loader"></div>
        <p>Preparing your fellowship space…</p>
      </div>
    );
  if (!user) return <Login onSignIn={signIn} />;

  return (
    <div className="app-shell">
      <aside
        className={mobilePanel === 'list' ? 'sidebar' : 'sidebar hide-mobile'}
      >
        <div className="sidebar-head">
          <Logo small />
          <button className="icon-btn" onClick={() => setShowProfile(true)}>
            <Menu size={20} />
          </button>
        </div>
        <div className="search">
          <Search size={17} />
          <input
            aria-label="Search chats"
            placeholder="Search chats"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-clear"
              type="button"
              aria-label="Clear chat search"
              onClick={() => setSearch('')}
            >
              <X size={15} />
            </button>
          )}
        </div>
        <nav className="tabs">
          {(
            [
              ['chats', Users, 'Chats'],
              ['calls', Phone, 'Calls'],
              ['cells', Flame, 'Cells'],
              ['admin', ShieldCheck, 'Supervision'],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
              key={id}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        {tab === 'chats' && (
          <div className="room-list">
            {filteredRooms.length === 0 ? (
              <div className="search-empty">
                <Search size={20} />
                <strong>No chats found</strong>
                <p>Try another name or clear your search.</p>
                <button type="button" onClick={() => setSearch('')}>
                  Clear search
                </button>
              </div>
            ) : filteredRooms.map(room => (
              <button
                className={'room ' + (room.id === activeRoom ? 'selected' : '')}
                key={room.id}
                onClick={() => selectRoom(room.id)}
              >
                <div className="avatar">{room.avatar}</div>
                <div className="room-copy">
                  <div>
                    <strong>{room.name}</strong>
                    <time>{room.id === 'general' ? '09:41' : 'Yesterday'}</time>
                  </div>
                  <p>{room.subtitle}</p>
                </div>
                {room.unread > 0 && <b className="badge">{room.unread}</b>}
              </button>
            ))}
          </div>
        )}
        {tab === 'calls' && <Calls onMeeting={() => setShowMeeting(true)} />}
        {tab === 'cells' && <Cells />}
        {tab === 'admin' && <Admin />}
        <div className="sidebar-foot">
          <div className="profile-mini">
            <div className="avatar avatar-img">
              {user.picture ? (
                <img src={user.picture} alt="" />
              ) : (
                <span>{(user.name || 'F').charAt(0)}</span>
              )}
            </div>
            <div>
              <strong>{user.name || 'FNI Member'}</strong>
              <small>{user.email || 'Member'}</small>
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={async () => {
              await auth.signOut();
              setUser(null);
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main
        className={
          mobilePanel === 'chat' ? 'chat-pane' : 'chat-pane hide-mobile'
        }
      >
        <header className="chat-head">
          <button
            className="back-mobile icon-btn"
            onClick={() => setMobilePanel('list')}
          >
            <ChevronLeft />
          </button>
          <div className="avatar">
            {rooms.find(r => r.id === activeRoom)?.avatar || 'F'}
          </div>
          <div className="chat-title">
            <strong>
              {rooms.find(r => r.id === activeRoom)?.name || 'FNI Community'}
            </strong>
            <span>
              {rooms.find(r => r.id === activeRoom)?.online
                ? 'online'
                : 'fellowship space'}
            </span>
          </div>
          <div className="head-actions">
            <button className="icon-btn">
              <Search size={19} />
            </button>
            <button className="icon-btn" onClick={() => setShowMeeting(true)}>
              <Video size={19} />
            </button>
            <button className="icon-btn">
              <MoreVertical size={19} />
            </button>
          </div>
        </header>

        <section className="message-area">
          <div className="day-divider">
            <span>Today</span>
          </div>
          {messages.map(m => (
            <MessageBubble key={m.id} m={m} own={m.senderId === user.userId} />
          ))}
          {messages.length === 0 && (
            <EmptyChat
              room={
                rooms.find(r => r.id === activeRoom)?.name || 'FNI Community'
              }
            />
          )}
        </section>

        <div className="composer-wrap">
          {showComposer && (
            <div className="attach-pop">
              <button>
                <ImageIcon /> Photos
              </button>
              <button>
                <FileText /> Document
              </button>
              <button>
                <Radio /> Poll
              </button>
            </div>
          )}
          <button className="icon-btn" onClick={() => setShowComposer(v => !v)}>
            <Paperclip size={20} />
          </button>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder="Message"
          />
          <button className="icon-btn">
            <Smile size={20} />
          </button>
          {draft.trim() ? (
            <button className="send-btn" onClick={sendMessage}>
              <Send size={18} />
            </button>
          ) : (
            <button
              className="send-btn"
              type="button"
              aria-label="Voice messages unavailable"
              onClick={() => setNotice('Voice messages are not available yet.')}
            >
              <Mic size={19} />
            </button>
          )}
        </div>
      </main>

      {showMeeting && <Meeting onClose={() => setShowMeeting(false)} />}
      {showProfile && (
        <Profile user={user} onClose={() => setShowProfile(false)} />
      )}
      {notice && (
        <div className="toast">
          {notice}
          <button onClick={() => setNotice('')}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function Login({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="login-screen">
      <div className="login-glow glow-a"></div>
      <div className="login-glow glow-b"></div>
      <div className="login-card">
        <Logo />
        <div className="login-art">
          <div className="cross">✦</div>
          <div className="rings"></div>
        </div>
        <h1>Gather. Grow. Go.</h1>
        <p>
          A private digital home for the Forerunners Network International
          community.
        </p>
        <button className="primary-btn" onClick={onSignIn}>
          Continue with Google
        </button>
        <button className="secondary-btn" onClick={onSignIn}>
          Continue with Apple
        </button>
        <div className="legal">
          Secure sign-in • Private community • Built for fellowship
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ m, own }: { m: Message; own: boolean }) {
  return (
    <div className={'bubble-row ' + (own ? 'own' : '')}>
      <div className="bubble">
        <span className="sender">{own ? 'You' : m.senderName}</span>
        <p>{m.text}</p>
        <small>
          {new Date(m.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          <Check size={12} />
        </small>
      </div>
    </div>
  );
}

function EmptyChat({ room }: { room: string }) {
  return (
    <div className="empty-chat">
      <div className="empty-icon">
        <Heart />
      </div>
      <h3>Welcome to {room}</h3>
      <p>Messages, prayer, fellowship and announcements will appear here.</p>
    </div>
  );
}

function Calls({ onMeeting }: { onMeeting: () => void }) {
  return (
    <div className="panel-content">
      <div className="section-title">
        <span>Live fellowship</span>
        <button className="small-primary" onClick={onMeeting}>
          <Plus size={15} /> Start
        </button>
      </div>
      <div className="call-card live">
        <div className="call-icon">
          <Video />
        </div>
        <div>
          <strong>Sunday Fellowship</strong>
          <p>Live now • 84 participants</p>
        </div>
        <button onClick={onMeeting}>Join</button>
      </div>
      <div className="call-card">
        <div className="call-icon">
          <CalendarDays />
        </div>
        <div>
          <strong>Cell Leaders Meeting</strong>
          <p>Tomorrow • 7:00 PM</p>
        </div>
        <button>Remind</button>
      </div>
    </div>
  );
}

function Cells() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selected, setSelected] = useState<CellDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('Cell fellowship');
  const [meetingAt, setMeetingAt] = useState('');
  const [growthCategory, setGrowthCategory] = useState('Discipleship');
  const [growthNote, setGrowthNote] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [menteeId, setMenteeId] = useState('');
  const [mentorshipFocus, setMentorshipFocus] = useState('');
  const [moderatorIds, setModeratorIds] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [prayerRoomName, setPrayerRoomName] = useState('');
  const [activePrayerRoom, setActivePrayerRoom] = useState('');
  const [prayerDraft, setPrayerDraft] = useState('');

  async function resultForPrayerRooms(id: string) {
    try {
      const result = await api.get('/api/cells/' + encodeURIComponent(id) + '/prayer-rooms');
      return result.data;
    } catch {
      return { rooms: [], requests: [] };
    }
  }

  async function loadCells() {
    setLoading(true);
    try {
      const result = await api.get('/api/cells');
      setCells(result.data.cells || []);
    } catch {
      setMessage('Could not load cell groups. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function openCell(id: string) {
    setBusy(true);
    try {
      const [result, memberResult, prayerResult] = await Promise.all([
        api.get('/api/cells/' + encodeURIComponent(id)),
        api.get('/api/cells/' + encodeURIComponent(id) + '/members'),
        resultForPrayerRooms(id),
      ]);
      setSelected({
        ...result.data,
        members: memberResult.data.members || [],
        prayerRooms: prayerResult.rooms || [],
        prayerRequests: prayerResult.requests || [],
      });
      setModeratorIds((result.data.cell.moderatorIds || []).join(', '));
      setMessage('');
    } catch {
      setMessage('Could not open this group. Check your access and try again.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { loadCells(); }, []);

  async function createCell(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await api.post('/api/cells', { name, description });
      setName('');
      setDescription('');
      setShowCreate(false);
      setMessage(result.data.message || 'Group submitted for approval.');
      await loadCells();
      if (result.data.cell?.id) await openCell(result.data.cell.id);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Could not create group. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function saveDetails() {
    if (!selected) return;
    setBusy(true);
    try {
      await api.put('/api/cells/' + selected.cell.id, {
        moderatorIds: moderatorIds.split(',').map(x => x.trim()).filter(Boolean),
      });
      await openCell(selected.cell.id);
      setMessage('Group details saved.');
    } catch {
      setMessage('Could not save group details.');
    } finally {
      setBusy(false);
    }
  }

  async function scheduleMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await api.post('/api/cells/' + selected.cell.id + '/schedule', {
        title: meetingTitle,
        meetingAt: new Date(meetingAt).toISOString(),
      });
      await openCell(selected.cell.id);
      setMessage('Meeting schedule saved. Group members and leaders have been notified where push is enabled.');
    } catch {
      setMessage('Could not schedule meeting. Choose a future date and time.');
    } finally {
      setBusy(false);
    }
  }

  async function startMeeting() {
    if (!selected) return;
    setBusy(true);
    try {
      await api.post('/api/cells/' + selected.cell.id + '/start-meeting', {});
      await openCell(selected.cell.id);
      setMessage('Meeting start was recorded and push notifications were requested for group members.');
    } catch {
      setMessage('Could not start meeting. Only group leaders and moderators can do this.');
    } finally {
      setBusy(false);
    }
  }

  async function recordAttendance() {
    if (!selected) return;
    setBusy(true);
    try {
      await api.post('/api/cells/' + selected.cell.id + '/attendance', {
        presentUserIds: [selected.cell.creatorId],
        notes: 'Attendance submitted from the cell group panel.',
      });
      await openCell(selected.cell.id);
      setMessage('Attendance record saved.');
    } catch {
      setMessage('Attendance could not be saved. You need leader or moderator access.');
    } finally {
      setBusy(false);
    }
  }

  async function addGrowth(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await api.post('/api/cells/' + selected.cell.id + '/growth', {
        memberId: selected.cell.creatorId,
        category: growthCategory,
        note: growthNote,
      });
      setGrowthNote('');
      await openCell(selected.cell.id);
      setMessage('Spiritual growth update saved.');
    } catch {
      setMessage('Could not save growth update. The group must be approved first.');
    } finally {
      setBusy(false);
    }
  }

  async function addMentorship(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await api.post('/api/cells/' + selected.cell.id + '/mentorship', {
        mentorId, menteeId, focus: mentorshipFocus,
      });
      setMentorId('');
      setMenteeId('');
      setMentorshipFocus('');
      await openCell(selected.cell.id);
      setMessage('Mentorship pairing saved.');
    } catch {
      setMessage('Could not save pairing. Both IDs must belong to members of this cell.');
    } finally {
      setBusy(false);
    }
  }

  async function createInvite() {
    if (!selected) return;
    setBusy(true);
    try {
      const result = await api.post('/api/cells/' + selected.cell.id + '/invites', {});
      const url = invitesClient.buildJoinUrl(result.data.code, { path: '/' });
      setInviteUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setMessage('Invitation link created and copied. It expires in seven days.');
      } catch {
        setMessage('Invitation link created. Copy the link shown below to share it.');
      }
    } catch {
      setMessage('Could not create an invitation. Only leaders and moderators of approved groups can invite.');
    } finally {
      setBusy(false);
    }
  }

  async function createPrayerRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await api.post('/api/cells/' + selected.cell.id + '/prayer-rooms', { name: prayerRoomName });
      setPrayerRoomName('');
      await openCell(selected.cell.id);
      setMessage('Prayer room created. Cell members have been notified.');
    } catch {
      setMessage('Could not create prayer room. The group must be approved and you must be a member.');
    } finally {
      setBusy(false);
    }
  }

  async function submitPrayerRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !activePrayerRoom) return;
    setBusy(true);
    try {
      await api.post('/api/cells/' + selected.cell.id + '/prayer-rooms/' + activePrayerRoom + '/requests', { request: prayerDraft });
      setPrayerDraft('');
      await openCell(selected.cell.id);
      setMessage('Prayer request shared with your cell.');
    } catch {
      setMessage('Could not share prayer request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function markPrayed(requestId: string) {
    if (!selected) return;
    try {
      await api.post('/api/cells/' + selected.cell.id + '/prayer-requests/' + requestId + '/pray', {});
      await openCell(selected.cell.id);
    } catch {
      setMessage('Could not record your prayer response.');
    }
  }

  async function uploadMedia(file?: File) {
    if (!selected || !file) return;
    setBusy(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await api.post('/api/cells/' + selected.cell.id + '/media', {
        fileName: file.name,
        contentType: file.type,
        base64,
      });
      await openCell(selected.cell.id);
      setMessage('Media uploaded to this group.');
    } catch {
      setMessage('Media upload failed. Supported formats are images, MP4/WebM video and PDF.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel-content cell-system">
      <div className="section-title">
        <span>Cell groups</span>
        <button className="small-primary" onClick={() => { setSelected(null); setShowCreate(v => !v); }}>
          <CirclePlus size={15} /> Create
        </button>
      </div>
      {message && <div className="cell-notice" role="status">{message}</div>}
      {showCreate && (
        <form className="cell-form" onSubmit={createCell}>
          <strong>Create a cell group</strong>
          <input required minLength={3} maxLength={90} placeholder="Group name" value={name} onChange={e => setName(e.target.value)} />
          <textarea maxLength={700} placeholder="Group description and purpose" value={description} onChange={e => setDescription(e.target.value)} />
          <button className="small-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Submit for approval'}</button>
        </form>
      )}
      {loading ? <p className="cell-muted">Loading your cell groups…</p> : cells.length === 0 ? (
        <div className="cell-empty"><Users size={25} /><strong>No cell groups yet</strong><p>Create a group to begin. Groups are private to their creator until approved.</p></div>
      ) : cells.map(cell => (
        <button className={'cell-card cell-card-button ' + (selected?.cell.id === cell.id ? 'cell-card-selected' : '')} key={cell.id} onClick={() => openCell(cell.id)}>
          <div className="cell-avatar"><Users /></div>
          <div className="cell-card-copy">
            <strong>{cell.name}</strong>
            <p>{cell.leaderName} · {cell.memberIds?.length || 0} members</p>
            <small>{cell.meetingAt ? new Date(cell.meetingAt).toLocaleString() : 'No meeting scheduled'}</small>
          </div>
          <span className={'cell-status ' + cell.status}>{cell.status.replaceAll('_', ' ')}</span>
        </button>
      ))}
      {selected && (
        <div className="cell-detail">
          <div className="cell-detail-head">
            <div><strong>{selected.cell.name}</strong><p>{selected.cell.description || 'No description added.'}</p></div>
            <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close group details"><X size={17} /></button>
          </div>
          <div className="cell-detail-meta">
            <span>{selected.cell.memberIds.length} members</span>
            <span>{selected.cell.status.replaceAll('_', ' ')}</span>
          </div>
          <div className="cell-form">
            <div className="cell-row-between"><strong>Members ({selected.members.length})</strong><button className="small-primary" disabled={busy || selected.cell.status !== 'approved'} onClick={createInvite}>Invite members</button></div>
            {inviteUrl && <div className="cell-invite-link"><input readOnly value={inviteUrl} onFocus={e => e.currentTarget.select()} /><button onClick={() => navigator.clipboard.writeText(inviteUrl)}>Copy</button></div>}
            {selected.members.length === 0 ? <p className="cell-muted">No member records yet.</p> : selected.members.map(member => <div className="cell-member-row" key={member.userId}><span className="cell-member-avatar">{(member.displayName || 'F').charAt(0)}</span><span><strong>{member.displayName}</strong><small>{member.role}</small></span></div>)}
          </div>
          <div className="cell-form">
            <strong>Prayer rooms</strong>
            <form onSubmit={createPrayerRoom}>
              <input required minLength={3} maxLength={80} placeholder="Prayer room name" value={prayerRoomName} onChange={e => setPrayerRoomName(e.target.value)} />
              <button className="small-primary" disabled={busy || selected.cell.status !== 'approved'}>Create prayer room</button>
            </form>
            {selected.prayerRooms.map(room => <button className={'cell-prayer-room ' + (activePrayerRoom === room.id ? 'active' : '')} key={room.id} onClick={() => setActivePrayerRoom(room.id)}><Heart size={14} /> {room.name}</button>)}
            {activePrayerRoom && selected.prayerRooms.some(room => room.id === activePrayerRoom) && <>
              <form onSubmit={submitPrayerRequest}>
                <textarea required minLength={5} maxLength={1000} placeholder="Share a prayer request with this cell…" value={prayerDraft} onChange={e => setPrayerDraft(e.target.value)} />
                <button className="small-primary" disabled={busy}>Share prayer request</button>
              </form>
              {selected.prayerRequests.filter(request => request.roomId === activePrayerRoom).map(request => <div className="cell-prayer-request" key={request.id}><strong>{request.authorName}</strong><p>{request.request}</p><button disabled={request.prayedByMe} onClick={() => markPrayed(request.id)}><Heart size={13} /> {request.prayedByMe ? 'You prayed' : 'I prayed'} · {request.prayedCount}</button></div>)}
            </>}
          </div>
          {selected.cell.status !== 'approved' && <p className="cell-pending">This group is awaiting approval. Group-wide scheduling, attendance, media and development tools become available after approval.</p>}
          <div className="cell-form">
            <strong>Moderators</strong>
            <p className="cell-muted">Enter existing member user IDs, separated by commas. A member directory/invite flow is a separate next step.</p>
            <input placeholder="Member user IDs, comma separated" value={moderatorIds} onChange={e => setModeratorIds(e.target.value)} />
            <button className="small-primary" disabled={busy || selected.cell.status !== 'approved'} onClick={saveDetails}>Save moderators</button>
          </div>
          <div className="cell-form">
            <strong>Schedule a meeting</strong>
            <form onSubmit={scheduleMeeting}>
              <input required placeholder="Meeting title" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} />
              <input required type="datetime-local" value={meetingAt} onChange={e => setMeetingAt(e.target.value)} />
              <button className="small-primary" disabled={busy || selected.cell.status !== 'approved'}>Save schedule</button>
            </form>
            {selected.cell.meetingAt && <p className="cell-muted">Next: {selected.cell.meetingTitle} · {new Date(selected.cell.meetingAt).toLocaleString()}</p>}
          </div>
          <div className="cell-tools-grid">
            <button disabled={busy || selected.cell.status !== 'approved'} onClick={recordAttendance}><Check size={15} /> Record my attendance</button>
            <button disabled={busy || selected.cell.status !== 'approved'} onClick={startMeeting}><Video size={15} /> Start meeting alerts</button>
            <label className="cell-upload"><ImageIcon size={15} /> Share media<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,application/pdf" onChange={e => uploadMedia(e.target.files?.[0])} disabled={busy || selected.cell.status !== 'approved'} /></label>
          </div>
          <div className="cell-form">
            <strong>Spiritual growth tracking</strong>
            <form onSubmit={addGrowth}>
              <select value={growthCategory} onChange={e => setGrowthCategory(e.target.value)}>
                <option>Discipleship</option><option>Prayer life</option><option>Scripture study</option><option>Evangelism</option><option>Service</option><option>Pastoral care</option>
              </select>
              <textarea placeholder="Development note / next step" value={growthNote} onChange={e => setGrowthNote(e.target.value)} />
              <button className="small-primary" disabled={busy || selected.cell.status !== 'approved'}>Save growth update</button>
            </form>
            {selected.growth.map((item, i) => <p className="cell-record" key={i}>{item.category}: {item.note}</p>)}
          </div>
          <div className="cell-form">
            <strong>Mentorship structure</strong>
            <form onSubmit={addMentorship}>
              <input required placeholder="Mentor member ID" value={mentorId} onChange={e => setMentorId(e.target.value)} />
              <input required placeholder="Mentee member ID" value={menteeId} onChange={e => setMenteeId(e.target.value)} />
              <input placeholder="Mentorship focus" value={mentorshipFocus} onChange={e => setMentorshipFocus(e.target.value)} />
              <button className="small-primary" disabled={busy || selected.cell.status !== 'approved'}>Assign mentor</button>
            </form>
            {selected.mentorship.map((item, i) => <p className="cell-record" key={i}>Mentor {item.mentorId} → Mentee {item.menteeId}{item.focus ? ' · ' + item.focus : ''}</p>)}
          </div>
          <div className="cell-form">
            <strong>Attendance & group activity</strong>
            {selected.attendance.length === 0 && selected.activities.length === 0 && <p className="cell-muted">No attendance or activity records yet.</p>}
            {selected.attendance.map((item, i) => <p className="cell-record" key={i}>{new Date(item.meetingAt).toLocaleDateString()}: {item.presentCount}/{item.memberCount} present</p>)}
            {selected.activities.slice(-8).reverse().map((item, i) => <p className="cell-record" key={i}>{item.action.replaceAll('_', ' ')} · {item.detail}</p>)}
          </div>
          <div className="cell-form">
            <strong>Shared media</strong>
            {selected.media.length === 0 ? <p className="cell-muted">No media shared yet.</p> : selected.media.map((item, i) => <a className="cell-record" href={item.url} target="_blank" rel="noreferrer" key={i}>{item.fileName}</a>)}
          </div>
        </div>
      )}
    </div>
  );
}
function Admin() {
  return (
    <div className="panel-content">
      <div className="super-card">
        <ShieldCheck />
        <div>
          <strong>Man of God supervision</strong>
          <p>Global oversight is enabled for authorized leaders.</p>
        </div>
      </div>
      <div className="stat-grid">
        <div>
          <strong>12</strong>
          <span>Active cells</span>
        </div>
        <div>
          <strong>4</strong>
          <span>Live rooms</span>
        </div>
        <div>
          <strong>386</strong>
          <span>Members</span>
        </div>
        <div>
          <strong>7</strong>
          <span>Pending</span>
        </div>
      </div>
      <div className="admin-list">
        <div>
          <span>New Life Cell</span>
          <b>Approval needed</b>
        </div>
        <div>
          <span>Sunday Fellowship</span>
          <b>Live • 84</b>
        </div>
        <div>
          <span>Moderation queue</span>
          <b>0 urgent</b>
        </div>
      </div>
    </div>
  );
}

function Meeting({ onClose }: { onClose: () => void }) {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(false);
  return (
    <div className="meeting-overlay">
      <div className="meeting-shell">
        <header>
          <Logo small />
          <div>
            <span className="live-dot"></span> LIVE FELLOWSHIP
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="meeting-stage">
          <div className="stage-message">
            <div className="stage-avatar">FNI</div>
            <h2>Sunday Fellowship</h2>
            <p>Waiting for other participants to join</p>
            <div className="meeting-code">Room • FNI-2026-091</div>
          </div>
          <div className="participant-tile">
            <div className="avatar">J</div>
            <span>You</span>
          </div>
        </div>
        <div className="meeting-controls">
          <button
            className={mic ? 'control active' : 'control'}
            onClick={() => setMic(v => !v)}
          >
            <Mic />
          </button>
          <button
            className={cam ? 'control active' : 'control'}
            onClick={() => setCam(v => !v)}
          >
            <Video />
          </button>
          <button className="control">
            <Smile />
          </button>
          <button className="control">
            <Users />
          </button>
          <button className="control">
            <Share2Icon />
          </button>
          <button className="end-call" onClick={onClose}>
            End
          </button>
        </div>
      </div>
    </div>
  );
}

function Share2Icon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

function Profile({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <button className="close-panel" onClick={onClose}>
          <X />
        </button>
        <div className="profile-hero">
          <div className="profile-avatar">
            {user.picture ? (
              <img src={user.picture} alt="" />
            ) : (
              (user.name || 'F').charAt(0)
            )}
          </div>
          <h2>{user.name || 'FNI Member'}</h2>
          <p>{user.email}</p>
        </div>
        <div className="settings-list">
          <button>
            <Bell /> Notifications <span>›</span>
          </button>
          <button>
            <Bookmark /> Saved Messages <span>›</span>
          </button>
          <button>
            <Settings /> Privacy & Security <span>›</span>
          </button>
          <button>
            <Wifi /> Devices & Sessions <span>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
