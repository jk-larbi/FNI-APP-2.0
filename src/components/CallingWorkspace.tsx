import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, AudioLines, CalendarClock, Camera, CameraOff, ChevronDown, Copy,
  Headphones, History, Link2, Lock, Mic, MicOff, MonitorUp, Phone, PhoneCall,
  PhoneIncoming, PhoneMissed, PhoneOff, Plus, Settings2, ShieldCheck, Speaker,
  Users, Video, Volume2, X
} from 'lucide-react';

type CallKind = 'Voice' | 'Video' | 'Group voice' | 'Group video';
type CallRecord = { id: string; title: string; kind: CallKind; date: string; duration: number; outcome: 'Completed' | 'Missed' | 'Declined' };
type Meeting = { id: string; title: string; description: string; startsAt: string; code: string; createdAt: string; status: 'Scheduled' | 'Live' | 'Ended'; waitingRoom: boolean };

const CALLS_KEY = 'fni-call-history';
const MEETINGS_KEY = 'fni-meeting-rooms';
const PRIVACY_KEY = 'fni-call-preferences';

function readLocal<T,>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
function makeCode() { return Array.from(crypto.getRandomValues(new Uint8Array(6)), n => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n % 32]).join('').match(/.{1,3}/g)?.join('-') ?? 'FNI-ROOM'; }

type Props = { initialGroup?: string; onClearInitialGroup?: () => void; isVisible?: boolean; onNavigateToCalls?: () => void };

export default function CallingWorkspace({ initialGroup = '', onClearInitialGroup, isVisible = true, onNavigateToCalls }: Props) {
  const [tab, setTab] = useState<'calls' | 'rooms' | 'privacy'>('calls');
  const [callKind, setCallKind] = useState<CallKind>('Voice');
  const [callTarget, setCallTarget] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callMinimized, setCallMinimized] = useState(false);
  const [incomingPreview, setIncomingPreview] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'Front' | 'Rear'>('Front');
  const [inviteMemberDraft, setInviteMemberDraft] = useState('');
  const [invitedCallMembers, setInvitedCallMembers] = useState<string[]>([]);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [audioOutput, setAudioOutput] = useState('Default device');
  const [callNotice, setCallNotice] = useState('');
  const [history, setHistory] = useState<CallRecord[]>(() => readLocal(CALLS_KEY, []));
  const [meetings, setMeetings] = useState<Meeting[]>(() => readLocal(MEETINGS_KEY, []));
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [activeMeetingId, setActiveMeetingId] = useState('');
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowParticipantMute, setAllowParticipantMute] = useState(true);
  const [allowAdmission, setAllowAdmission] = useState(true);
  const [whoCanCall, setWhoCanCall] = useState('FNI members');
  const [whoCanAdd, setWhoCanAdd] = useState('My contacts');
  const [callNotifications, setCallNotifications] = useState(true);
  const [meetingNotifications, setMeetingNotifications] = useState(true);
  const [devicePermission, setDevicePermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const callInterval = useRef<number | undefined>(undefined);
  const activeMeeting = meetings.find(m => m.id === activeMeetingId);

  useEffect(() => { localStorage.setItem(CALLS_KEY, JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => {
    const prefs = readLocal(PRIVACY_KEY, null as null | Record<string, string | boolean>);
    if (prefs) {
      if (typeof prefs.whoCanCall === 'string') setWhoCanCall(prefs.whoCanCall);
      if (typeof prefs.whoCanAdd === 'string') setWhoCanAdd(prefs.whoCanAdd);
      if (typeof prefs.callNotifications === 'boolean') setCallNotifications(prefs.callNotifications);
      if (typeof prefs.meetingNotifications === 'boolean') setMeetingNotifications(prefs.meetingNotifications);
    }
  }, []);
  useEffect(() => {
    if (!callActive) return;
    callInterval.current = window.setInterval(() => setDuration(Math.max(0, Math.floor((Date.now() - callStartedAt) / 1000))), 1000);
    return () => { if (callInterval.current) window.clearInterval(callInterval.current); };
  }, [callActive, callStartedAt]);
  useEffect(() => {
    if (!initialGroup) return;
    setCallTarget(initialGroup);
    setCallKind('Group voice');
    setTab('calls');
    setCallNotice(`Group call setup opened for “${initialGroup}”. Choose voice or video to continue.`);
    onClearInitialGroup?.();
  }, [initialGroup, onClearInitialGroup]);

  const liveMeetings = useMemo(() => meetings.filter(m => m.status !== 'Ended'), [meetings]);
  const savePrivacy = (patch: Record<string, string | boolean>) => {
    const next = { whoCanCall, whoCanAdd, callNotifications, meetingNotifications, ...patch };
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
  };

  const checkDevices = async (videoNeeded: boolean) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setDevicePermission('denied');
      setCallNotice('This browser does not support camera and microphone access.');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: videoNeeded });
      stream.getTracks().forEach(track => track.stop());
      setDevicePermission('granted');
      return true;
    } catch {
      setDevicePermission('denied');
      setCallNotice('Device permission was not granted. You can still review the call controls, but media cannot start.');
      return false;
    }
  };

  const startCall = async (kind: CallKind, target: string) => {
    await checkDevices(kind.toLowerCase().includes('video'));
    setCallKind(kind);
    setCallTarget(target.trim() || (kind.startsWith('Group') ? 'FNI group' : 'FNI member'));
    setMuted(false); setCameraOn(kind.toLowerCase().includes('video')); setCameraFacing('Front'); setSpeakerOn(false);
    setDuration(0); setCallStartedAt(Date.now()); setCallMinimized(false); setIncomingPreview(false); setCallActive(true);
  };
  const endCall = (outcome: CallRecord['outcome'] = 'Completed') => {
    setHistory(items => [{ id: crypto.randomUUID(), title: callTarget || 'FNI member', kind: callKind, date: new Date().toISOString(), duration, outcome }, ...items]);
    setCallActive(false); setCallMinimized(false); setDuration(0);
  };
  const createMeeting = () => {
    if (!meetingTitle.trim() || !meetingDate) { setCallNotice('Add a meeting title and start time.'); return; }
    const room: Meeting = { id: crypto.randomUUID(), title: meetingTitle.trim(), description: meetingDescription.trim(), startsAt: meetingDate, code: makeCode(), createdAt: new Date().toISOString(), status: 'Scheduled', waitingRoom };
    setMeetings(items => [room, ...items]); setMeetingTitle(''); setMeetingDescription(''); setMeetingDate(''); setShowCreate(false); setCallNotice('Meeting room saved on this device. Invitations and notifications are not sent yet.');
  };
  const enterMeeting = (meeting: Meeting) => {
    setActiveMeetingId(meeting.id); setTab('rooms'); setCallNotice('You are viewing a local meeting-room preview. Other members cannot join until FNI signalling is connected.');
  };
  const updateMeeting = (id: string, patch: Partial<Meeting>) => setMeetings(items => items.map(m => m.id === id ? { ...m, ...patch } : m));
  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); setCallNotice('Room code copied. It can only be used by this browser preview until the backend is connected.'); }
    catch { setCallNotice('Room code: ' + code); }
  };
  const joinByCode = () => {
    const meeting = meetings.find(m => m.code.toLowerCase() === joinCode.trim().toUpperCase());
    if (!meeting) { setCallNotice('That room is not available in this browser. Joining shared rooms requires FNI accounts and backend services.'); return; }
    setShowJoin(false); setJoinCode(''); enterMeeting(meeting);
  };

  if (!isVisible && !callActive) return null;
  if (!isVisible && callActive) return <div className="fni-floating-call"><div className="mini-call-avatar">{callKind.startsWith('Group')?<Users size={18}/>:<Phone size={18}/>}</div><div className="mini-call-copy"><b>{callTarget}</b><span>{callKind} · {formatDuration(duration)} · Call in progress</span></div><button className="call-secondary" onClick={onNavigateToCalls}>Return to call</button><button className="call-end-button" onClick={() => endCall()} aria-label="End call"><PhoneOff size={16}/></button></div>;

  if (incomingPreview) return <div className="calling-workspace incoming-call-view">
    <div className="incoming-call-card"><span className="call-kicker">INCOMING CALL · UI PREVIEW</span><div className="call-person-avatar">{(callTarget.trim()[0] || 'F').toUpperCase()}</div><h2>{callTarget.trim() || 'FNI member'}</h2><p>Incoming voice call preview</p><div className="incoming-call-actions"><button className="call-end-button" onClick={() => {setHistory(items => [{id:crypto.randomUUID(),title:callTarget.trim() || 'FNI member',kind:'Voice',date:new Date().toISOString(),duration:0,outcome:'Missed'},...items]);setIncomingPreview(false);setCallNotice('Incoming-call preview declined and recorded as missed on this device.')}}><PhoneOff size={18}/> Decline</button><button className="call-primary" onClick={() => startCall('Voice',callTarget)}><Phone size={18}/> Accept</button></div><small>This is a local interface test, not a real incoming call.</small></div>
  </div>;

  if (callActive && callMinimized) return <div className="calling-workspace mini-call-view"><div className="mini-call-card"><div className="mini-call-avatar">{callKind.startsWith('Group')?<Users size={18}/>:<Phone size={18}/>}</div><div className="mini-call-copy"><b>{callTarget}</b><span>{callKind} · {formatDuration(duration)} · Preview</span></div><button className="call-secondary" onClick={() => setCallMinimized(false)}>Return to call</button><button className="call-end-button" onClick={() => endCall()}><PhoneOff size={16}/> End</button></div><p>Mini-call preview stays visible inside Calls & meetings. System-wide picture-in-picture and background calling require native support.</p></div>;

  if (callActive) return <div className="calling-workspace call-active-view">
    <div className="call-stage-top"><button className="call-back" onClick={() => setCallNotice('End the preview call before returning to the calling dashboard.')}><ArrowLeft size={17}/> Calling</button><div className="call-stage-top-actions"><button className="call-secondary" onClick={() => setCallMinimized(true)}>Minimize</button><span className="call-preview-pill">FRONTEND PREVIEW</span></div></div>
    <div className={callKind.toLowerCase().includes('video') ? 'call-stage video-stage' : 'call-stage voice-stage'}>
      {callKind.toLowerCase().includes('video') && cameraOn ? <div className="call-video-placeholder"><Camera size={36}/><span>Your camera preview will appear when live media is connected.</span></div> : <div className="call-person-avatar">{callKind.startsWith('Group') ? <Users size={36}/> : (callTarget.trim()[0] || 'F').toUpperCase()}</div>}
      <div className="call-person-details"><h2>{callTarget}</h2><p>{callKind} · Preview call</p><strong>{formatDuration(duration)}</strong></div>
      {callKind.startsWith('Group') && <div className="call-group-invite-preview"><div className="call-participant-note"><Users size={16}/> Participants and active speakers will appear when group calling is connected.</div><div className="call-inline-entry"><input value={inviteMemberDraft} onChange={e=>setInviteMemberDraft(e.target.value)} placeholder="Invite member by @username" aria-label="Invite group member"/><button className="call-secondary" onClick={()=>{const name=inviteMemberDraft.trim().replace(/^@/,'');if(name&&!invitedCallMembers.includes(name)){setInvitedCallMembers(v=>[...v,name]);setInviteMemberDraft('');setCallNotice('Invite prepared locally. No notification was sent.')}}}><Plus size={15}/> Add</button></div>{invitedCallMembers.map(name=><span className="call-invite-chip" key={name}>@{name} · pending backend</span>)}</div>}
    </div>
    <div className="call-controls">
      <button className={muted ? 'call-control selected' : 'call-control'} onClick={() => setMuted(v => !v)}><span>{muted ? <MicOff/> : <Mic/>}</span>{muted ? 'Unmute' : 'Mute'}</button>
      {callKind.toLowerCase().includes('video') && <><button className={cameraOn ? 'call-control' : 'call-control selected'} onClick={() => setCameraOn(v => !v)}><span>{cameraOn ? <Camera/> : <CameraOff/>}</span>{cameraOn ? 'Camera off' : 'Camera on'}</button><button className="call-control" onClick={() => setCameraFacing(v=>v==='Front'?'Rear':'Front')}><span><Camera/></span>{cameraFacing} camera</button></>}
      <button className={speakerOn ? 'call-control selected' : 'call-control'} onClick={() => setSpeakerOn(v => !v)}><span>{speakerOn ? <Volume2/> : <Speaker/>}</span>{speakerOn ? 'Speaker on' : 'Speaker'}</button>
      <label className="call-output-select"><Headphones size={16}/><select aria-label="Audio output" value={audioOutput} onChange={e => setAudioOutput(e.target.value)}><option>Default device</option><option>Speaker</option><option>Earpiece</option><option>Bluetooth device (if supported)</option></select></label>
      <button className="call-end-button" onClick={() => endCall()}><PhoneOff size={20}/> End call</button>
    </div>
    <p className="call-stage-disclaimer">No remote participant is connected. This timer and these controls demonstrate the interface only.</p>
    {callNotice && <div className="call-notice" role="status">{callNotice}<button onClick={() => setCallNotice('')}><X size={14}/></button></div>}
  </div>;

  if (activeMeeting) return <div className="calling-workspace meeting-room-view">
    <div className="call-stage-top"><button className="call-back" onClick={() => setActiveMeetingId('')}><ArrowLeft size={17}/> All meetings</button><span className="call-preview-pill">ROOM PREVIEW</span></div>
    <div className="meeting-room-heading"><div><span className="call-kicker">FNI MEETING ROOM</span><h2>{activeMeeting.title}</h2><p>{activeMeeting.description || 'No meeting description provided.'}</p></div><span className={activeMeeting.status === 'Live' ? 'meeting-status live' : 'meeting-status'}>{activeMeeting.status}</span></div>
    <div className="meeting-room-grid">
      <section className="meeting-stage-panel"><div className="meeting-empty-stage"><Video size={36}/><strong>Meeting room is ready</strong><span>Participant video tiles appear when real-time media is connected.</span></div><div className="meeting-stage-actions"><button className="call-secondary" onClick={() => setCallNotice('Screen sharing requires a supported browser and an active WebRTC meeting connection.')}><MonitorUp size={16}/> Share screen</button><button className="call-secondary" onClick={() => setCallNotice(allowChat ? 'Meeting chat is a backend feature and is not connected in this preview.' : 'Meeting chat is disabled by the host setting.')}><MessageCircleIcon/> Meeting chat</button></div></section>
      <aside className="meeting-side-panel"><h3>Room information</h3><div className="meeting-code-row"><div><small>ROOM CODE</small><b>{activeMeeting.code}</b></div><button onClick={() => copyCode(activeMeeting.code)} aria-label="Copy room code"><Copy size={16}/></button></div><div className="meeting-meta-row"><CalendarClock size={16}/><span>{new Date(activeMeeting.startsAt).toLocaleString()}</span></div><div className="meeting-meta-row"><Users size={16}/><span>Host: You · Participant list unavailable</span></div><div className="meeting-host-controls"><h4>Host controls</h4><label><input type="checkbox" checked={activeMeeting.waitingRoom} onChange={e => updateMeeting(activeMeeting.id,{waitingRoom:e.target.checked})}/> Enable waiting room</label><label><input type="checkbox" checked={allowScreenShare} onChange={e => setAllowScreenShare(e.target.checked)}/> Allow screen sharing</label><label><input type="checkbox" checked={allowChat} onChange={e => setAllowChat(e.target.checked)}/> Allow meeting chat</label><label><input type="checkbox" checked={allowAdmission} onChange={e => setAllowAdmission(e.target.checked)}/> Allow host to admit waiting participants</label><label><input type="checkbox" checked={allowParticipantMute} onChange={e => setAllowParticipantMute(e.target.checked)}/> Allow host to mute participants</label><p>Co-host assignment, participant admission and moderation permissions are configured as preview controls; they take effect after backend participant management is connected.</p></div></aside>
    </div>
    <div className="meeting-room-footer"><button className="call-secondary" onClick={() => setActiveMeetingId('')}>Leave preview</button>{activeMeeting.status !== 'Live' ? <button className="call-primary" onClick={() => {updateMeeting(activeMeeting.id,{status:'Live'});setCallNotice('Room marked live in this browser only. No members have been notified.')}}><Video size={16}/> Start meeting</button> : <button className="call-end-button" onClick={() => {updateMeeting(activeMeeting.id,{status:'Ended'});setActiveMeetingId('')}}><PhoneOff size={17}/> End for everyone</button>}</div>
    {callNotice && <div className="call-notice" role="status">{callNotice}<button onClick={() => setCallNotice('')}><X size={14}/></button></div>}
  </div>;

  return <div className="calling-workspace">
    <div className="calling-heading"><div><span className="call-kicker">FNI CONNECT</span><h2>Calls & meetings</h2><p>Personal calls, group conversations and ministry meeting rooms in one place.</p></div><div className="calling-heading-actions"><button className="call-secondary" onClick={() => {setShowJoin(v => !v);setShowCreate(false)}}><Link2 size={16}/> Join with code</button><button className="call-primary" onClick={() => {setShowCreate(v => !v);setShowJoin(false)}}><Plus size={16}/> Create meeting</button></div></div>
    <div className="calling-tabs" role="tablist" aria-label="Calling sections">
      <button className={tab==='calls'?'active':''} onClick={() => setTab('calls')}><Phone size={16}/> Calls</button>
      <button className={tab==='rooms'?'active':''} onClick={() => setTab('rooms')}><Video size={16}/> Meeting rooms</button>
      <button className={tab==='privacy'?'active':''} onClick={() => setTab('privacy')}><ShieldCheck size={16}/> Privacy & devices</button>
    </div>
    {showJoin && <section className="call-inline-panel"><div><h3>Join a meeting</h3><p>Enter an FNI room code or invitation code.</p></div><div className="call-inline-entry"><input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="ABC-123" aria-label="Meeting room code"/><button className="call-primary" onClick={joinByCode}>Join room</button></div></section>}
    {showCreate && <section className="call-inline-panel call-create-panel"><div><h3>Create a meeting room</h3><p>Schedule a room and configure its basic host settings.</p></div><div className="call-create-fields"><label>Meeting title<input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="e.g. FNI Prayer Meeting" maxLength={80}/></label><label>Description<textarea value={meetingDescription} onChange={e => setMeetingDescription(e.target.value)} placeholder="What is this meeting about?" rows={2}/></label><label>Date and time<input type="datetime-local" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}/></label><label className="call-check"><input type="checkbox" checked={waitingRoom} onChange={e => setWaitingRoom(e.target.checked)}/> Enable waiting room</label><div className="call-form-actions"><button className="call-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="call-primary" onClick={createMeeting}>Create room</button></div></div></section>}
    {tab === 'calls' && <div className="calling-content-grid">
      <section className="call-panel call-start-panel"><div className="call-panel-title"><div><h3>Start a personal call</h3><p>Call an FNI member from their conversation or by username.</p></div><PhoneCall size={19}/></div><label className="call-field">Member username or name<input value={callTarget} onChange={e => setCallTarget(e.target.value)} placeholder="@username"/></label><div className="call-start-actions"><button className="call-primary" onClick={() => startCall('Voice',callTarget)}><Phone size={17}/> Voice call</button><button className="call-secondary" onClick={() => startCall('Video',callTarget)}><Video size={17}/> Video call</button><button className="call-secondary" onClick={() => setIncomingPreview(true)}><PhoneIncoming size={17}/> Preview incoming call</button></div><div className="call-hint"><ShieldCheck size={16}/><span>Member lookup and ringing will connect when FNI accounts and call signalling are available. Starting here opens a local control preview only.</span></div><div className="call-device-summary"><span className={devicePermission==='granted'?'permission-dot granted':'permission-dot'}/><span>{devicePermission==='granted'?'Device permission checked':devicePermission==='denied'?'Device permission not granted':'Camera and microphone permission not checked'}</span></div></section>
      <section className="call-panel call-quick-panel"><div className="call-panel-title"><div><h3>Group calling</h3><p>Start voice or video calls with a group.</p></div><Users size={19}/></div><div className="call-group-illustration"><Users size={27}/><span>Group call controls</span></div><p className="call-muted-copy">Open a group conversation and use its call action to begin a group voice or video call. Inviting and managing participants requires the live calling service.</p><div className="call-start-actions"><button className="call-primary" onClick={() => startCall('Group voice','FNI group')}><Phone size={16}/> Group voice</button><button className="call-secondary" onClick={() => startCall('Group video','FNI group')}><Video size={16}/> Group video</button></div></section>
    </div>}
    {tab === 'calls' && <section className="call-panel call-history-panel"><div className="call-panel-title"><div><h3>Recent calls</h3><p>Your call activity on this device.</p></div><History size={19}/></div>{history.length ? <div className="call-history-list">{history.map(item => <div className="call-history-row" key={item.id}><div className={item.outcome==='Missed'?'call-history-icon missed':'call-history-icon'}>{item.outcome==='Missed'?<PhoneMissed size={17}/>:item.kind.toLowerCase().includes('video')?<Video size={17}/>:<PhoneIncoming size={17}/>}</div><div className="call-history-copy"><b>{item.title}</b><span>{item.kind} · {item.outcome} · {new Date(item.date).toLocaleString()}</span></div><time>{formatDuration(item.duration)}</time><button aria-label={'Call '+item.title} onClick={() => {setCallTarget(item.title);startCall(item.kind,item.title)}}><Phone size={16}/></button></div>)}</div> : <div className="call-empty"><History size={24}/><b>No call history yet</b><span>Your completed, missed and declined calls will appear here on this device.</span></div>}</section>}
    {tab === 'rooms' && <section className="call-panel rooms-list-panel"><div className="call-panel-title"><div><h3>Your meeting rooms</h3><p>Scheduled and active rooms created in this browser.</p></div><CalendarClock size={19}/></div>{liveMeetings.length ? <div className="meeting-list">{liveMeetings.map(meeting => <div className="meeting-list-row" key={meeting.id}><div className="meeting-list-icon"><Video size={19}/></div><div className="meeting-list-copy"><b>{meeting.title}</b><span>{new Date(meeting.startsAt).toLocaleString()} · {meeting.code}</span><small>{meeting.description || 'No description'} </small></div><span className={meeting.status==='Live'?'meeting-status live':'meeting-status'}>{meeting.status}</span><button className="call-secondary" onClick={() => enterMeeting(meeting)}>Open room <ChevronDown size={14}/></button><button className="meeting-copy-button" onClick={() => copyCode(meeting.code)} aria-label="Copy code"><Copy size={15}/></button></div>)}</div> : <div className="call-empty"><CalendarClock size={25}/><b>No meeting rooms yet</b><span>Create a room to set its title, description, schedule, room code and waiting-room preference.</span><button className="call-secondary" onClick={() => setShowCreate(true)}>Create your first meeting</button></div>}</section>}
    {tab === 'privacy' && <section className="call-panel call-privacy-panel"><div className="call-panel-title"><div><h3>Call privacy & permissions</h3><p>These preferences are saved locally until account settings sync is available.</p></div><Lock size={19}/></div><div className="call-setting-row"><div><b>Who can call you?</b><span>Choose who may start a personal call.</span></div><select value={whoCanCall} onChange={e => {setWhoCanCall(e.target.value);savePrivacy({whoCanCall:e.target.value})}}><option>Everyone</option><option>FNI members</option><option>My contacts</option><option>Nobody</option></select></div><div className="call-setting-row"><div><b>Who can add you to group calls?</b><span>Control group-call invitations.</span></div><select value={whoCanAdd} onChange={e => {setWhoCanAdd(e.target.value);savePrivacy({whoCanAdd:e.target.value})}}><option>Everyone</option><option>FNI members</option><option>My contacts</option><option>Nobody</option></select></div><div className="call-setting-row"><div><b>Call notifications</b><span>Incoming voice and video call alerts.</span></div><button className={callNotifications?'call-switch on':'call-switch'} role="switch" aria-checked={callNotifications} onClick={() => {setCallNotifications(v=>!v);savePrivacy({callNotifications:!callNotifications})}}><i/></button></div><div className="call-setting-row"><div><b>Meeting notifications</b><span>Room invitations and scheduled meeting reminders.</span></div><button className={meetingNotifications?'call-switch on':'call-switch'} role="switch" aria-checked={meetingNotifications} onClick={() => {setMeetingNotifications(v=>!v);savePrivacy({meetingNotifications:!meetingNotifications})}}><i/></button></div><div className="call-permission-note"><ShieldCheck size={17}/><span>Browser camera and microphone access is requested only when you start a call preview. Blocking, caller verification, device sessions and push alerts require secure FNI account services.</span></div><div className="call-setting-row"><div><b>Camera & microphone</b><span>{devicePermission==='granted'?'Permission was granted during this browser session.':devicePermission==='denied'?'Permission was denied or unavailable.':'Check your browser device permissions.'}</span></div><button className="call-secondary" onClick={async()=>{await checkDevices(true)}}><Settings2 size={15}/> Check devices</button></div><div className="call-setting-row"><div><b>Audio output</b><span>Choose the preferred output when supported by the device and browser.</span></div><select value={audioOutput} onChange={e=>setAudioOutput(e.target.value)}><option>Default device</option><option>Speaker</option><option>Earpiece</option><option>Bluetooth device (if supported)</option></select></div></section>}
    <div className="call-system-note"><ShieldCheck size={15}/><span>FNI calling frontend is prepared. Live ringing, WebRTC audio/video, participant moderation, waiting-room admission, screen sharing and push notifications are backend/advanced-stage integrations.</span></div>
    {callNotice && <div className="call-notice" role="status">{callNotice}<button onClick={() => setCallNotice('')}><X size={14}/></button></div>}
  </div>;
}

function MessageCircleIcon() { return <AudioLines size={16}/>; }
