import { useEffect, useRef, useState } from 'react';
import { Menu, Search, Plus, Bell, MessageCircle, Users, Phone, Settings, ChevronDown, X, ArrowLeft, Send, Paperclip, Smile, Sticker, MoreVertical, Video, PhoneCall, UserRound, LockKeyhole, BellRing, Palette, Database, Smartphone, Globe2, MessageSquare, HeartHandshake, CircleHelp, ChevronRight, ShieldCheck, Volume2, Moon, Sun, Monitor, Download, Eye, BookOpen, HandHeart, CalendarDays, Image, KeyRound, Camera, FileText, MapPin, Contact, BarChart3, CalendarPlus, } from 'lucide-react';

type Section = 'Chats' | 'Contacts' | 'Calls' | 'FNI Community' | 'Settings';
type Folder = 'All chats' | 'Personal' | 'Groups' | 'Archived';
type AccountProfile = { name: string; username: string; bio: string; photo: string };
type Message = { id: number; text: string; time: string; replyTo?: string; mediaUrl?: string; mediaType?: 'photo' | 'video'; mediaName?: string; fileUrl?: string; fileSize?: number; recordingDataUrl?: string; recordingMimeType?: string; recordingTitle?: string; stickerData?: string; attachmentKind?: 'file' | 'location' | 'contact' | 'poll' | 'meeting' | 'prayer' | 'scripture' | 'sticker'; scriptureReference?: string; scriptureTranslation?: string; reactions?: string[]; edited?: boolean; forwardedFrom?: string };

const EMOJI_CATEGORIES: Record<string, string[]> = {
  Smileys: Array.from('😀 😃 😄 😁 😆 😅 😂 🤣 🥲 🥹 ☺️ 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 🙂‍↕️ 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫣 🤭 🫢 🫡 🤫 🫠 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👿 👹 👺 🤡 💩 👻 💀 ☠️ 👽 👾 🤖 🎃'.split(' ')),
  People: Array.from('👋 🤚 🖐️ ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 🦻 👃 🧠 🫀 🫁 🦷 🦴 👀 👁️ 👅 👄 🫦 👶 🧒 👦 👧 🧑 👨 👩 🧔 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵️ 💂 🥷 👷 🤴 👸 👳 👲 🧕 🤵 👰 🤰 🫃 🫄 🤱 👼 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟 💃 🕺 🕴️ 👯 🧖 🧗 🤺 🏇 ⛷️ 🏂 🏌️ 🏄 🚣 🏊 ⛹️ 🏋️ 🚴 🚵 🤸 🤼 🤽 🤾 🤹 🧘 🛀 🛌'.split(' ')),
  Animals: Array.from('🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🫎 🫏 🐝 🪱 🐛 🦋 🐌 🪲 🐞 🐜 🪰 🪱 🦟 🦗 🕷️ 🕸️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🦈 🐳 🐋 🦭 🐊 🐅 🐆 🦓 🦍 🦧 🦣 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🦬 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐕‍🦺 🐈 🐈‍⬛ 🪶 🐓 🦃 🦤 🦚 🦜 🪽 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿️ 🦔'.split(' ')),
  Food: Array.from('🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🫒 🥑 🍆 🥔 🥕 🌽 🌶️ 🫑 🥒 🥬 🥦 🧄 🧅 🍄 🥜 🌰 🍞 🥐 🥖 🫓 🥨 🥯 🥞 🧇 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🫔 🥙 🧆 🥚 🍳 🥘 🍲 🫕 🥣 🥗 🍿 🧈 🧂 🥫 🍱 🍘 🍙 🍚 🍛 🍜 🍝 🍠 🍢 🍣 🍤 🍥 🥮 🍡 🥟 🥠 🥡 🦪 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🥧 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🫖 🍵 🍶 🍾 🍷 🍸 🍹 🍺 🍻 🥂 🥃 🫗 🧋 🧃 🧉'.split(' ')),
  Travel: Array.from('🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🛵 🏍️ 🛺 🚲 🛴 🛹 🛼 🚏 🛣️ 🛤️ ⛽ 🚨 🚥 🚦 🚧 ⚓ 🛟 ⛵ 🚤 🛳️ ⛴️ 🛥️ 🚢 ✈️ 🛩️ 🛫 🛬 🪂 💺 🚁 🚟 🚠 🚡 🚀 🛸 🌍 🌎 🌏 🌐 🗺️ 🧭 🏔️ ⛰️ 🌋 🗻 🏕️ 🏖️ 🏜️ 🏝️ 🏞️ 🏟️ 🏛️ 🏗️ 🧱 🏘️ 🏚️ 🏠 🏡 🏢 🏣 🏤 🏥 🏦 🏨 🏩 🏪 🏫 🏬 🏭 🏯 🏰 💒 🗼 🗽 ⛪ 🕌 🛕 🕍 ⛩️ 🕋 ⛲ 🌁 🌃 🌄 🌅 🌆 🌇 🌉 🌌 🌠 🎇 🎆 🌈'.split(' ')),
  Activities: Array.from('⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛷 ⛸️ 🥌 🎿 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🪇 🎲 ♟️ 🎯 🎳 🎮 🕹️ 🧩 🧸 🪅 🪩 🪆 🃏 🀄'.split(' ')),
  Objects: Array.from('⌚ 📱 📲 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🖲️ 🕹️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🪫 🔌 💡 🔦 🕯️ 🪔 🧯 🛢️ 💸 💵 💴 💶 💷 🪙 💰 💳 🧾 💎 ⚖️ 🪜 🧰 🔧 🔨 ⚒️ 🛠️ ⛏️ 🪚 🔩 ⚙️ 🪛 🧲 💣 🧨 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳️ 🩹 🩺 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡️ 🧹 🧺 🧻 🚽 🚿 🛁 🪥 🧴 🧷 🧸 🪞 🪟 🛏️ 🛋️ 🪑 🚪 🪑 🧳 🛍️ 🎁 🎈 🎀 🪄 🪅 🪆'.split(' ')),
  Symbols: Array.from('❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❤️‍🔥 ❤️‍🩹 💕 💞 💓 💗 💖 💘 💝 💟 ♥️ ❣️ 💌 💋 💯 💢 💥 💫 💦 💨 🕳️ 💬 👁️‍🗨️ 🗨️ 🗯️ 💭 💤 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 🔞 🔕 🔔 🔊 🔇 🔈 🔉 🔍 🔎 ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ ☑️ ✔️ ❎ ➕ ➖ ➗ ✖️ ♾️ 💲 💱 ™️ ©️ ®️ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷'.split(' ')),
  Flags: Array.from('🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇬🇭 🇳🇬 🇿🇦 🇰🇪 🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇩🇪 🇫🇷 🇮🇹 🇪🇸 🇵🇹 🇧🇷 🇯🇵 🇰🇷 🇨🇳 🇮🇳 🇸🇦 🇦🇪 🇶🇦 🇮🇱 🇺🇦 🇷🇺 🇪🇺'.split(' '))
};

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="settings-toggle-row"><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)}/><i aria-hidden="true"/></label>;
}

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashLeaving, setSplashLeaving] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const leaveTimer = window.setTimeout(() => setSplashLeaving(true), reduced ? 450 : 1900);
    const hideTimer = window.setTimeout(() => setSplashVisible(false), reduced ? 650 : 2550);
    return () => { window.clearTimeout(leaveTimer); window.clearTimeout(hideTimer); };
  }, []);
  const [section, setSection] = useState<Section>('Chats');
  const [settingsCategory, setSettingsCategory] = useState('Account');
  const [settingsMobileDetail, setSettingsMobileDetail] = useState(false);
  const [accountProfile, setAccountProfile] = useState<AccountProfile>(() => {
    try { return { name: 'FNI Member', username: '', bio: '', photo: '', ...JSON.parse(localStorage.getItem('fni-account-profile') || '{}') }; }
    catch { return { name: 'FNI Member', username: '', bio: '', photo: '' }; }
  });
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState<AccountProfile>(accountProfile);
  const [securityInfoOpen, setSecurityInfoOpen] = useState(false);
  const [passcodeEnabled, setPasscodeEnabled] = useState(() => localStorage.getItem('fni-passcode-enabled') === 'true');
  const [deviceLockEnabled, setDeviceLockEnabled] = useState(() => localStorage.getItem('fni-device-lock-enabled') === 'true');
  const [appLocked, setAppLocked] = useState(() => localStorage.getItem('fni-passcode-enabled') === 'true' || localStorage.getItem('fni-device-lock-enabled') === 'true');
  const [passcodeDialogOpen, setPasscodeDialogOpen] = useState(false);
  const [passcodeValue, setPasscodeValue] = useState('');
  const [passcodeConfirm, setPasscodeConfirm] = useState('');
  const [unlockValue, setUnlockValue] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const hashPasscode = async (pin: string, salt: string) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pin));
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  };
  const savePasscode = async () => {
    if (!/^\d{6,12}$/.test(passcodeValue)) { setPasscodeError('Use 6–12 digits for your passcode.'); return; }
    if (passcodeValue !== passcodeConfirm) { setPasscodeError('The passcodes do not match.'); return; }
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(byte => byte.toString(16).padStart(2, '0')).join('');
    try {
      localStorage.setItem('fni-passcode-salt', salt);
      localStorage.setItem('fni-passcode-hash', await hashPasscode(passcodeValue, salt));
      localStorage.setItem('fni-passcode-enabled', 'true');
      setPasscodeEnabled(true); setPasscodeDialogOpen(false); setPasscodeValue(''); setPasscodeConfirm(''); setPasscodeError('');
    } catch { setPasscodeError('Passcode setup is unavailable in this browser.'); }
  };
  const unlockApp = async () => {
    const salt = localStorage.getItem('fni-passcode-salt') || '';
    const savedHash = localStorage.getItem('fni-passcode-hash') || '';
    if (!salt || !savedHash) { setPasscodeError('Passcode setup is incomplete. Disable and set it up again.'); return; }
    if (await hashPasscode(unlockValue, salt) === savedHash) { setAppLocked(false); setUnlockValue(''); setPasscodeError(''); }
    else setPasscodeError('Incorrect passcode. Try again.');
  };
  const disablePasscode = async () => {
    const salt = localStorage.getItem('fni-passcode-salt') || '';
    if (!salt || await hashPasscode(passcodeValue, salt) !== localStorage.getItem('fni-passcode-hash')) { setPasscodeError('Enter your current passcode to turn off the lock.'); return; }
    localStorage.removeItem('fni-passcode-salt'); localStorage.removeItem('fni-passcode-hash'); localStorage.removeItem('fni-passcode-enabled');
    setPasscodeEnabled(false); setPasscodeDialogOpen(false); setPasscodeValue(''); setPasscodeConfirm(''); setPasscodeError('');
  };

  const encodeCredentialId = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const decodeCredentialId = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));
  const enableDeviceLock = async () => {
    setPasscodeError('');
    if (!window.isSecureContext || !navigator.credentials || !window.PublicKeyCredential) {
      setPasscodeError('Device authentication is not supported here. Use the FNI passcode instead.');
      return;
    }
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const credential = await navigator.credentials.create({ publicKey: {
        challenge: challenge as BufferSource,
        rp: { name: 'FNI', id: window.location.hostname },
        user: { id: userId as BufferSource, name: 'fni-member@' + window.location.hostname, displayName: 'FNI Member' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
        timeout: 60000,
        attestation: 'none'
      }});
      if (!(credential instanceof PublicKeyCredential)) throw new Error('No device credential was created.');
      localStorage.setItem('fni-device-credential-id', encodeCredentialId(credential.rawId));
      localStorage.setItem('fni-device-lock-enabled', 'true');
      setDeviceLockEnabled(true);
      setPasscodeError('Device authentication is set up on this browser. Lock FNI and test it on this phone.');
    } catch (error) {
      const errorName = error instanceof DOMException ? error.name : 'UnknownError';
      const reason = errorName === 'NotAllowedError'
        ? 'The request was cancelled, timed out, or this browser could not access a device passkey. On iPhone, open FNI directly in Safari and check that a device passcode and Face ID are enabled.'
        : errorName === 'SecurityError'
          ? 'The browser rejected this website for passkey registration. Open the HTTPS FNI site directly in Safari or Chrome, not inside another app.'
          : errorName === 'NotSupportedError'
            ? 'This browser or phone does not currently offer a compatible device authenticator. Use the FNI passcode lock.'
            : errorName === 'InvalidStateError'
              ? 'A device credential may already exist for this FNI site. Try turning device authentication off and setting it up again.'
              : 'Device authentication could not be registered (' + errorName + '). Use the FNI passcode lock for now.';
      setPasscodeError(reason);
    }
  };
  const unlockWithDevice = async () => {
    const savedId = localStorage.getItem('fni-device-credential-id');
    if (!savedId) { setPasscodeError('Device authentication is not set up.'); return; }
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const assertion = await navigator.credentials.get({ publicKey: {
        challenge: challenge as BufferSource,
        allowCredentials: [{ type: 'public-key', id: decodeCredentialId(savedId) as BufferSource }],
        userVerification: 'required',
        timeout: 60000
      }});
      if (!(assertion instanceof PublicKeyCredential)) throw new Error('Device authentication did not complete.');
      setAppLocked(false);
      setUnlockValue('');
      setPasscodeError('');
    } catch {
      setPasscodeError('Device authentication was cancelled or failed. Try again or use your FNI passcode.');
    }
  };
  const disableDeviceLock = () => {
    localStorage.removeItem('fni-device-credential-id');
    localStorage.removeItem('fni-device-lock-enabled');
    setDeviceLockEnabled(false);
    setPasscodeError('Device authentication has been turned off on this browser.');
  };
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && (localStorage.getItem('fni-passcode-enabled') === 'true' || localStorage.getItem('fni-device-lock-enabled') === 'true')) {
        setAppLocked(true);
        setUnlockValue('');
        setPasscodeError('');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  const [profileSaveNotice, setProfileSaveNotice] = useState('');
  const saveAccountProfile = () => {
    const next = { ...profileDraft, name: profileDraft.name.trim() || 'FNI Member', username: profileDraft.username.trim().replace(/^@/, '') };
    setAccountProfile(next);
    try { localStorage.setItem('fni-account-profile', JSON.stringify(next)); setProfileSaveNotice('Profile details saved on this device.'); }
    catch { setProfileSaveNotice('Could not save profile details. The selected photo may be too large.'); }
    setProfileEditorOpen(false);
  };
  const chooseProfilePhoto = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { setProfileSaveNotice('Choose an image smaller than 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfileDraft((current) => ({ ...current, photo: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const [storageReport, setStorageReport] = useState<{ localBytes: number; originUsage?: number; originQuota?: number } | null>(null);
  const inspectStorage = async () => {
    let localBytes = 0;
    try {
      const entries = Object.keys(localStorage).filter(key => key.startsWith('fni-') || key === 'fni-settings').map(key => [key, localStorage.getItem(key) || '']);
      localBytes = new Blob(entries.map(([key, value]) => String(key) + ':' + String(value))).size;
    } catch { /* local storage may be unavailable */ }
    let originUsage: number | undefined;
    let originQuota: number | undefined;
    try {
      const estimate = await navigator.storage?.estimate();
      originUsage = estimate?.usage;
      originQuota = estimate?.quota;
    } catch { /* storage estimate is not supported in every browser */ }
    setStorageReport({ localBytes, originUsage, originQuota });
  };
  const [preferences, setPreferences] = useState(() => {
    try {
      return { appearance: 'System', language: 'English', messagePreview: true, sound: true, desktopNotifications: true, compactChatList: false, chatTextSize: 'Normal', showMessageTimestamps: true, mentionSuggestions: true, groupNotifications: true, meetingReminders: true, lastSeen: 'Everybody', profilePhoto: 'Everybody', phoneNumber: 'My contacts', readReceipts: true, autoDownloadPhotos: true, autoDownloadVideos: false, dataSaver: false, saveToGallery: false, enterToSend: true, reducedMotion: false, ...JSON.parse(localStorage.getItem('fni-settings') || '{}') };
    } catch {
      return { appearance: 'System', language: 'English', messagePreview: true, sound: true, desktopNotifications: true, groupNotifications: true, meetingReminders: true, lastSeen: 'Everybody', profilePhoto: 'Everybody', phoneNumber: 'My contacts', readReceipts: true, autoDownloadPhotos: true, autoDownloadVideos: false, dataSaver: false, saveToGallery: false, enterToSend: true, reducedMotion: false, compactChatList: false, chatTextSize: 'Normal', showMessageTimestamps: true, mentionSuggestions: true };
    }
  });
  const updatePreference = (key: string, value: string | boolean) => setPreferences((current: Record<string, string | boolean>) => ({ ...current, [key]: value }));
  const detectedLanguage = (() => {
    const locale = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
    if (locale.startsWith('fr')) return 'French';
    if (locale.startsWith('tw') || locale.startsWith('ak')) return 'Twi';
    return 'English';
  })();
  const language = String(preferences.language || 'Automatic') === 'Automatic' ? detectedLanguage : String(preferences.language);
  const translations: Record<string, Record<string, string>> = {
    French: {
      Chats: 'Discussions', Contacts: 'Contacts', Calls: 'Appels', Settings: 'Paramètres',
      'All chats': 'Toutes les discussions', Personal: 'Personnels', Groups: 'Groupes', Archived: 'Archivés',
      Account: 'Compte', 'Privacy and Security': 'Confidentialité et sécurité', 'Notifications and Sounds': 'Notifications et sons',
      Appearance: 'Apparence', 'Chat Settings': 'Paramètres des discussions', 'Data and Storage': 'Données et stockage',
      Devices: 'Appareils', Language: 'Langue', 'FNI Community': 'Communauté FNI', Help: 'Aide',
      'App language': 'Langue de l’application', 'Choose the language used across FNI': 'Choisissez la langue utilisée dans FNI',
      'Manage your FNI app preferences': 'Gérez les préférences de votre application FNI',
      'Search people, @usernames, messages...': 'Rechercher des personnes, @noms, messages...',
      'FNI Member': 'Membre FNI', Online: 'En ligne',
      'English is the default interface language.': 'L’anglais est la langue par défaut de l’interface.'
    },
    Twi: {
      Chats: 'Nkɔmmɔbɔ', Contacts: 'Nkurɔfo', Calls: 'Frɛ', Settings: 'Nhyehyɛe',
      'All chats': 'Nkɔmmɔbɔ nyinaa', Personal: 'Ankorankoro', Groups: 'Akuo', Archived: 'Wɔakora so',
      Account: 'Akontaabu', 'Privacy and Security': 'Kokoam nsɛm ne ahobammɔ', 'Notifications and Sounds': 'Amanneɛbɔ ne nnyigyei',
      Appearance: 'Nhwɛbea', 'Chat Settings': 'Nkɔmmɔbɔ nhyehyɛe', 'Data and Storage': 'Data ne nneɛma a wɔakora so',
      Devices: 'Mfiri', Language: 'Kasa', 'FNI Community': 'FNI Kuw', Help: 'Mmoa',
      'App language': 'App no kasa', 'Choose the language used across FNI': 'Paw kasa a wɔde bedi dwuma wɔ FNI nyinaa mu',
      'Manage your FNI app preferences': 'Hyehyɛ FNI app no nhyehyɛe',
      'Search people, @usernames, messages...': 'Hwehwɛ nnipa, @din, nkra...',
      'FNI Member': 'FNI muni', Online: 'Ɔwɔ intanɛt so',
      'English is the default interface language.': 'Borɔfo ne kasa a wɔde hyɛɛ ase wɔ app no mu.'
    }
  };
  const t = (value: string) => translations[language]?.[value] || value;
  const [systemTheme, setSystemTheme] = useState<'Light' | 'Dark'>(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light');
  const resolvedTheme = preferences.appearance === 'System' ? systemTheme : preferences.appearance;
  useEffect(() => {
    try { localStorage.setItem('fni-settings', JSON.stringify(preferences)); } catch { /* storage may be unavailable */ }
  }, [preferences]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => setSystemTheme(media.matches ? 'Dark' : 'Light');
    syncTheme();
    media.addEventListener?.('change', syncTheme);
    return () => media.removeEventListener?.('change', syncTheme);
  }, []);
  const [folder, setFolder] = useState<Folder>('All chats');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newActionOpen, setNewActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [meetingNotifications, setMeetingNotifications] = useState<{ id: number; title: string; body: string; time: string; read: boolean; groupId: string }[]>(() => { try { return JSON.parse(localStorage.getItem('fni-meeting-notifications') || '[]'); } catch { return []; } });
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [findGroupsOpen, setFindGroupsOpen] = useState(false);
  const [groupDirectorySearch, setGroupDirectorySearch] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [groupJoinRequests, setGroupJoinRequests] = useState<{ id: string; groupId: string; groupName: string; requester: string; createdAt: string; status: 'Pending' | 'Approved' | 'Declined' }[]>(() => { try { return JSON.parse(localStorage.getItem('fni-group-join-requests') || '[]'); } catch { return []; } });

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupInitialMembers, setGroupInitialMembers] = useState('');
  const [groupMemberInput, setGroupMemberInput] = useState('');
  const [prayerRequestInput, setPrayerRequestInput] = useState('');
  const [groupGoalTitle, setGroupGoalTitle] = useState('');
  const [groupGoalDate, setGroupGoalDate] = useState('');
  const [groupGoalDescription, setGroupGoalDescription] = useState('');
  const [groupAnnouncementText, setGroupAnnouncementText] = useState('');
  const [groupAnnouncementImportant, setGroupAnnouncementImportant] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptionsText, setPollOptionsText] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('You');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceCategory, setResourceCategory] = useState('Sermon');
  const [devotionScripture, setDevotionScripture] = useState('');
  const [devotionFocus, setDevotionFocus] = useState('');
  const [devotionReflection, setDevotionReflection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceSelection, setAttendanceSelection] = useState<string[]>([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDetails, setMeetingDetails] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingAgendaInput, setMeetingAgendaInput] = useState('');
  const [meetingActionTitle, setMeetingActionTitle] = useState('');
  const [meetingActionAssignee, setMeetingActionAssignee] = useState('You');
  const [meetingActionDueDate, setMeetingActionDueDate] = useState('');
  const [groupApprovalRequests, setGroupApprovalRequests] = useState<{ id: string; name: string; description: string; requestedAt: string; status: 'Pending' | 'Approved' | 'Declined' }[]>(() => { try { return JSON.parse(localStorage.getItem('fni-group-approval-requests') || '[]'); } catch { return []; } });
  const [groupApprovalLog, setGroupApprovalLog] = useState<{ id: string; groupName: string; action: 'Submitted' | 'Approved' | 'Declined'; time: string }[]>(() => { try { return JSON.parse(localStorage.getItem('fni-group-approval-log') || '[]'); } catch { return []; } });
  const [groupDetails, setGroupDetails] = useState<Record<string, { name: string; description: string; members?: string[]; moderators?: string[]; meeting?: { title?: string; details?: string; date: string; time: string; location: string; link: string; createdBy?: string; responses?: Record<string, 'Going' | 'Maybe' | 'Not going'>; agenda?: { id: number; text: string; done: boolean }[]; minutes?: string; followUps?: { id: number; title: string; assignee: string; dueDate: string; done: boolean }[] }; prayerRequests?: { id: number; text: string; createdAt: string; prayed: boolean }[]; attendance?: { date: string; present: string[] }[]; goals?: { id: number; title: string; description: string; targetDate: string; progress: number; completed: boolean; createdAt: string }[]; announcements?: { id: number; text: string; important: boolean; createdAt: string }[];
    polls?: { id: number; question: string; options: string[]; votes: Record<string, string>; createdAt: string; closed?: boolean }[];
    tasks?: { id: number; title: string; assignee: string; dueDate: string; completed: boolean; createdAt: string }[];
    resources?: { id: number; title: string; url: string; category: string; createdAt: string }[];
    devotionPlans?: { id: number; scripture: string; focus: string; reflection: string; createdAt: string }[];
    allowMembersToJoin?: boolean; requireJoinApproval?: boolean; discoverable?: boolean; inviteCode?: string; createdBy?: string }>>(() => {
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
  const [callMode, setCallMode] = useState<'group' | 'voice' | 'video'>('group');
  const [recording, setRecording] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingError, setRecordingError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const [videoMicOn, setVideoMicOn] = useState(true);
  const [videoCameraOn, setVideoCameraOn] = useState(true);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoError, setVideoError] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [sharedMediaPreview, setSharedMediaPreview] = useState<Message | null>(null);
  const [groupMedia, setGroupMedia] = useState<Record<string, Message[]>>({});
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
  const [bibleTranslation, setBibleTranslation] = useState('kjv');
  const [bibleBotOpen, setBibleBotOpen] = useState(false);
  const [bibleReferenceInput, setBibleReferenceInput] = useState('');
  const [bibleLookupResult, setBibleLookupResult] = useState<{ reference: string; text: string; translation: string; verses?: { verse: number; text: string }[] } | null>(null);
  const [bibleLookupLoading, setBibleLookupLoading] = useState(false);
  const [bibleLookupError, setBibleLookupError] = useState('');
  const bibleCommand = draft.match(/^(?:@FNIBibleBot\s+|\/bible\s+)(.+)$/i);
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
  useEffect(() => { try { localStorage.setItem('fni-group-approval-requests', JSON.stringify(groupApprovalRequests)); } catch { /* storage may be unavailable */ } }, [groupApprovalRequests]);
  useEffect(() => { try { localStorage.setItem('fni-group-join-requests', JSON.stringify(groupJoinRequests)); } catch { /* storage may be unavailable */ } }, [groupJoinRequests]);
  useEffect(() => { try { localStorage.setItem('fni-group-approval-log', JSON.stringify(groupApprovalLog)); } catch { /* storage may be unavailable */ } }, [groupApprovalLog]);
  useEffect(() => { try { localStorage.setItem('fni-meeting-notifications', JSON.stringify(meetingNotifications)); } catch { /* storage may be unavailable */ } }, [meetingNotifications]);
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
      textOnly[chat] = items.filter((item) => !item.mediaType || Boolean(item.recordingDataUrl));
    });
    try { localStorage.setItem('fni-local-conversations', JSON.stringify(textOnly)); } catch { /* storage may be unavailable */ }
  }, [conversations]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [pinnedMessageId, setPinnedMessageId] = useState<number | null>(null);
  const [openMessageMenu, setOpenMessageMenu] = useState<number | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('Smileys');
  const [stickerOpen, setStickerOpen] = useState(false);
  const [customStickers, setCustomStickers] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fni-custom-stickers') || '[]'); } catch { return []; } });
  const stickerInput = useRef<HTMLInputElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { try { localStorage.setItem('fni-custom-stickers', JSON.stringify(customStickers)); } catch { /* storage limit */ } }, [customStickers]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [forwardRecipient, setForwardRecipient] = useState('');
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const attachmentInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [attachmentCaption, setAttachmentCaption] = useState('');
  const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<string[]>([]);
  useEffect(() => { const urls = pendingAttachments.map((file) => URL.createObjectURL(file)); setAttachmentPreviewUrls(urls); return () => urls.forEach((url) => URL.revokeObjectURL(url)); }, [pendingAttachments]);

  useEffect(() => {
    if (localVideoRef.current && videoStream) localVideoRef.current.srcObject = videoStream;
  }, [videoStream, videoRoomOpen, videoCameraOn]);

  const stopVideoRoom = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    videoStream?.getTracks().forEach((track) => track.stop());
    setVideoStream(null); setVideoRoomStarted(false); setVideoRoomOpen(false); setVideoError('');
    setRecording(false); setRecordingTitle(''); setRecordingError('');
  };
  const openCall = (mode: 'group' | 'voice' | 'video') => {
    setCallMode(mode); setVideoRoomStarted(false); setVideoMicOn(true); setVideoCameraOn(mode === 'video');
    setVideoError(''); setRecordingError(''); setVideoRoomOpen(true);
  };
  const startVideoRoom = async () => {
    setVideoError('');
    if (!navigator.mediaDevices?.getUserMedia) { setVideoError('Microphone and camera access is not available here. Open FNI over HTTPS and try again.'); return; }
    try {
      const wantsVideo = callMode === 'video';
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: wantsVideo });
      setVideoStream(stream); setVideoMicOn(true); setVideoCameraOn(wantsVideo); setVideoRoomStarted(true);
      if (callMode === 'group') {
        const groupNameForNotice = groupDetails[activeChat]?.name || activeChat;
        setMeetingNotifications(current => [{ id: Date.now(), title: groupNameForNotice + ' voice chat started', body: 'Group voice chat is live. Members can turn on their cameras whenever they are ready.', time: new Date().toLocaleString(), read: false, groupId: activeChat }, ...current]);
      }
    } catch { setVideoError('Microphone or camera permission was denied, or no device was found. Check browser permissions and try again.'); }
  };
  const toggleVideoCamera = async () => {
    if (!videoStream) return;
    const existingTrack = videoStream.getVideoTracks()[0];
    if (existingTrack) { const next = !videoCameraOn; existingTrack.enabled = next; setVideoCameraOn(next); return; }
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const track = cameraStream.getVideoTracks()[0];
      if (track) { videoStream.addTrack(track); setVideoCameraOn(true); }
    } catch { setVideoError('Camera permission was denied. Allow camera access to turn your video on.'); }
  };
  const saveRecordingToMessages = (blob: Blob, title: string) => {
    if (blob.size > 2500 * 1024) { setRecordingError('This recording is larger than 2.5 MB. Shorten it and record again to save it in this preview.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl) { setRecordingError('The recording could not be saved.'); return; }
      const item: Message = { id: Date.now(), text: title, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), recordingDataUrl: dataUrl, recordingMimeType: blob.type || 'video/webm', recordingTitle: title, mediaName: title };
      setConversations(current => ({ ...current, 'Saved Messages': [...(current['Saved Messages'] || []), item] }));
      setRecordingError('Saved to Saved Messages on this device.');
    };
    reader.onerror = () => setRecordingError('Could not read the recording for saving.');
    reader.readAsDataURL(blob);
  };
  const startRecording = () => {
    if (!videoStream) return;
    if (!window.MediaRecorder) { setRecordingError('Recording is not supported by this browser.'); return; }
    const title = window.prompt('Enter a title for this recording:')?.trim();
    if (!title) return;
    try {
      const preferred = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'audio/webm;codecs=opus', 'video/webm'];
      const mimeType = preferred.find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(videoStream, mimeType ? { mimeType } : undefined);
      recordingChunksRef.current = [];
      recorder.ondataavailable = event => { if (event.data.size) recordingChunksRef.current.push(event.data); };
      recorder.onerror = () => setRecordingError('Recording stopped because the browser reported an error.');
      recorder.onstop = () => { const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || 'video/webm' }); saveRecordingToMessages(blob, title); recordingChunksRef.current = []; setRecording(false); };
      mediaRecorderRef.current = recorder; recorder.start(1000); setRecordingTitle(title); setRecording(true); setRecordingError('');
    } catch { setRecordingError('FNI could not start recording. Check browser recording support and permissions.'); }
  };
  const stopRecording = () => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); setRecording(false); };

  const toggleVideoMic = () => {
    const next = !videoMicOn;
    videoStream?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setVideoMicOn(next);
  };

  const toggleVideoCamera = () => {
    const next = !videoCameraOn;
    videoStream?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setVideoCameraOn(next);
  };

  const matchingMessages = chatSearch.trim() ? messages.filter((message) => message.text.toLowerCase().includes(chatSearch.trim().toLowerCase()) || (message.mediaName || '').toLowerCase().includes(chatSearch.trim().toLowerCase())) : messages;
  const recentChats = Object.entries(conversations)
    .filter(([chat, items]) => {
      const isArchived = archivedChats.includes(chat);
      const matchesFolder = folder === 'Archived' ? isArchived : !isArchived && (folder === 'All chats' || (folder === 'Personal' && (chat.startsWith('@') || chat === 'Saved Messages')) || (folder === 'Groups' && !chat.startsWith('@') && chat !== 'Saved Messages'));
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
    { label: 'FNI Community' as const, icon: HeartHandshake },
    { label: 'Settings' as const, icon: Settings },
  ];

  const createGroup = () => {
    const name = groupName.trim();
    if (!name) return;
    const id = `group-${Date.now()}`;
    const inviteCode = Math.random().toString(36).slice(2, 10).toUpperCase();
    const invitedMembers = groupInitialMembers.split(/[\n,;]/).map((value) => value.trim()).filter(Boolean).map((value) => '@' + value.replace(/^@+/, ''));
    const members = Array.from(new Set(['You', ...invitedMembers]));
    setGroupDetails((current) => ({ ...current, [id]: { name, description: groupDescription.trim(), members, moderators: [], allowMembersToJoin: true, requireJoinApproval: false, discoverable: true, inviteCode, createdBy: 'You' } }));
    setConversations((current) => ({ ...current, [id]: [] }));
    setSection('Chats'); setFolder('Groups'); setActiveChat(id);
    setNewGroupOpen(false); setNewActionOpen(false); setGroupName(''); setGroupDescription(''); setGroupInitialMembers(''); setReplyTo(null);
  };

  const joinGroup = (groupId: string) => {
    const group = groupDetails[groupId];
    if (!group || group.allowMembersToJoin === false) return;
    if ((group.members || []).includes('You')) {
      setActiveChat(groupId); setSection('Chats'); setFolder('Groups'); setFindGroupsOpen(false); return;
    }
    if (group.requireJoinApproval) {
      const existing = groupJoinRequests.find((request) => request.groupId === groupId && request.requester === 'You' && request.status === 'Pending');
      if (!existing) setGroupJoinRequests((current) => [{ id: `join-${Date.now()}`, groupId, groupName: group.name, requester: 'You', createdAt: new Date().toLocaleString(), status: 'Pending' }, ...current]);
    } else {
      setGroupDetails((current) => ({ ...current, [groupId]: { ...current[groupId], members: Array.from(new Set([...(current[groupId].members || []), 'You'])) } }));
      setConversations((current) => ({ ...current, [groupId]: current[groupId] || [] }));
      setActiveChat(groupId); setSection('Chats'); setFolder('Groups'); setFindGroupsOpen(false);
    }
  };

  const joinByInviteCode = () => {
    const code = inviteCodeInput.trim().toUpperCase();
    const match = Object.entries(groupDetails).find(([, group]) => group.inviteCode?.toUpperCase() === code);
    if (!match) return;
    joinGroup(match[0]);
    setInviteCodeInput('');
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('join');
    if (code) { setInviteCodeInput(code); setFindGroupsOpen(true); }
  }, []);

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

  const queueAttachments = (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;
    setPendingAttachments((current) => [...current, ...selected]);
    setAttachmentMenuOpen(false);
    setEmojiOpen(false);
    setStickerOpen(false);
  };
  const sendPendingAttachments = () => {
    if (!pendingAttachments.length) return;
    const now = Date.now();
    const additions: Message[] = pendingAttachments.map((file, index) => {
      const mediaType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'photo' : undefined;
      const url = URL.createObjectURL(file);
      return {
        id: now + index,
        text: index === 0 ? attachmentCaption.trim() : '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...(mediaType ? { mediaUrl: url, mediaType } : { fileUrl: url, attachmentKind: 'file' as const }),
        mediaName: file.name,
        fileSize: file.size,
      };
    });
    setMessages((current) => [...current, ...additions]);
    setPendingAttachments([]);
    setAttachmentCaption('');
  };
  const attachMedia = (file?: File) => { if (file) queueAttachments([file]); };
  const sendAttachmentText = (kind: Message['attachmentKind'], title: string, body: string) => {
    setMessages((current) => [...current, { id: Date.now(), text: body, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), attachmentKind: kind, mediaName: title }]);
    setAttachmentMenuOpen(false);
  };
  const shareCurrentLocation = () => {
    if (!navigator.geolocation) { window.alert('Location sharing is not supported by this browser.'); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      sendAttachmentText('location', 'Shared location', `My location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}\nhttps://www.google.com/maps?q=${latitude},${longitude}`);
    }, () => window.alert('FNI could not access your location. Check browser location permission and try again.'), { enableHighAccuracy: true, timeout: 12000 });
  };
  const createLocalPoll = () => {
    const question = window.prompt('Poll question');
    if (!question?.trim()) return;
    const raw = window.prompt('Enter answer options separated by commas');
    const options = (raw || '').split(',').map((item) => item.trim()).filter(Boolean);
    if (options.length < 2) { window.alert('A poll needs at least two answer options.'); return; }
    sendAttachmentText('poll', 'Poll', question.trim() + '\n' + options.map((option, index) => `◯ ${option}`).join('\n') + '\nPoll preview only — live voting will be enabled with FNI messaging services.');
  };
  const shareContact = async () => {
    const picker = (navigator as Navigator & { contacts?: { select: (properties: string[], options: { multiple: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>> } }).contacts;
    if (picker) {
      try {
        const selected = await picker.select(['name', 'tel'], { multiple: false });
        if (selected[0]) sendAttachmentText('contact', 'Contact', `${selected[0].name?.join(' ') || 'Contact'}\n${selected[0].tel?.join(', ') || 'No phone number shared'}`);
      } catch { /* user cancelled */ }
    } else {
      const name = window.prompt('Contact name to share');
      if (!name?.trim()) return;
      const phone = window.prompt('Phone number (optional)') || '';
      sendAttachmentText('contact', 'Contact', `${name.trim()}\n${phone}`);
    }
    setAttachmentMenuOpen(false);
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
  const createCustomSticker = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.alert('Choose an image file to create a sticker.'); return; }
    if (file.size > 1024 * 1024) { window.alert('Choose an image under 1 MB for your sticker.'); return; }
    const reader = new FileReader();
    reader.onload = () => { const data = String(reader.result || ''); if (data) setCustomStickers(current => [data, ...current].slice(0, 40)); };
    reader.readAsDataURL(file);
  };
  const sendCustomSticker = (stickerData: string) => {
    setMessages(current => [...current, { id: Date.now(), text: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), attachmentKind: 'sticker', stickerData }]);
    setStickerOpen(false);
  };

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
  useEffect(() => {
    const reference = (bibleReferenceInput || bibleCommand?.[1] || '').trim();
    if ((!bibleBotOpen && !bibleCommand) || reference.length < 5) {
      setBibleLookupResult(null);
      setBibleLookupError('');
      setBibleLookupLoading(false);
      return;
    }
    if (!['kjv', 'web'].includes(bibleTranslation)) {
      setBibleLookupResult(null);
      setBibleLookupLoading(false);
      setBibleLookupError('Live lookup for this translation needs a licensed Bible text provider. KJV and WEB are available now.');
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setBibleLookupLoading(true);
      setBibleLookupError('');
      setBibleLookupResult(null);
      try {
        const response = await fetch('https://bible-api.com/' + encodeURIComponent(reference) + '?translation=' + bibleTranslation);
        if (!response.ok) throw new Error('No matching verse found. Check the scripture reference.');
        const data = await response.json();
        const verseText = String(data.text || '').trim();
        if (!verseText) throw new Error('No verse text was returned for that reference.');
        if (!cancelled) setBibleLookupResult({ reference: String(data.reference || reference), text: verseText, translation: bibleTranslation.toUpperCase() });
      } catch (error) {
        if (!cancelled) setBibleLookupError(error instanceof Error ? error.message : 'Could not retrieve this verse. Check your connection.');
      } finally {
        if (!cancelled) setBibleLookupLoading(false);
      }
    }, 500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [bibleReferenceInput, bibleTranslation, bibleBotOpen, draft]);

  const lookupBibleVerse = async () => {
    const reference = (bibleReferenceInput || bibleCommand?.[1] || '').trim();
    if (!reference) return;
    if (!['kjv', 'web'].includes(bibleTranslation)) {
      setBibleLookupError('This translation needs a licensed Bible text provider/API key. KJV and World English Bible are available for live lookup in this preview.');
      setBibleLookupResult(null);
      return;
    }
    setBibleLookupLoading(true);
    setBibleLookupError('');
    setBibleLookupResult(null);
    try {
      const response = await fetch('https://bible-api.com/' + encodeURIComponent(reference) + '?translation=' + bibleTranslation);
      if (!response.ok) throw new Error('Reference not found. Check the book, chapter and verse.');
      const data = await response.json();
      const verseText = String(data.text || '').trim();
      if (!verseText) throw new Error('No verse text was returned for that reference.');
      const numberedVerses = Array.isArray(data.verses) ? data.verses.map((item: { verse?: number; text?: string }) => ({ verse: Number(item.verse || 0), text: String(item.text || '').trim() })).filter((item: { verse: number; text: string }) => item.text) : [];
      setBibleLookupResult({ reference: String(data.reference || reference), text: verseText, translation: bibleTranslation.toUpperCase(), verses: numberedVerses });
    } catch (error) {
      setBibleLookupError(error instanceof Error ? error.message : 'Could not retrieve this verse. Check your connection and reference.');
    } finally {
      setBibleLookupLoading(false);
    }
  };
  const sendBibleVerseToGroup = () => {
    if (!bibleLookupResult || !activeChat) return;
    const verseMessage: Message = {
      id: Date.now(),
      text: bibleLookupResult.verses?.length ? bibleLookupResult.verses.map(item => `${item.verse}  ${item.text}`).join('\n') : bibleLookupResult.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentKind: 'scripture',
      mediaName: 'FNI Bible Bot',
      scriptureReference: bibleLookupResult.reference,
      scriptureTranslation: bibleLookupResult.translation,
    };
    setMessages((current) => [...current, verseMessage]);
    setDraft('');
    setBibleLookupResult(null);
    setBibleLookupError('');
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
    <main data-theme={resolvedTheme.toLowerCase()} data-chat-density={preferences.compactChatList ? 'compact' : 'comfortable'} data-message-size={String(preferences.chatTextSize || 'Normal').toLowerCase()} className={`app-shell ${section === 'Settings' ? 'settings-mode' : ''} ${section === 'FNI Community' ? 'community-mode' : ''}`}>
      {splashVisible && <div className={`fni-splash-screen ${splashLeaving ? 'is-leaving' : ''}`} role="status" aria-label="FNI is starting">
        <div className="splash-orbit splash-orbit-one" />
        <div className="splash-orbit splash-orbit-two" />
        <div className="splash-content">
          <div className="splash-logo-frame"><img src="/FNI-APP-2.0/fni-logo.jpg" alt="FNI logo" /></div>
          <div className="splash-wordmark">FNI</div>
          <div className="splash-full-name">FORERUNNERS NETWORK<br/>INTERNATIONAL</div>
          <div className="splash-rule"><span /></div>
          <p className="splash-tagline">Faith. Fellowship. Forward.</p>
        </div>
        <div className="splash-footer"><span /> CONNECTING THE FORERUNNERS <span /></div>
      </div>}
      <aside className={`navigation-drawer ${menuOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-heading">
          <div className="brand-lockup">
            <img src="/FNI-APP-2.0/fni-logo.jpg" alt="FNI" />
            <div><strong>FNI</strong><span>Forerunners Network International</span></div>
          </div>
          <button className="icon-button drawer-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X /></button>
        </div>
        <button type="button" className="profile-summary" onClick={() => { setSection('Settings'); setSettingsCategory('Account'); setSettingsMobileDetail(true); setMenuOpen(false); }} aria-label="Open your profile">
          <div className="profile-avatar">{accountProfile.photo ? <img src={accountProfile.photo} alt="Your profile"/> : <span>{(accountProfile.name || 'F').slice(0,1).toUpperCase()}</span>}</div>
          <div className="profile-copy"><strong>{accountProfile.name || 'FNI Member'}</strong><span><i /> {t('Online')}{accountProfile.username ? ' · @' + accountProfile.username : ''}</span></div>
          <ChevronDown size={17} />
        </button>
        <nav className="main-navigation" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={section === label ? 'nav-item active' : 'nav-item'} onClick={() => { setSection(label); setActiveChat(''); setMenuOpen(false); }}>
              <Icon size={20} strokeWidth={1.8} /><span>{t(label)}</span>
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
            <div><h1>{t(section)}</h1><p>FORERUNNERS NETWORK INTERNATIONAL</p></div>
            <div className="header-actions-wrap"><div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" title="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell />{meetingNotifications.some((item) => !item.read) && <span className="notification-count">{meetingNotifications.filter((item) => !item.read).length}</span>}</button>{notificationsOpen && <div className="notifications-popover"><div className="notifications-heading"><strong>Notifications</strong><button type="button" onClick={() => setMeetingNotifications((current) => current.map((item) => ({ ...item, read: true })))}>Mark all read</button></div>{meetingNotifications.length ? meetingNotifications.map((item) => <button type="button" className={"notification-item " + (item.read ? "" : "notification-unread")} key={item.id} onClick={() => { setMeetingNotifications((current) => current.map((notice) => notice.id === item.id ? { ...notice, read: true } : notice)); setActiveChat(item.groupId); setSection("Chats"); setFolder("Groups"); setNotificationsOpen(false); }}><strong>{item.title}</strong><span>{item.body}</span><time>{item.time}</time></button>) : <p className="notifications-empty">You’re all caught up.</p>}</div>}</div><div className="new-action-wrap"><button className="icon-button new-chat-button" aria-label="Create chat" title="Create chat or group" aria-expanded={newActionOpen} onClick={() => setNewActionOpen((open) => !open)}><Plus /></button>{newActionOpen && <div className="new-action-menu"><button onClick={() => { setNewChatOpen(true); setNewActionOpen(false); }}>New message</button><button onClick={() => { setNewGroupOpen(true); setNewActionOpen(false); }}>New group</button><button onClick={() => { setFindGroupsOpen(true); setNewActionOpen(false); }}>Find groups</button></div>}</div></div>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("Search people, @usernames, messages...")} />
          </label>
          {section === 'Chats' && (
            <div className="folder-tabs" role="tablist" aria-label="Chat folders">
              {(['All chats', 'Personal', 'Groups', 'Archived'] as Folder[]).map((item) => (
                <button key={item} role="tab" aria-selected={folder === item} className={folder === item ? 'folder-tab selected' : 'folder-tab'} onClick={() => setFolder(item)}>{t(item)}</button>
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
        ) : section === 'FNI Community' ? (
          <div className="telegram-settings fni-community-page">
            <div className="settings-section">
              <h3>Forerunners Network International</h3>
              <p className="settings-footnote">Your ministry and community space. Create a cell once, add its members, and keep everyone in the same group conversation.</p>
              <div className="settings-info-row"><Users/><span><strong>Cell groups</strong><small>Create a cell, add members and open its shared chat</small></span><button type="button" onClick={() => { setNewGroupOpen(true); }}>Create group</button></div>
              <div className="find-group-results">
                {Object.entries(groupDetails).map(([id, group]) => <article className="find-group-result" key={id}><div className="find-group-avatar">{group.name.slice(0,1).toUpperCase()}</div><div className="find-group-result-copy"><strong>{group.name}</strong><span>{group.description || 'FNI cell group'}</span><small>{(group.members || []).length} members</small></div><button type="button" onClick={() => { setSection('Chats'); setFolder('Groups'); setActiveChat(id); setChatInfoOpen(false); }}>Open chat</button></article>)}
                {!Object.keys(groupDetails).length && <p className="group-members-empty">No cell groups yet. Create the first group and add its members.</p>}
              </div>
              <div className="settings-info-row"><Search/><span><strong>Discover groups</strong><small>Find a group or join with an invite code, subject to that group's settings</small></span><button type="button" onClick={() => setFindGroupsOpen(true)}>Find groups</button></div>
              <div className="settings-info-row"><CalendarDays/><span><strong>Meetings and events</strong><small>See scheduled group meetings and open their attendance and agenda</small></span><button type="button" onClick={() => { const first = Object.entries(groupDetails).find(([, group]) => group.meeting); if (first) { setSection('Chats'); setFolder('Groups'); setActiveChat(first[0]); setChatInfoOpen(true); } else { setSection('Chats'); setFolder('Groups'); setActiveChat(''); } }}>View meetings</button></div>
              {Object.entries(groupDetails).filter(([, group]) => group.meeting).map(([id, group]) => <button type="button" className="community-list-row" key={'meeting-'+id} onClick={() => { setSection('Chats'); setFolder('Groups'); setActiveChat(id); setChatInfoOpen(true); }}><strong>{group.name}</strong><span>{group.meeting?.date || 'Date not set'}{group.meeting?.time ? ' · '+group.meeting.time : ''}</span></button>)}
              <div className="settings-info-row"><BookOpen/><span><strong>Sermons and spiritual resources</strong><small>Open shared sermon links, scripture resources and devotion plans saved by your cells</small></span><button type="button" onClick={() => { const first = Object.entries(groupDetails).find(([, group]) => (group.resources?.length || 0) + (group.devotionPlans?.length || 0) > 0) || Object.entries(groupDetails)[0]; if (first) { setSection('Chats'); setFolder('Groups'); setActiveChat(first[0]); setChatInfoOpen(true); } else setNewGroupOpen(true); }}>Open resources</button></div>
              <div className="settings-info-row"><HandHeart/><span><strong>Prayer and care</strong><small>Open cell prayer requests and mark requests as prayed for</small></span><button type="button" onClick={() => { const first = Object.entries(groupDetails).find(([, group]) => (group.prayerRequests?.length || 0) > 0) || Object.entries(groupDetails)[0]; if (first) { setSection('Chats'); setFolder('Groups'); setActiveChat(first[0]); setChatInfoOpen(true); } else setNewGroupOpen(true); }}>Open prayer</button></div>
              <div className="settings-info-row"><HeartHandshake/><span><strong>Giving and support</strong><small>Secure contributions are not enabled in this preview</small></span><em>Backend required</em></div>
              <div className="settings-info-row"><Bell/><span><strong>Ministry announcements</strong><small>Read announcements shared inside your cell group chats</small></span><button type="button" onClick={() => { const first = Object.entries(groupDetails).find(([, group]) => (group.announcements?.length || 0) > 0) || Object.entries(groupDetails)[0]; if (first) { setSection('Chats'); setFolder('Groups'); setActiveChat(first[0]); setChatInfoOpen(true); } else setNewGroupOpen(true); }}>View updates</button></div>
              <p className="settings-footnote">Group details and member lists are saved on this device only for now. Cross-device membership, shared messages, live meetings, notifications and payment processing need the FNI backend.</p>
            </div>
          </div>
        ) : section === 'Settings' ? (
          <div className="telegram-settings">
            <div className="settings-profile-card">
              <div className="settings-profile-avatar">{accountProfile.photo ? <img src={accountProfile.photo} alt="Your profile"/> : <span>{(accountProfile.name || 'F').slice(0,1).toUpperCase()}</span>}</div>
              <div><strong>{accountProfile.name || 'FNI Member'}</strong><span>{accountProfile.username ? '@' + accountProfile.username + ' · ' : ''}Forerunners Network International</span><small>{accountProfile.bio || 'Your FNI profile'}</small></div>
              <button type="button" aria-label="Edit profile" onClick={() => setSettingsCategory('Account')}><ChevronRight size={18}/></button>
            </div>
            <div className={`settings-layout ${settingsMobileDetail ? 'mobile-detail-open' : ''}`}>
              <nav className="settings-category-list" aria-label="Settings categories">
                {[
                  { name: 'Account', icon: UserRound, detail: 'Profile and account' },
                  { name: 'Privacy and Security', icon: ShieldCheck, detail: 'Visibility and security' },
                  { name: 'Notifications and Sounds', icon: BellRing, detail: 'Messages, groups and calls' },
                  { name: 'Appearance', icon: Palette, detail: 'Theme and interface' },
                  { name: 'Chat Settings', icon: MessageSquare, detail: 'Messages and behaviour' },
                  { name: 'Data and Storage', icon: Database, detail: 'Media and data usage' },
                  { name: 'Devices', icon: Smartphone, detail: 'Active sessions' },
                  { name: 'Language', icon: Globe2, detail: 'App language' },
                  { name: 'FNI Community', icon: HeartHandshake, detail: 'Ministry and community' },
                  { name: 'Help', icon: CircleHelp, detail: 'Support and information' },
                ].map(({name, icon: Icon, detail}) => <button type="button" key={name} className={settingsCategory === name ? 'settings-category active' : 'settings-category'} onClick={() => { setSettingsCategory(name); setSettingsMobileDetail(true); }}><Icon size={18}/><span><strong>{t(name)}</strong><small>{detail}</small></span><ChevronRight size={16}/></button>)}
              </nav>
              <div className="settings-content">
                <div className="settings-content-heading"><button type="button" className="settings-mobile-back" onClick={() => setSettingsMobileDetail(false)}><ArrowLeft size={17}/></button><div><h2>{t(settingsCategory)}</h2><p>{t('Manage your FNI app preferences')}</p></div></div>
                {settingsCategory === 'Account' && <div className="settings-section">
                  <h3>Account information</h3>
                  <div className="settings-info-row account-profile-row"><div className="account-profile-avatar">{accountProfile.photo ? <img src={accountProfile.photo} alt="Profile"/> : <span>{(accountProfile.name || 'F').slice(0,1).toUpperCase()}</span>}</div><span><strong>Profile details</strong><small>{accountProfile.name}{accountProfile.username ? ' · @' + accountProfile.username : ''}{accountProfile.bio ? ' · ' + accountProfile.bio : ''}</small></span><button type="button" onClick={() => { setProfileDraft(accountProfile); setProfileEditorOpen(true); }}>Edit</button></div>
                  <div className="settings-info-row"><KeyRound/><span><strong>Phone number and email</strong><small>Manage sign-in and recovery methods</small></span><em>Account setup required</em></div>
                  <div className="settings-info-row"><ShieldCheck/><span><strong>Two-step verification</strong><small>Add an extra layer of account protection</small></span><button type="button" onClick={() => setSecurityInfoOpen(true)}>Learn more</button></div>
                  {profileSaveNotice && <p className="settings-footnote">{profileSaveNotice}</p>}
                  <p className="settings-footnote">Profile edits are saved only in this browser preview. Phone/email sign-in and real two-step verification will be enabled with secure FNI account services.</p>
                </div>}
                {settingsCategory === 'Privacy and Security' && <div className="settings-section">
                  <h3>Privacy</h3>
                  <label className="settings-control-row"><span><strong>Who can see my last seen</strong><small>Control when people can see your activity</small></span><select value={String(preferences.lastSeen)} onChange={e => updatePreference('lastSeen', e.target.value)}><option>Everybody</option><option>My contacts</option><option>Nobody</option></select></label>
                  <label className="settings-control-row"><span><strong>Who can see my profile photo</strong><small>Choose who can view your photo</small></span><select value={String(preferences.profilePhoto)} onChange={e => updatePreference('profilePhoto', e.target.value)}><option>Everybody</option><option>My contacts</option><option>Nobody</option></select></label>
                  <label className="settings-control-row"><span><strong>Who can see my phone number</strong><small>Choose who can view your number</small></span><select value={String(preferences.phoneNumber)} onChange={e => updatePreference('phoneNumber', e.target.value)}><option>Everybody</option><option>My contacts</option><option>Nobody</option></select></label>
                  <SettingToggle title="Read receipts" description="Show when you have read a message" checked={Boolean(preferences.readReceipts)} onChange={v => updatePreference('readReceipts', v)}/>
                  <h3>Security</h3>
                  <div className="settings-info-row"><LockKeyhole/><span><strong>Device authentication</strong><small>Use your phone's screen lock, fingerprint or face authentication when supported</small></span>{deviceLockEnabled ? <button type="button" onClick={disableDeviceLock}>Turn off</button> : <button type="button" onClick={enableDeviceLock}>Set up</button>}</div>
                  <div className="settings-info-row"><KeyRound/><span><strong>FNI passcode lock</strong><small>Use a separate 6–12 digit FNI passcode as a fallback</small></span><button type="button" onClick={() => { setPasscodeValue(''); setPasscodeConfirm(''); setPasscodeError(''); setPasscodeDialogOpen(true); }}>{passcodeEnabled ? 'Manage' : 'Set up'}</button></div>
                  {(passcodeEnabled || deviceLockEnabled) && <div className="settings-info-row"><LockKeyhole/><span><strong>Lock FNI now</strong><small>Require authentication the next time you open the app</small></span><button type="button" onClick={() => setAppLocked(true)}>Lock now</button></div>}
                  {passcodeError && <p className="settings-footnote" role="status">{passcodeError}</p>}
                  <div className="settings-info-row"><Eye/><span><strong>Active sessions</strong><small>Review devices signed in to your account</small></span><em>Backend required</em></div>
                  <p className="settings-footnote">These privacy choices are saved on this device in the preview. They will be enforced across accounts after FNI authentication is connected.</p>
                </div>}
                {settingsCategory === 'Notifications and Sounds' && <div className="settings-section">
                  <h3>Message notifications</h3>
                  <SettingToggle title="Private chats" description="Alerts for one-to-one messages" checked={Boolean(preferences.desktopNotifications)} onChange={v => updatePreference('desktopNotifications', v)}/>
                  <SettingToggle title="Group notifications" description="Updates from FNI groups and cell groups" checked={Boolean(preferences.groupNotifications)} onChange={v => updatePreference('groupNotifications', v)}/>
                  <SettingToggle title="Meeting reminders" description="Reminders for scheduled FNI meetings" checked={Boolean(preferences.meetingReminders)} onChange={v => updatePreference('meetingReminders', v)}/>
                  <SettingToggle title="Message previews" description="Show message text in notifications" checked={Boolean(preferences.messagePreview)} onChange={v => updatePreference('messagePreview', v)}/>
                  <SettingToggle title="In-app sounds" description="Play sounds for messages and actions" checked={Boolean(preferences.sound)} onChange={v => updatePreference('sound', v)}/>
                  <p className="settings-footnote">Notification preferences are stored locally. Push notifications require the FNI notification service.</p>
                </div>}
                {settingsCategory === 'Appearance' && <div className="settings-section">
                  <h3>Theme</h3><div className="settings-theme-options">{[{value:'Light',icon:Sun,label:'Light'},{value:'Dark',icon:Moon,label:'Dark'},{value:'System',icon:Monitor,label:'System'}].map(({value,icon:Icon,label}) => <button type="button" key={value} className={preferences.appearance === value ? 'settings-theme-option selected' : 'settings-theme-option'} onClick={() => updatePreference('appearance', value)}><Icon size={20}/><strong>{label}</strong><small>{preferences.appearance === value ? 'Selected' : 'Choose theme'}</small></button>)}</div>
                  <SettingToggle title="Reduce motion" description="Limit animated transitions" checked={Boolean(preferences.reducedMotion)} onChange={v => updatePreference('reducedMotion', v)}/>
                  <p className="settings-footnote">Your choice applies across chats, menus, settings and meeting screens. System follows your device appearance.</p>
                </div>}
                {settingsCategory === 'Chat Settings' && <div className="settings-section chat-settings-panel">
                  <h3>Message composer</h3>
                  <SettingToggle title="Send by pressing Enter" description="Enter sends the message; Shift + Enter inserts a new line" checked={Boolean(preferences.enterToSend)} onChange={v => updatePreference('enterToSend', v)}/>
                  <SettingToggle title="Username suggestions" description="Suggest matching chat members when typing @" checked={Boolean(preferences.mentionSuggestions)} onChange={v => updatePreference('mentionSuggestions', v)}/>
                  <h3>Chat appearance</h3>
                  <label className="settings-control-row"><span><strong>Message text size</strong><small>Adjust text size inside conversations</small></span><select value={String(preferences.chatTextSize || 'Normal')} onChange={e => updatePreference('chatTextSize', e.target.value)}><option>Small</option><option>Normal</option><option>Large</option></select></label>
                  <SettingToggle title="Compact chat list" description="Reduce spacing between conversations" checked={Boolean(preferences.compactChatList)} onChange={v => updatePreference('compactChatList', v)}/>
                  <SettingToggle title="Message timestamps" description="Show the sent time beneath each message" checked={Boolean(preferences.showMessageTimestamps)} onChange={v => updatePreference('showMessageTimestamps', v)}/>
                  <h3>Chat organisation</h3>
                  <div className="settings-info-row"><MessageSquare/><span><strong>Chat folders</strong><small>Switch between All chats, Personal, Groups and Archived</small></span><button type="button" onClick={() => { setSection('Chats'); setFolder('All chats'); }}>Open chats</button></div>
                  <div className="settings-info-row"><Image/><span><strong>Shared media</strong><small>Find photos and videos shared in each conversation</small></span><em>Inside chat info</em></div>
                  <h3>Notifications</h3>
                  <div className="settings-info-row"><Volume2/><span><strong>Chat sounds</strong><small>Control message and group alert sounds</small></span><button type="button" onClick={() => { setSettingsCategory('Notifications and Sounds'); setSettingsMobileDetail(true); }}>Configure</button></div>
                  <p className="settings-footnote">Chat preferences are saved on this device. Your message composer, text size, chat density, timestamps and mention suggestions now respond to these settings. Preferences stay on this device until account syncing is added.</p>
                </div>}
                {settingsCategory === 'Data and Storage' && <div className="settings-section">
                  <h3>Automatic media download</h3>
                  <SettingToggle title="Photos" description="Allow automatic photo downloads when incoming media sync is connected" checked={Boolean(preferences.autoDownloadPhotos)} onChange={v => updatePreference('autoDownloadPhotos', v)}/>
                  <SettingToggle title="Videos" description="Allow automatic video downloads when incoming media sync is connected" checked={Boolean(preferences.autoDownloadVideos)} onChange={v => updatePreference('autoDownloadVideos', v)}/>
                  <h3>Storage and data</h3>
                  <SettingToggle title="Data saver" description="Prefer lower data usage when incoming media sync is available" checked={Boolean(preferences.dataSaver)} onChange={v => updatePreference('dataSaver', v)}/>
                  <SettingToggle title="Save incoming media to gallery" description="Save received media to Photos or your device gallery when supported" checked={Boolean(preferences.saveToGallery)} onChange={v => updatePreference('saveToGallery', v)}/>
                  <div className="settings-info-row"><Download/><span><strong>Storage usage</strong><small>Review FNI's saved settings and browser storage usage</small></span><button type="button" onClick={inspectStorage}>Review</button></div>
                  {storageReport && <div className="storage-report" aria-live="polite">
                    <div><span>FNI data saved in this browser</span><strong>{storageReport.localBytes < 1024 ? storageReport.localBytes + ' B' : (storageReport.localBytes / 1024).toFixed(1) + ' KB'}</strong></div>
                    {storageReport.originUsage !== undefined && <div><span>Website storage used by this browser</span><strong>{storageReport.originUsage < 1048576 ? (storageReport.originUsage / 1024).toFixed(1) + ' KB' : (storageReport.originUsage / 1048576).toFixed(2) + ' MB'}</strong></div>}
                    {storageReport.originQuota !== undefined && <div><span>Available website storage quota</span><strong>{storageReport.originQuota < 1048576 ? (storageReport.originQuota / 1024).toFixed(1) + ' KB' : (storageReport.originQuota / 1048576).toFixed(2) + ' MB'}</strong></div>}
                    <small>Browser estimates are for this website's origin and may include data from other FNI features.</small>
                  </div>}
                  <p className="settings-footnote">These preferences are saved on this device. This preview does not yet receive other members' media, automatically download incoming photos or videos, or write directly to an iPhone or Android gallery. Those actions need connected messaging and native app support.</p>
                </div>}
                {settingsCategory === 'Devices' && <div className="settings-section">
                  <h3>Active sessions</h3><div className="settings-info-row"><Smartphone/><span><strong>This device</strong><small>Current browser session · Active now</small></span><em className="settings-status">Current</em></div>
                  <p className="settings-footnote">Telegram-style session management will show all phones, tablets and desktop sessions after FNI sign-in is connected. This preview cannot verify or revoke other devices.</p>
                </div>}
                {settingsCategory === 'Language' && <div className="settings-section">
                  <h3>{t('App language')}</h3>
                  <label className="settings-control-row"><span><strong>{t('Language')}</strong><small>{t('Choose the language used across FNI')}</small></span>
                    <select value={String(preferences.language)} onChange={e => updatePreference('language', e.target.value)}>
                      <option value="Automatic">Automatic ({detectedLanguage})</option><option value="English">English</option><option value="French">Français</option><option value="Twi">Twi</option>
                    </select>
                  </label>
                  <p className="settings-footnote">{preferences.language === 'Automatic' ? 'Detected language: ' + detectedLanguage : language === 'English' ? t('English is the default interface language.') : language === 'French' ? 'La langue de l’interface est maintenant le français.' : 'Wɔde Twi kasa redi dwuma wɔ mmeae a wɔatumi akyerɛ ase.'}</p>
                  <p className="settings-footnote">{preferences.language === 'Automatic' ? 'FNI detects your browser language and selects the closest supported translation automatically.' : 'Your choice is saved on this device and stays selected after you reopen FNI.'}</p>
                </div>}
                {settingsCategory === 'FNI Community' && <div className="settings-section">
                  <h3>Forerunners Network International</h3>
                  <div className="settings-info-row"><Users/><span><strong>Cell groups</strong><small>Create groups, manage members and group privacy</small></span><button type="button" onClick={() => { setSection('Chats'); setFolder('Groups'); }}>Open</button></div>
                  <div className="settings-info-row"><CalendarDays/><span><strong>Meetings and events</strong><small>Group meetings, attendance and reminders</small></span><button type="button" onClick={() => { setSection('Chats'); setFolder('Groups'); }}>Open</button></div>
                  <div className="settings-info-row"><BookOpen/><span><strong>Sermons and spiritual resources</strong><small>Sermon notes, scriptures and devotion plans</small></span><em>FNI workspace</em></div>
                  <div className="settings-info-row"><HandHeart/><span><strong>Prayer and care</strong><small>Prayer requests and group prayer rooms</small></span><em>FNI workspace</em></div>
                  <div className="settings-info-row"><HeartHandshake/><span><strong>Giving and support</strong><small>Future secure giving options</small></span><em>Planned</em></div>
                  <div className="settings-info-row"><Bell/><span><strong>Ministry announcements</strong><small>Church-wide updates and event notices</small></span><em>Planned</em></div>
                  <p className="settings-footnote">FNI-specific tools will connect to the ministry's verified groups, events and services when the backend is ready. No giving or payment data is collected in this preview.</p>
                </div>}
                {settingsCategory === 'Help' && <div className="settings-section">
                  <h3>Support</h3><div className="settings-info-row"><CircleHelp/><span><strong>Help Centre</strong><small>Guides for chats, calls and FNI groups</small></span><em>Coming soon</em></div>
                  <div className="settings-info-row"><MessageCircle/><span><strong>Contact FNI support</strong><small>Get help with your account or the app</small></span><em>Coming soon</em></div>
                  <div className="settings-info-row"><ShieldCheck/><span><strong>Privacy policy and terms</strong><small>How FNI handles account and community data</small></span><em>To be published</em></div>
                  <div className="settings-about"><img src="/FNI-APP-2.0/fni-logo.jpg" alt="FNI logo"/><strong>FNI Connect</strong><span>Forerunners Network International</span><small>Web preview</small></div>
                </div>}
              </div>
            </div>
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
                <button className="icon-button" aria-label="Voice call" title="Start voice call" onClick={() => openCall(groupDetails[activeChat] ? 'group' : 'voice')}><PhoneCall /></button>
                <button className="icon-button" aria-label="Video call" title="Start video call" onClick={() => openCall(groupDetails[activeChat] ? 'group' : 'video')}><Video /></button>
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
                    <div className="message-bubble" onTouchStart={event => { const touch=event.touches[0]; touchStart.current={x:touch.clientX,y:touch.clientY}; }} onTouchEnd={event => { if (!touchStart.current) return; const touch=event.changedTouches[0]; const dx=touch.clientX-touchStart.current.x; const dy=touch.clientY-touchStart.current.y; if (dx>64 && Math.abs(dy)<55) { setReplyTo(message); setEditingMessage(null); setOpenMessageMenu(null); } touchStart.current=null; }}>
                      {message.forwardedFrom && <div className="forwarded-label">Forwarded from {message.forwardedFrom}</div>}
                      {message.replyTo && <div className="quoted-message">{message.replyTo}</div>}
                      {message.mediaType === 'photo' && message.mediaUrl && <img className="message-media" src={message.mediaUrl} alt={message.mediaName || 'Shared photo'} />}
                      {message.mediaType === 'video' && message.mediaUrl && <video className="message-media" src={message.mediaUrl} controls playsInline />}
                      {message.attachmentKind === 'file' && message.fileUrl && <a className="document-message-card" href={message.fileUrl} download={message.mediaName || 'FNI-file'}><FileText /><span><strong>{message.mediaName || 'Document'}</strong><small>{message.fileSize ? (message.fileSize/1024/1024).toFixed(2)+' MB' : 'File attachment'} · Download</small></span><Download /></a>}
                      {message.attachmentKind === 'scripture' && <div className="bible-verse-message"><div className="bible-verse-heading"><BookOpen size={17}/><strong>{message.scriptureReference || 'Bible verse'}</strong><span>{message.scriptureTranslation || 'KJV'}</span></div><div className="bible-numbered-sent">{message.text.split('\n').map((line,index) => { const match = line.match(/^(\d+)\s+(.+)$/); return <p key={index}>{match ? <><b>{match[1]}</b><span>{match[2]}</span></> : line}</p>; })}</div><small>Sent with FNI Bible Bot</small></div>}
                      {message.attachmentKind === 'sticker' && message.stickerData && <img className="sent-custom-sticker" src={message.stickerData} alt="Sticker" />}
                      {message.recordingDataUrl && <div className="saved-recording-card"><div><strong>{message.recordingTitle || message.mediaName || 'Meeting recording'}</strong><small>Saved recording · {message.recordingMimeType?.startsWith('audio/') ? 'Audio' : 'Video'}</small></div>{message.recordingMimeType?.startsWith('audio/') ? <audio controls src={message.recordingDataUrl}/> : <video controls playsInline src={message.recordingDataUrl}/>}</div>}
                      {message.attachmentKind && message.attachmentKind !== 'file' && message.attachmentKind !== 'scripture' && <div className={'structured-attachment-card '+message.attachmentKind}><strong>{message.mediaName || message.attachmentKind}</strong><small>{message.attachmentKind === 'poll' ? 'Poll' : message.attachmentKind === 'location' ? 'Location shared' : message.attachmentKind === 'contact' ? 'Contact card' : message.attachmentKind === 'meeting' ? 'Meeting invitation' : message.attachmentKind === 'prayer' ? 'Prayer request' : 'Scripture'}</small></div>}
                      {message.text && message.attachmentKind !== 'scripture' && <div>{message.text.split(/(@[\w.]+)/g).map((part, index) => part.startsWith('@') ? <button type="button" className="message-mention" key={index} onClick={() => { if (part.toLowerCase() === '@fnibiblebot') { setBibleReferenceInput(''); setBibleLookupResult(null); setBibleLookupError(''); setBibleBotOpen(true); } }}>{part}</button> : part)}</div>}<span className={preferences.showMessageTimestamps ? '' : 'message-meta-hidden'}>{message.edited ? 'edited · ' : ''}{message.time} <b>✓✓</b></span>
                      {message.reactions && message.reactions.length > 0 && <div className="message-reactions">{message.reactions.map((emoji) => <button key={emoji} onClick={() => addReaction(message.id, emoji)}>{emoji}</button>)}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(replyTo || editingMessage) && <div className="reply-preview"><div><strong>{editingMessage ? 'Editing message' : 'Replying to message'}</strong><span>{editingMessage ? editingMessage.text : replyTo?.text}</span></div><button onClick={() => { setReplyTo(null); setEditingMessage(null); setDraft(editingMessage ? draftBeforeEdit : draft); }} aria-label="Cancel reply"><X size={17} /></button></div>}
            {pendingAttachments.length > 0 && <div className="attachment-preview-sheet" role="dialog" aria-label="Review attachments">
              <div className="attachment-preview-heading"><strong>Review attachments</strong><button type="button" aria-label="Close preview" onClick={() => { setPendingAttachments([]); setAttachmentCaption(''); }}><X /></button></div>
              <div className="attachment-preview-items">{pendingAttachments.map((file,index) => <div className="attachment-preview-item" key={index}>
                {file.type.startsWith('image/') ? <img src={attachmentPreviewUrls[index] || ''} alt={file.name} /> : file.type.startsWith('video/') ? <video src={attachmentPreviewUrls[index] || ''} controls playsInline /> : <FileText />}
                <span>{file.name}<small>{(file.size/1024/1024).toFixed(2)} MB</small></span>
                <button type="button" aria-label={'Remove '+file.name} onClick={() => setPendingAttachments((current) => current.filter((_,i)=>i!==index))}>×</button>
              </div>)}</div>
              <textarea value={attachmentCaption} onChange={(event)=>setAttachmentCaption(event.target.value)} placeholder="Add a caption..." rows={2}/>
              <div className="attachment-preview-footer"><span>{pendingAttachments.length} item{pendingAttachments.length===1?'':'s'} selected</span><button type="button" onClick={sendPendingAttachments}>Send</button></div>
            </div>}
            {(bibleBotOpen || bibleCommand) && <div className="bible-bot-panel">
              <div className="bible-bot-title"><BookOpen size={18}/><div><strong>FNI Bible Bot</strong><small>Find a verse and send it to this chat</small></div><button type="button" className="icon-button" aria-label="Close Bible Bot" onClick={() => { setBibleBotOpen(false); setBibleReferenceInput(''); setBibleLookupResult(null); setBibleLookupError(''); }}><X size={16}/></button></div>
              <div className="bible-bot-controls">
                <input type="text" value={bibleBotOpen ? bibleReferenceInput : (bibleCommand?.[1]?.trim() || bibleReferenceInput)} onChange={(event) => { setBibleReferenceInput(event.target.value); setBibleLookupResult(null); setBibleLookupError(''); }} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} placeholder="Enter a reference, e.g. John 3:16" aria-label="Bible scripture reference" />
                <select value={bibleTranslation} onChange={(event) => { setBibleTranslation(event.target.value); setBibleLookupResult(null); setBibleLookupError(''); }} aria-label="Bible translation">
                  <option value="kjv">KJV · King James Version</option><option value="nkjv">NKJV · New King James Version</option><option value="esv">ESV · English Standard Version</option><option value="niv">NIV · New International Version</option><option value="nlt">NLT · New Living Translation</option><option value="web">WEB · World English Bible</option>
                </select>
              </div>
              {bibleLookupLoading && <p className="bible-bot-searching">Searching scripture…</p>}
              {bibleLookupError && <p className="bible-bot-error">{bibleLookupError}</p>}
              {bibleLookupResult && <div className="bible-bot-result"><div><strong>{bibleLookupResult.reference}</strong><span>{bibleLookupResult.translation}</span></div>{bibleLookupResult.verses?.length ? <div className="bible-numbered-verses">{bibleLookupResult.verses.map(item => <p key={item.verse}><b>{item.verse}</b><span>{item.text}</span></p>)}</div> : <p>{bibleLookupResult.text}</p>}<button type="button" onClick={sendBibleVerseToGroup}>Tap to send to chat</button></div>}
            </div>}
            <div className="message-composer">
              <div className="attachment-menu-wrap">
                <button type="button" className="composer-icon attachment-trigger" aria-label="Attach" title="Attach" aria-expanded={attachmentMenuOpen} onClick={() => { setAttachmentMenuOpen((open) => !open); setEmojiOpen(false); setStickerOpen(false); }}><Paperclip /></button>
                {attachmentMenuOpen && <div className="attachment-menu" role="menu">
                  <button type="button" onClick={() => attachmentInput.current?.click()}><Image /><span>Gallery<small>Photos and videos</small></span></button>
                  <button type="button" onClick={() => cameraInput.current?.click()}><Camera /><span>Camera<small>Take a photo or video</small></span></button>
                  <button type="button" onClick={() => fileInput.current?.click()}><FileText /><span>File<small>Documents and other files</small></span></button>
                  <button type="button" onClick={shareCurrentLocation}><MapPin /><span>Location<small>Share current location</small></span></button>
                  <button type="button" onClick={shareContact}><Contact /><span>Contact<small>Share contact details</small></span></button>
                  <button type="button" onClick={createLocalPoll}><BarChart3 /><span>Poll<small>Create a question</small></span></button>
                  <button type="button" onClick={() => { const title=window.prompt('Meeting title'); if(title?.trim()) sendAttachmentText('meeting','FNI Meeting',title.trim()+'\nMeeting invitation draft — online meeting details can be added when FNI meetings are connected.'); }}><CalendarPlus /><span>Meeting<small>Share a meeting invitation</small></span></button>
                  <button type="button" onClick={() => { const prayer=window.prompt('Write a prayer request'); if(prayer?.trim()) sendAttachmentText('prayer','Prayer request',prayer.trim()); setAttachmentMenuOpen(false); }}><HandHeart /><span>Prayer<small>Share a prayer request</small></span></button>
                  <button type="button" onClick={() => { setBibleBotOpen(true); setBibleReferenceInput(''); setBibleLookupResult(null); setBibleLookupError(''); setAttachmentMenuOpen(false); }}><BookOpen /><span>Scripture<small>Find and share a Bible verse</small></span></button>
                </div>}
              </div>
              <input ref={attachmentInput} className="attachment-input" type="file" accept="image/*,video/*" multiple onChange={(event) => { if(event.target.files) queueAttachments(event.target.files); event.target.value = ''; }} />
              <input ref={cameraInput} className="attachment-input" type="file" accept="image/*,video/*" capture="environment" onChange={(event) => { if(event.target.files) queueAttachments(event.target.files); event.target.value = ''; }} />
              <input ref={fileInput} className="attachment-input" type="file" multiple onChange={(event) => { if(event.target.files) queueAttachments(event.target.files); event.target.value = ''; }} />
              <div className="composer-input-wrap">
                <textarea value={draft} onChange={(event) => { setDraft(event.target.value); const tail = event.target.value.split(/\s/).pop() || ''; setMentionOpen(Boolean(preferences.mentionSuggestions) && tail.startsWith('@') && tail.length > 0); }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && preferences.enterToSend) { event.preventDefault(); sendMessage(); } if (event.key === 'Escape') { setMentionOpen(false); setEmojiOpen(false); setStickerOpen(false); } }} placeholder="Message" rows={1} />
                {mentionOpen && activeChat && <div className="mention-suggestions">{'FNIBibleBot'.toLowerCase().includes((draft.split(/\s/).pop() || '').slice(1).toLowerCase()) && <button type="button" onClick={() => { setDraft((current) => current.replace(/@[\w.]*$/, '@FNIBibleBot ')); setBibleReferenceInput(''); setBibleLookupResult(null); setBibleLookupError(''); setBibleBotOpen(true); setMentionOpen(false); }}>{'@FNIBibleBot'}<span>Search and share scripture</span></button>}{(groupDetails[activeChat]?.members || [activeChat]).filter(member => member.toLowerCase().includes((draft.split(/\s/).pop() || '').slice(1).toLowerCase())).map(member => <button type="button" key={member} onClick={() => { setDraft((current) => current.replace(/@[\w.]*$/, `@${member.replace(/^@/, '')} `)); setMentionOpen(false); }}>{member}<span>{groupDetails[activeChat] ? 'Member of this group' : 'Chat contact'}</span></button>)}</div>}
              </div>
              <div className="emoji-picker-wrap">
                <button type="button" className="composer-icon emoji-button" aria-label="Emoji" title="Emoji" onClick={() => { setStickerOpen(false); setEmojiOpen((open) => !open); }}><Smile /></button>
                {emojiOpen && <div className="emoji-picker" aria-label="Full emoji picker"><div className="emoji-category-tabs">{Object.keys(EMOJI_CATEGORIES).map(category => <button type="button" key={category} className={emojiCategory===category?'active':''} onClick={() => setEmojiCategory(category)}>{category}</button>)}</div><div className="emoji-grid">{(EMOJI_CATEGORIES[emojiCategory] || EMOJI_CATEGORIES.Smileys).map((emoji,index) => <button type="button" key={emoji+'-'+index} onClick={() => addEmoji(emoji)}>{emoji}</button>)}</div></div>}
              </div>
              <div className="emoji-picker-wrap sticker-picker-wrap">
                <button type="button" className="composer-icon sticker-button" aria-label="Stickers" title="Stickers" onClick={() => { setEmojiOpen(false); setStickerOpen((open) => !open); }}><Sticker /></button>
                {stickerOpen && <div className="sticker-picker" aria-label="Sticker picker"><div className="sticker-picker-heading"><strong>Your stickers</strong><button type="button" onClick={() => stickerInput.current?.click()}>＋ Create</button><input ref={stickerInput} type="file" accept="image/*" hidden onChange={event => { createCustomSticker(event.target.files?.[0]); event.currentTarget.value=''; }} /></div><div className="sticker-grid">{customStickers.map((sticker,index) => <button type="button" key={index} onClick={() => sendCustomSticker(sticker)}><img src={sticker} alt={'Custom sticker '+(index+1)} /></button>)}{['🙏','❤️','🙌','👏','😊','😂','🔥','💙','✨','🎉','🤝','🥹'].map((sticker,index) => <button type="button" key={sticker+index} aria-label={sticker + ' sticker'} onClick={() => { setDraft((current) => current + (current && !current.endsWith(' ') ? ' ' : '') + sticker); setStickerOpen(false); }}>{sticker}</button>)}</div></div>}
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

      {profileEditorOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileEditorOpen(false); }}>
          <form className="new-chat-modal account-profile-editor" role="dialog" aria-modal="true" aria-label="Edit profile" onSubmit={(event) => { event.preventDefault(); saveAccountProfile(); }}>
            <div className="modal-heading"><h2>Edit profile</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setProfileEditorOpen(false)}><X/></button></div>
            <div className="account-editor-body">
              <div className="account-photo-picker"><div className="account-profile-avatar large">{profileDraft.photo ? <img src={profileDraft.photo} alt="Profile preview"/> : <span>{(profileDraft.name || 'F').slice(0,1).toUpperCase()}</span>}</div><label className="account-photo-button">Change photo<input type="file" accept="image/*" onChange={(event) => chooseProfilePhoto(event.target.files?.[0])}/></label><small>Image up to 2 MB. Stored on this device.</small></div>
              <label className="account-field">Name<input value={profileDraft.name} maxLength={60} onChange={(event) => setProfileDraft((current) => ({...current,name:event.target.value}))} placeholder="Your name"/></label>
              <label className="account-field">Username<input value={profileDraft.username} maxLength={32} onChange={(event) => setProfileDraft((current) => ({...current,username:event.target.value.replace(/[^a-zA-Z0-9_]/g,'')}))} placeholder="Choose a username"/></label>
              <label className="account-field">Bio<textarea value={profileDraft.bio} maxLength={160} rows={3} onChange={(event) => setProfileDraft((current) => ({...current,bio:event.target.value}))} placeholder="A little about you"/></label>
            </div>
            <div className="account-editor-actions"><button type="button" onClick={() => setProfileEditorOpen(false)}>Cancel</button><button type="submit">Save changes</button></div>
          </form>
        </div>
      )}
      {securityInfoOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSecurityInfoOpen(false); }}>
          <section className="new-chat-modal account-security-info" role="dialog" aria-modal="true" aria-label="Two-step verification">
            <div className="modal-heading"><h2>Two-step verification</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setSecurityInfoOpen(false)}><X/></button></div>
            <p>Two-step verification will require an additional password or verification step when signing in to your FNI account.</p>
            <p className="settings-footnote">It cannot be securely activated in this browser-only preview. FNI must first have account authentication, secure credential storage, recovery flows and server-side verification.</p>
            <div className="account-editor-actions"><button type="button" onClick={() => setSecurityInfoOpen(false)}>Close</button></div>
          </section>
        </div>
      )}
      {chatInfoOpen && activeChat && (
        <div className="modal-backdrop chat-info-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setChatInfoOpen(false); }}>
          <section className="chat-info-modal" role="dialog" aria-modal="true" aria-label="Chat information">
            <div className="modal-heading"><h2>Chat information</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setChatInfoOpen(false)}><X /></button></div>
            <div className="chat-info-profile"><div className="chat-info-avatar">{(groupDetails[activeChat]?.name || activeChat.replace('@','')).slice(0,1).toUpperCase()}</div><strong>{groupDetails[activeChat]?.name || activeChat}</strong><span>{groupDetails[activeChat] ? 'FNI group' : 'FNI member'}</span>{groupDetails[activeChat]?.description && <p className="group-description">{groupDetails[activeChat].description}</p>}</div>
            {groupDetails[activeChat] && groupDetails[activeChat].createdBy === 'You' && (
              <section className="group-members-section group-privacy-settings">
                <div className="shared-media-heading"><strong>Group permissions</strong><span>Admin controls</span></div>
                <label className="attendance-member-option"><input type="checkbox" checked={groupDetails[activeChat].discoverable !== false} onChange={(event) => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], discoverable: event.target.checked } }))} /><span>Show this group in group search</span></label>
                <label className="attendance-member-option"><input type="checkbox" checked={groupDetails[activeChat].allowMembersToJoin !== false} onChange={(event) => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], allowMembersToJoin: event.target.checked } }))} /><span>Allow people to join using a link or search</span></label>
                <label className="attendance-member-option"><input type="checkbox" checked={groupDetails[activeChat].requireJoinApproval === true} onChange={(event) => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], requireJoinApproval: event.target.checked } }))} /><span>Approve new member requests</span></label>
                <div className="group-invite-link"><span>Invite code: <strong>{groupDetails[activeChat].inviteCode || 'Not generated'}</strong></span><button type="button" onClick={() => { const code = groupDetails[activeChat].inviteCode || ''; const link = window.location.origin + window.location.pathname + '?join=' + code; if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link); }}>Copy invite link</button></div>
                <p className="group-insights-note">These controls are saved in this preview. Search discovery, invite validation and join requests will work across accounts once FNI has its backend.</p>
              </section>
            )}
            {groupDetails[activeChat] && groupDetails[activeChat].createdBy === 'You' && (
              <section className="group-members-section group-join-requests">
                <div className="shared-media-heading"><strong>Join requests</strong><span>{groupJoinRequests.filter((request) => request.groupId === activeChat && request.status === 'Pending').length} pending</span></div>
                {groupJoinRequests.filter((request) => request.groupId === activeChat && request.status === 'Pending').length ? groupJoinRequests.filter((request) => request.groupId === activeChat && request.status === 'Pending').map((request) => <div className="group-join-request-row" key={request.id}><div><strong>{request.requester}</strong><time>{request.createdAt}</time></div><button type="button" onClick={() => { setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], members: Array.from(new Set([...(current[activeChat].members || []), request.requester])) } })); setGroupJoinRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: 'Approved' } : item)); }}>Approve</button><button type="button" onClick={() => setGroupJoinRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: 'Declined' } : item))}>Decline</button></div>) : <p className="group-members-empty">No pending join requests.</p>}
              </section>
            )}
            {groupDetails[activeChat] && (
              <div className="group-members-section">
                <div className="shared-media-heading"><strong>Members</strong><span>{groupDetails[activeChat].members?.length || 0}</span></div>
                {groupDetails[activeChat].createdBy === 'You' && <form className="group-member-add" onSubmit={(event) => {
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
                </form>}
                {(groupDetails[activeChat].members || []).length > 0 ? (
                  <div className="group-member-list">
                    {(groupDetails[activeChat].members || []).map((member) => (
                      <div className="group-member-row" key={member}>
                        <span className="group-member-avatar">{member.slice(1, 2).toUpperCase()}</span>
                        <div className="group-member-identity"><strong>{member}</strong>{groupDetails[activeChat].moderators?.includes(member) && <span className="group-moderator-label">Moderator</span>}</div>
                        {groupDetails[activeChat].createdBy === 'You' && <button type="button" className="group-role-button" onClick={() => setGroupDetails((current) => ({
                          ...current,
                          [activeChat]: {
                            ...current[activeChat],
                            moderators: current[activeChat].moderators?.includes(member)
                              ? (current[activeChat].moderators || []).filter((item) => item !== member)
                              : [...(current[activeChat].moderators || []), member],
                          },
                        }))}>{groupDetails[activeChat].moderators?.includes(member) ? 'Remove role' : 'Make moderator'}</button>}
                        {groupDetails[activeChat].createdBy === 'You' && member !== 'You' && <button type="button" aria-label={'Remove ' + member} onClick={() => setGroupDetails((current) => ({
                          ...current,
                          [activeChat]: {
                            ...current[activeChat],
                            members: (current[activeChat].members || []).filter((item) => item !== member),
                            moderators: (current[activeChat].moderators || []).filter((item) => item !== member),
                          },
                        }))}>Remove</button>}
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
                  <button type="button" className="start-video-chat-button" onClick={() => openCall('group')}><Video size={17} /> Start Video Chat</button>
                  {groupDetails[activeChat].meeting?.link && <a className="external-meeting-button" href={groupDetails[activeChat].meeting.link} target="_blank" rel="noreferrer">Join external meeting</a>}
                </div>
                {groupDetails[activeChat].meeting && (() => {
                  const meeting = groupDetails[activeChat].meeting!;
                  const roster = Array.from(new Set(['You', ...(groupDetails[activeChat].members || [])]));
                  const responses = meeting.responses || {};
                  const going = Object.values(responses).filter((status) => status === 'Going').length;
                  const maybe = Object.values(responses).filter((status) => status === 'Maybe').length;
                  return <section className="group-rsvp-panel">
                    <div className="group-rsvp-heading"><strong>Attendance confirmation</strong><span>{going} going · {maybe} maybe</span></div>
                    <p>Let the group know if you can attend this meeting.</p>
                    <div className="group-rsvp-options">
                      {(['Going', 'Maybe', 'Not going'] as const).map((status) => <button type="button" key={status} className={responses.You === status ? 'active' : ''} onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, responses: { ...(current[activeChat].meeting?.responses || {}), You: status } } } }))}>{status}</button>)}
                    </div>
                    <div className="group-rsvp-roster">
                      {roster.map((member) => <div key={member}><span>{member}</span><strong className={'rsvp-status rsvp-' + (responses[member] || 'pending').toLowerCase().replace(' ', '-')}>{responses[member] || 'No response'}</strong></div>)}
                    </div>
                    <small>RSVPs are stored on this device in the preview. Live member responses and reminders require the FNI backend.</small>
                  </section>;
                })()}

                {groupDetails[activeChat].meeting && (() => {
                  const meeting = groupDetails[activeChat].meeting!;
                  const agenda = meeting.agenda || [];
                  const followUps = meeting.followUps || [];
                  return <div className="group-meeting-workspace">
                    <section className="meeting-agenda-panel">
                      <div className="shared-media-heading"><strong>Meeting agenda</strong><span>{agenda.filter((item) => item.done).length}/{agenda.length} covered</span></div>
                      <form className="meeting-inline-form" onSubmit={(event) => { event.preventDefault(); const value = meetingAgendaInput.trim(); if (!value) return; setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, agenda: [{ id: Date.now(), text: value, done: false }, ...(current[activeChat].meeting?.agenda || [])] } } })); setMeetingAgendaInput(''); }}>
                        <input value={meetingAgendaInput} onChange={(event) => setMeetingAgendaInput(event.target.value)} placeholder="Add an agenda topic" aria-label="Agenda topic" />
                        <button type="submit" disabled={!meetingAgendaInput.trim()}>Add</button>
                      </form>
                      {agenda.length ? <div className="meeting-check-list">{agenda.map((item) => <div key={item.id} className={item.done ? 'is-done' : ''}><label><input type="checkbox" checked={item.done} onChange={(event) => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, agenda: (current[activeChat].meeting?.agenda || []).map((entry) => entry.id === item.id ? { ...entry, done: event.target.checked } : entry) } } }))} /><span>{item.text}</span></label><button type="button" aria-label="Remove agenda topic" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, agenda: (current[activeChat].meeting?.agenda || []).filter((entry) => entry.id !== item.id) } } }))}>×</button></div>)}</div> : <p className="group-meeting-note">Add topics to guide your next group meeting.</p>}
                    </section>
                    <section className="meeting-minutes-panel">
                      <div className="shared-media-heading"><strong>Meeting minutes</strong><span>Group record</span></div>
                      <form onSubmit={(event) => { event.preventDefault(); const minutes = String(new FormData(event.currentTarget).get('meetingMinutes') || ''); setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, minutes } } })); }}>
                        <textarea name="meetingMinutes" rows={4} defaultValue={meeting.minutes || ''} placeholder="Record key discussions, decisions and prayer points..." />
                        <button type="submit">Save meeting notes</button>
                      </form>
                    </section>
                    <section className="meeting-followups-panel">
                      <div className="shared-media-heading"><strong>Follow-up actions</strong><span>{followUps.filter((item) => item.done).length}/{followUps.length} completed</span></div>
                      <form className="meeting-followup-form" onSubmit={(event) => { event.preventDefault(); const title = meetingActionTitle.trim(); if (!title) return; setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, followUps: [{ id: Date.now(), title, assignee: meetingActionAssignee.trim() || 'You', dueDate: meetingActionDueDate, done: false }, ...(current[activeChat].meeting?.followUps || [])] } } })); setMeetingActionTitle(''); setMeetingActionDueDate(''); }}>
                        <input value={meetingActionTitle} onChange={(event) => setMeetingActionTitle(event.target.value)} placeholder="Action to follow up" aria-label="Follow-up action" required />
                        <div><input value={meetingActionAssignee} onChange={(event) => setMeetingActionAssignee(event.target.value)} placeholder="Assign to" aria-label="Action assignee" /><input type="date" value={meetingActionDueDate} onChange={(event) => setMeetingActionDueDate(event.target.value)} aria-label="Due date" /></div>
                        <button type="submit" disabled={!meetingActionTitle.trim()}>Add action</button>
                      </form>
                      {followUps.length > 0 && <div className="meeting-check-list">{followUps.map((item) => <div key={item.id} className={item.done ? 'is-done' : ''}><label><input type="checkbox" checked={item.done} onChange={(event) => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, followUps: (current[activeChat].meeting?.followUps || []).map((entry) => entry.id === item.id ? { ...entry, done: event.target.checked } : entry) } } }))} /><span><strong>{item.title}</strong><small>{item.assignee}{item.dueDate ? ' · Due ' + new Date(item.dueDate + 'T00:00:00').toLocaleDateString() : ''}</small></span></label><button type="button" aria-label="Remove follow-up action" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: { ...current[activeChat].meeting!, followUps: (current[activeChat].meeting?.followUps || []).filter((entry) => entry.id !== item.id) } } }))}>×</button></div>)}</div>}
                    </section>
                  </div>;
                })()}
                {groupDetails[activeChat].meeting && (
                  <div className="group-meeting-summary">
                    <strong>{new Date(`${groupDetails[activeChat].meeting.date}T${groupDetails[activeChat].meeting.time || '00:00'}`).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    <span className="meeting-countdown">{(() => { const target = new Date(groupDetails[activeChat].meeting!.date + 'T' + (groupDetails[activeChat].meeting!.time || '00:00')).getTime(); const days = Math.ceil((target - Date.now()) / 86400000); return days < 0 ? 'Meeting date has passed' : days === 0 ? 'Meeting is today' : days === 1 ? 'Meeting is tomorrow' : 'In ' + days + ' days'; })()}</span>
                    <span>{groupDetails[activeChat].meeting.time || 'Time not set'}{groupDetails[activeChat].meeting.location ? ` · ${groupDetails[activeChat].meeting.location}` : ''}</span>
                    {groupDetails[activeChat].meeting.link && <a href={groupDetails[activeChat].meeting.link} target="_blank" rel="noreferrer">Join meeting</a>}
                  </div>
                )}
                {groupDetails[activeChat].createdBy === 'You' ? (
                  <form className="group-meeting-form" onSubmit={(event) => {
                    event.preventDefault();
                    if (!meetingDate || !meetingTime || !meetingTitle.trim()) return;
                    const previousMeeting = groupDetails[activeChat].meeting;
                    const nextMeeting = { title: meetingTitle.trim(), details: meetingDetails.trim(), date: meetingDate, time: meetingTime, location: meetingLocation.trim(), link: meetingLink.trim(), createdBy: 'You', responses: previousMeeting?.responses || {}, agenda: previousMeeting?.agenda || [], minutes: previousMeeting?.minutes || '', followUps: previousMeeting?.followUps || [] };
                    setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: nextMeeting } }));
                    const dateLabel = new Date(meetingDate + 'T' + meetingTime).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
                    const announcement = (previousMeeting ? 'MEETING UPDATED' : 'NEW GROUP MEETING') + '\\n' + nextMeeting.title + '\\n' + dateLabel + (nextMeeting.location ? '\\nLocation: ' + nextMeeting.location : '') + (nextMeeting.link ? '\\nJoin link: ' + nextMeeting.link : '') + (nextMeeting.details ? '\\nDetails: ' + nextMeeting.details : '');
                    const chatMessage = { id: Date.now(), text: announcement, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                    setConversations((current) => ({ ...current, [activeChat]: [...(current[activeChat] || []), chatMessage] }));
                    setMeetingNotifications((current) => [{ id: Date.now() + 1, title: (groupDetails[activeChat].name || 'Group') + ' · ' + (previousMeeting ? 'Meeting updated' : 'New meeting'), body: nextMeeting.title + ' · ' + dateLabel, time: new Date().toLocaleString(), read: false, groupId: activeChat }, ...current]);
                    setMeetingTitle(''); setMeetingDetails('');
                  }}>
                    <label>Meeting title<input value={meetingTitle} onChange={(event) => setMeetingTitle(event.target.value)} placeholder="e.g. Weekly Cell Meeting" required /></label>
                    <label>Meeting date<input type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} required /></label>
                    <label>Start time<input type="time" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} required /></label>
                    <label>Location <span className="optional-label">Optional</span><input value={meetingLocation} onChange={(event) => setMeetingLocation(event.target.value)} placeholder="e.g. UCC campus or Online" /></label>
                    <label>Meeting link <span className="optional-label">Optional</span><input type="url" value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} placeholder="https://..." /></label>
                    <label>Message to members <span className="optional-label">Optional</span><textarea value={meetingDetails} onChange={(event) => setMeetingDetails(event.target.value)} placeholder="Agenda, preparation, or other instructions" rows={3} /></label>
                    <button type="submit" disabled={!meetingTitle.trim() || !meetingDate || !meetingTime}>{groupDetails[activeChat].meeting ? 'Update & send details' : 'Create meeting & send details'}</button>
                    {groupDetails[activeChat].meeting && <button type="button" className="group-meeting-cancel" onClick={() => { setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], meeting: undefined } })); setMeetingTitle(''); setMeetingDetails(''); setMeetingDate(''); setMeetingTime(''); setMeetingLocation(''); setMeetingLink(''); }}>Cancel meeting</button>}
                  </form>
                ) : <p className="group-meeting-note">Only the group creator can schedule, update, or cancel this meeting. Members can view the details and respond to the invitation.</p>}
                <p className="group-meeting-note">Meeting details are posted into this group chat and saved on this device. Actual notifications to other members and shared live meeting rooms require the FNI backend.</p>
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-media-section">
                <div className="shared-media-heading"><strong>Group media</strong><span>{groupMedia[activeChat]?.length || 0} files</span></div>
                <label className="group-media-upload">
                  <Paperclip size={16} /> Share photos or videos
                  <input type="file" accept="image/*,video/*" multiple onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    const additions = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/')).map((file) => ({
                      id: Date.now() + Math.random(), text: file.name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      mediaUrl: URL.createObjectURL(file), mediaType: file.type.startsWith('video/') ? 'video' as const : 'photo' as const, mediaName: file.name
                    }));
                    if (additions.length) setGroupMedia((current) => ({ ...current, [activeChat]: [...additions, ...(current[activeChat] || [])] }));
                    event.currentTarget.value = '';
                  }} />
                </label>
                {(groupMedia[activeChat] || []).length ? (
                  <div className="group-media-grid">
                    {(groupMedia[activeChat] || []).map((media) => (
                      <button type="button" className="group-media-item" key={media.id} onClick={() => setSharedMediaPreview(media)} aria-label={'Preview ' + media.mediaName}>
                        {media.mediaType === 'photo' ? <img src={media.mediaUrl} alt={media.mediaName || 'Group photo'} /> : <><video src={media.mediaUrl} muted playsInline preload="metadata" /><span className="group-media-video-mark">VIDEO</span></>}
                        <span className="group-media-file-name">{media.mediaName}</span>
                      </button>
                    ))}
                  </div>
                ) : <p className="group-members-empty">Photos and videos shared with this group will appear here.</p>}
                <p className="group-meeting-note">Media is available in this browser session only. Sharing it with other members requires the FNI backend.</p>
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
            {groupDetails[activeChat] && (() => {
              const group = groupDetails[activeChat];
              const members = group.members || [];
              const records = group.attendance || [];
              const totalPossible = records.length * members.length;
              const totalPresent = records.reduce((sum, record) => sum + record.present.length, 0);
              const attendanceRate = totalPossible ? Math.round((totalPresent / totalPossible) * 100) : 0;
              const prayerRequests = group.prayerRequests || [];
              const prayedCount = prayerRequests.filter((request) => request.prayed).length;
              return <section className="group-insights-section">
                <div className="shared-media-heading"><strong>Group overview</strong><span>Local insights</span></div>
                <div className="group-insights-grid">
                  <article><span>Members</span><strong>{members.length}</strong><small>Current group size</small></article>
                  <article><span>Moderators</span><strong>{(group.moderators || []).length}</strong><small>Group leadership</small></article>
                  <article><span>Attendance</span><strong>{records.length ? attendanceRate + '%' : '—'}</strong><small>{records.length ? 'Across saved registers' : 'No records yet'}</small></article>
                  <article><span>Prayer care</span><strong>{prayerRequests.length ? prayedCount + '/' + prayerRequests.length : '—'}</strong><small>Requests prayed for</small></article>
                </div>
                <p className="group-insights-note">Insights are calculated from records saved on this device. They are not a live attendance or spiritual-growth measurement.</p>
              </section>;
            })()}
            {groupDetails[activeChat] && (
              <section className="group-goals-section">
                <div className="shared-media-heading"><strong>Group announcements</strong><span>{(groupDetails[activeChat].announcements || []).length} posts</span></div>
                <form className="group-goal-form" onSubmit={(event) => {
                  event.preventDefault();
                  const text = groupAnnouncementText.trim();
                  if (!text) return;
                  const announcement = { id: Date.now(), text, important: groupAnnouncementImportant, createdAt: new Date().toISOString() };
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], announcements: [announcement, ...(current[activeChat].announcements || [])] } }));
                  setGroupAnnouncementText(''); setGroupAnnouncementImportant(false);
                }}>
                  <textarea aria-label="Announcement message" value={groupAnnouncementText} onChange={(event) => setGroupAnnouncementText(event.target.value)} placeholder="Write an update for this group..." rows={3} maxLength={600} required />
                  <label className="attendance-member-option"><input type="checkbox" checked={groupAnnouncementImportant} onChange={(event) => setGroupAnnouncementImportant(event.target.checked)} /><span>Mark as important</span></label>
                  <button type="submit" disabled={!groupAnnouncementText.trim()}>Post announcement</button>
                </form>
                {(groupDetails[activeChat].announcements || []).length ? <div className="group-goal-list">
                  {(groupDetails[activeChat].announcements || []).map((announcement) => <article className="group-goal-card" key={announcement.id}>
                    <div className="group-goal-card-head"><strong>{announcement.important ? "Important announcement" : "Group update"}</strong><span>{new Date(announcement.createdAt).toLocaleDateString([], { day: "numeric", month: "short" })}</span></div>
                    <p>{announcement.text}</p>
                    <div className="group-goal-actions"><time>{new Date(announcement.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time><button type="button" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], announcements: (current[activeChat].announcements || []).filter((item) => item.id !== announcement.id) } }))}>Delete</button></div>
                  </article>)}
                </div> : <p className="group-members-empty">No announcements yet.</p>}
                <p className="group-insights-note">Announcements are saved on this device in the preview. Member-wide delivery and push notifications will be connected with the FNI backend.</p>
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-feature-section">
                <div className="shared-media-heading"><strong>Group polls</strong><span>{(groupDetails[activeChat].polls || []).length} polls</span></div>
                <form className="group-feature-form" onSubmit={(event) => {
                  event.preventDefault();
                  const question = pollQuestion.trim();
                  const options = pollOptionsText.split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 6);
                  if (!question || options.length < 2) return;
                  const poll = { id: Date.now(), question, options, votes: {}, createdAt: new Date().toISOString() };
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], polls: [poll, ...(current[activeChat].polls || [])] } }));
                  setPollQuestion(''); setPollOptionsText('');
                }}>
                  <input value={pollQuestion} onChange={(event) => setPollQuestion(event.target.value)} placeholder="Ask the group a question" maxLength={140} required />
                  <textarea value={pollOptionsText} onChange={(event) => setPollOptionsText(event.target.value)} placeholder={'Option 1\nOption 2\nOption 3 (optional)'} rows={3} required />
                  <button type="submit" disabled={!pollQuestion.trim() || pollOptionsText.split('\n').filter((item) => item.trim()).length < 2}>Create poll</button>
                </form>
                {(groupDetails[activeChat].polls || []).map((poll) => {
                  const voteCount = Object.keys(poll.votes || {}).length;
                  return <article className="group-feature-card" key={poll.id}>
                    <div className="group-feature-card-head"><strong>{poll.question}</strong><span>{poll.closed ? 'Closed' : voteCount + ' votes'}</span></div>
                    {poll.options.map((option) => <button type="button" className={'group-poll-option ' + (poll.votes?.You === option ? 'selected' : '')} key={option} disabled={poll.closed} onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], polls: (current[activeChat].polls || []).map((item) => item.id === poll.id ? { ...item, votes: { ...(item.votes || {}), You: option } } : item) } }))}><span>{option}</span><small>{Object.values(poll.votes || {}).filter((vote) => vote === option).length}</small></button>)}
                    <div className="group-feature-actions"><time>{new Date(poll.createdAt).toLocaleDateString()}</time><button type="button" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], polls: (current[activeChat].polls || []).map((item) => item.id === poll.id ? { ...item, closed: !item.closed } : item) } }))}>{poll.closed ? 'Reopen' : 'Close poll'}</button><button type="button" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], polls: (current[activeChat].polls || []).filter((item) => item.id !== poll.id) } }))}>Delete</button></div>
                  </article>;
                })}
                {!(groupDetails[activeChat].polls || []).length && <p className="group-members-empty">Create a poll to make group decisions together.</p>}
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-feature-section">
                <div className="shared-media-heading"><strong>Group task board</strong><span>{(groupDetails[activeChat].tasks || []).filter((task) => task.completed).length}/{(groupDetails[activeChat].tasks || []).length} done</span></div>
                <form className="group-feature-form" onSubmit={(event) => {
                  event.preventDefault(); const title = taskTitle.trim(); if (!title) return;
                  const task = { id: Date.now(), title, assignee: taskAssignee, dueDate: taskDueDate, completed: false, createdAt: new Date().toISOString() };
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], tasks: [task, ...(current[activeChat].tasks || [])] } }));
                  setTaskTitle(''); setTaskDueDate('');
                }}>
                  <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="What needs to be done?" maxLength={100} required />
                  <div className="group-feature-form-row"><select aria-label="Assign task to" value={taskAssignee} onChange={(event) => setTaskAssignee(event.target.value)}>{(groupDetails[activeChat].members || ['You']).map((member) => <option key={member} value={member}>{member}</option>)}</select><input aria-label="Task due date" type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} /></div>
                  <button type="submit" disabled={!taskTitle.trim()}>Add task</button>
                </form>
                {(groupDetails[activeChat].tasks || []).map((task) => <article className={'group-feature-card group-task-row ' + (task.completed ? 'task-done' : '')} key={task.id}>
                  <label><input type="checkbox" checked={task.completed} onChange={(event) => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], tasks: (current[activeChat].tasks || []).map((item) => item.id === task.id ? { ...item, completed: event.target.checked } : item) } }))} /><span><strong>{task.title}</strong><small>{task.assignee}{task.dueDate ? ' · Due ' + new Date(task.dueDate + 'T00:00:00').toLocaleDateString() : ''}</small></span></label>
                  <button type="button" aria-label="Remove task" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], tasks: (current[activeChat].tasks || []).filter((item) => item.id !== task.id) } }))}>Remove</button>
                </article>)}
                {!(groupDetails[activeChat].tasks || []).length && <p className="group-members-empty">Plan practical group activities and assign responsibilities.</p>}
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-feature-section">
                <div className="shared-media-heading"><strong>Shared resources</strong><span>{(groupDetails[activeChat].resources || []).length} links</span></div>
                <form className="group-feature-form" onSubmit={(event) => {
                  event.preventDefault(); const title = resourceTitle.trim(); const url = resourceUrl.trim(); if (!title || !url) return;
                  const resource = { id: Date.now(), title, url, category: resourceCategory, createdAt: new Date().toISOString() };
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], resources: [resource, ...(current[activeChat].resources || [])] } }));
                  setResourceTitle(''); setResourceUrl('');
                }}>
                  <input value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} placeholder="Resource title" maxLength={100} required />
                  <input type="url" value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} placeholder="https://..." required />
                  <div className="group-feature-form-row"><select value={resourceCategory} onChange={(event) => setResourceCategory(event.target.value)}><option>Sermon</option><option>Scripture study</option><option>Worship</option><option>Document</option><option>Other</option></select><button type="submit" disabled={!resourceTitle.trim() || !resourceUrl.trim()}>Save resource</button></div>
                </form>
                {(groupDetails[activeChat].resources || []).map((resource) => <article className="group-feature-card group-resource-row" key={resource.id}><div><strong>{resource.title}</strong><small>{resource.category} · {new Date(resource.createdAt).toLocaleDateString()}</small><a href={resource.url} target="_blank" rel="noreferrer">{resource.url}</a></div><button type="button" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], resources: (current[activeChat].resources || []).filter((item) => item.id !== resource.id) } }))}>Remove</button></article>)}
                {!(groupDetails[activeChat].resources || []).length && <p className="group-members-empty">Keep useful sermon, study and ministry links together.</p>}
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-feature-section">
                <div className="shared-media-heading"><strong>Weekly devotion plan</strong><span>{(groupDetails[activeChat].devotionPlans || []).length} entries</span></div>
                <form className="group-feature-form" onSubmit={(event) => {
                  event.preventDefault(); const scripture = devotionScripture.trim(); const focus = devotionFocus.trim(); if (!scripture || !focus) return;
                  const plan = { id: Date.now(), scripture, focus, reflection: devotionReflection.trim(), createdAt: new Date().toISOString() };
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], devotionPlans: [plan, ...(current[activeChat].devotionPlans || [])] } }));
                  setDevotionScripture(''); setDevotionFocus(''); setDevotionReflection('');
                }}>
                  <input value={devotionScripture} onChange={(event) => setDevotionScripture(event.target.value)} placeholder="Scripture reference (e.g. Romans 12:1–2)" maxLength={80} required />
                  <input value={devotionFocus} onChange={(event) => setDevotionFocus(event.target.value)} placeholder="This week's spiritual focus" maxLength={120} required />
                  <textarea value={devotionReflection} onChange={(event) => setDevotionReflection(event.target.value)} placeholder="Reflection or discussion prompt (optional)" rows={2} maxLength={500} />
                  <button type="submit" disabled={!devotionScripture.trim() || !devotionFocus.trim()}>Add devotion</button>
                </form>
                {(groupDetails[activeChat].devotionPlans || []).map((plan) => <article className="group-feature-card" key={plan.id}><div className="group-feature-card-head"><strong>{plan.scripture}</strong><span>{new Date(plan.createdAt).toLocaleDateString()}</span></div><p>{plan.focus}</p>{plan.reflection && <p>{plan.reflection}</p>}<div className="group-feature-actions"><span>Weekly focus</span><button type="button" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], devotionPlans: (current[activeChat].devotionPlans || []).filter((item) => item.id !== plan.id) } }))}>Remove</button></div></article>)}
                {!(groupDetails[activeChat].devotionPlans || []).length && <p className="group-members-empty">Set a shared scripture and spiritual focus for the week.</p>}
                <p className="group-insights-note">These group tools save locally in this preview. Shared voting, task assignments and updates across members require the FNI backend.</p>
              </section>
            )}
            {groupDetails[activeChat] && (
              <section className="group-goals-section">
                <div className="shared-media-heading"><strong>Group goals & progress</strong><span>{(groupDetails[activeChat].goals || []).filter((goal) => goal.completed).length}/{(groupDetails[activeChat].goals || []).length} complete</span></div>
                <form className="group-goal-form" onSubmit={(event) => {
                  event.preventDefault();
                  const title = groupGoalTitle.trim();
                  if (!title) return;
                  const goal = { id: Date.now(), title, description: groupGoalDescription.trim(), targetDate: groupGoalDate, progress: 0, completed: false, createdAt: new Date().toISOString() };
                  setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], goals: [goal, ...(current[activeChat].goals || [])] } }));
                  setGroupGoalTitle(''); setGroupGoalDate(''); setGroupGoalDescription('');
                }}>
                  <input aria-label="Goal title" value={groupGoalTitle} onChange={(event) => setGroupGoalTitle(event.target.value)} placeholder="Add a group goal" maxLength={90} required />
                  <textarea aria-label="Goal description" value={groupGoalDescription} onChange={(event) => setGroupGoalDescription(event.target.value)} placeholder="Description (optional)" rows={2} />
                  <label>Target date<input type="date" value={groupGoalDate} onChange={(event) => setGroupGoalDate(event.target.value)} /></label>
                  <button type="submit" disabled={!groupGoalTitle.trim()}>Add goal</button>
                </form>
                {(groupDetails[activeChat].goals || []).length ? <div className="group-goal-list">
                  {(groupDetails[activeChat].goals || []).map((goal) => <article className={"group-goal-card " + (goal.completed ? "goal-completed" : "")} key={goal.id}>
                    <div className="group-goal-card-head"><strong>{goal.title}</strong><span>{goal.completed ? "Completed" : goal.progress + "%"}</span></div>
                    {goal.description && <p>{goal.description}</p>}
                    {goal.targetDate && <time>Target: {new Date(goal.targetDate + "T00:00:00").toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}</time>}
                    <div className="group-goal-progress"><span style={{ width: (goal.completed ? 100 : goal.progress) + "%" }} /></div>
                    <div className="group-goal-actions">
                      <label>Progress <select aria-label={"Progress for " + goal.title} value={goal.completed ? 100 : goal.progress} disabled={goal.completed} onChange={(event) => { const progress = Number(event.target.value); setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], goals: (current[activeChat].goals || []).map((item) => item.id === goal.id ? { ...item, progress, completed: progress === 100 } : item) } })); }}><option value={0}>0%</option><option value={25}>25%</option><option value={50}>50%</option><option value={75}>75%</option><option value={100}>100%</option></select></label>
                      <button type="button" onClick={() => setGroupDetails((current) => ({ ...current, [activeChat]: { ...current[activeChat], goals: (current[activeChat].goals || []).filter((item) => item.id !== goal.id) } }))}>Remove</button>
                    </div>
                  </article>)}
                </div> : <p className="group-members-empty">No goals yet. Add a goal to track this group’s progress.</p>}
                <p className="group-insights-note">Goals are stored on this device in the preview. Shared progress across leaders and members will require the FNI backend.</p>
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
        <div className="video-room-screen">
          <header className="video-room-topbar"><div><strong>{groupDetails[activeChat]?.name || activeChat}</strong><span>{videoRoomStarted ? (callMode === 'group' ? 'Group voice chat · Cameras optional' : callMode === 'voice' ? 'Voice call · Audio only' : 'Video call · Camera on') : callMode === 'group' ? 'Group voice chat' : callMode === 'voice' ? 'Voice call' : 'Video call'}</span></div><button type="button" aria-label="Close video chat" onClick={stopVideoRoom}><X /></button></header>
          <div className="video-room-content">
            <div className="video-room-stage">
              {videoStream && videoCameraOn && videoStream.getVideoTracks().length ? <video ref={localVideoRef} autoPlay muted playsInline className="local-video-preview" /> : <div className="video-room-avatar">{(groupDetails[activeChat]?.name || 'FNI').slice(0,1).toUpperCase()}</div>}
              <div className="video-self-label">You {videoStream ? '· Connected locally' : '· Preview'}</div>
            </div>
            {!videoRoomStarted && <div className="video-room-intro"><strong>{callMode === 'group' ? 'Start a group voice chat' : callMode === 'voice' ? 'Start a voice call' : 'Start a video call'}</strong><span>{callMode === 'group' ? 'Everyone joins with microphone audio first. Each member can turn on their camera.' : callMode === 'voice' ? 'Start with microphone audio only.' : 'Allow camera and microphone access to start video.'}</span></div>}
            {videoError && <p className="video-room-error" role="alert">{videoError}</p>}
          </div>
          <footer className="video-room-footer">
            <div className="video-room-controls">
              <button type="button" className={videoMicOn ? '' : 'control-off'} onClick={toggleVideoMic} disabled={!videoStream}>{videoMicOn ? 'Microphone' : 'Mic muted'}</button>
              <button type="button" className={videoCameraOn ? '' : 'control-off'} onClick={() => { void toggleVideoCamera(); }} disabled={!videoStream}>{videoCameraOn ? 'Camera on' : 'Turn camera on'}</button>
            </div>
            {!videoRoomStarted ? <button type="button" className="video-room-primary" onClick={startVideoRoom}>{callMode === 'group' ? 'Start Voice Chat' : callMode === 'voice' ? 'Start Voice Call' : 'Start Video Call'}</button> : <div className="video-room-live-actions"><button type="button" className={recording ? 'recording-active' : 'video-room-record'} onClick={recording ? stopRecording : startRecording}>{recording ? 'Stop recording' : 'Record meeting'}</button><button type="button" className="video-room-leave" onClick={stopVideoRoom}>Leave call</button></div>}
            {recording && <p className="video-room-recording-status">Recording: {recordingTitle}</p>}{recordingError && <p className="video-room-error" role="status">{recordingError}</p>}
            <p className="video-room-note">Recording is saved to Saved Messages on this device. Always tell participants before recording. Group calls and individual calls currently preview your local device only; live multi-person calling needs the FNI calling service.</p>
          </footer>
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
      {findGroupsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFindGroupsOpen(false); }}>
          <section className="new-chat-modal find-groups-modal" role="dialog" aria-modal="true" aria-label="Find groups">
            <div className="modal-heading"><h2>Find groups</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setFindGroupsOpen(false)}><X /></button></div>
            <label htmlFor="group-directory-search">Search public groups</label>
            <input id="group-directory-search" autoFocus value={groupDirectorySearch} onChange={(event) => setGroupDirectorySearch(event.target.value)} placeholder="Search by group name or description" />
            <div className="find-group-results">{Object.entries(groupDetails).filter(([, group]) => group.discoverable !== false && (group.name.toLowerCase().includes(groupDirectorySearch.toLowerCase()) || group.description.toLowerCase().includes(groupDirectorySearch.toLowerCase()))).map(([id, group]) => {
              const alreadyJoined = (group.members || []).includes('You');
              const pending = groupJoinRequests.some((request) => request.groupId === id && request.requester === 'You' && request.status === 'Pending');
              return <article className="find-group-result" key={id}><div className="find-group-avatar">{group.name.slice(0,1).toUpperCase()}</div><div className="find-group-result-copy"><strong>{group.name}</strong><span>{group.description || 'FNI community group'}</span><small>{(group.members || []).length} members</small></div><button type="button" disabled={alreadyJoined || pending || group.allowMembersToJoin === false} onClick={() => joinGroup(id)}>{alreadyJoined ? 'Joined' : pending ? 'Requested' : group.allowMembersToJoin === false ? 'Closed' : group.requireJoinApproval ? 'Request' : 'Join'}</button></article>;
            })}{!Object.entries(groupDetails).some(([, group]) => group.discoverable !== false && (group.name.toLowerCase().includes(groupDirectorySearch.toLowerCase()) || group.description.toLowerCase().includes(groupDirectorySearch.toLowerCase()))) && <p className="group-members-empty">No discoverable groups found.</p>}</div>
            <div className="find-group-invite"><strong>Join with an invite code</strong><form onSubmit={(event) => { event.preventDefault(); joinByInviteCode(); }}><input value={inviteCodeInput} onChange={(event) => setInviteCodeInput(event.target.value)} placeholder="Enter invite code" aria-label="Invite code" /><button type="submit" disabled={!inviteCodeInput.trim()}>Continue</button></form><p>Invite links open this panel with the group code filled in.</p></div>
            <p className="group-insights-note">This preview searches groups saved on this device. A shared public directory and cross-device invite validation require the FNI backend.</p>
          </section>
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
            <label htmlFor="group-initial-members">Add members <span className="optional-label">Optional</span></label>
            <textarea id="group-initial-members" rows={3} maxLength={600} value={groupInitialMembers} onChange={(event) => setGroupInitialMembers(event.target.value)} placeholder="Enter usernames separated by commas or new lines\n@member1, @member2" />
            <p>One group is created with everyone you add. The group appears once in Chats → Groups, with all members inside it.</p>
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

      {passcodeDialogOpen && <div className="modal-backdrop" role="presentation"><form className="new-chat-modal" role="dialog" aria-modal="true" aria-label="Passcode settings" onSubmit={event => { event.preventDefault(); if (passcodeEnabled) disablePasscode(); else savePasscode(); }}>
        <div className="modal-heading"><h2>{passcodeEnabled ? 'Manage passcode' : 'Set passcode'}</h2><button type="button" className="icon-button" aria-label="Close" onClick={() => setPasscodeDialogOpen(false)}><X/></button></div>
        {passcodeEnabled ? <><label htmlFor="fni-current-passcode">Current passcode</label><input id="fni-current-passcode" type="password" inputMode="numeric" autoComplete="current-password" maxLength={12} value={passcodeValue} onChange={event => setPasscodeValue(event.target.value.replace(/\D/g,''))} placeholder="Enter current passcode"/><button className="modal-submit" type="submit">Turn off passcode lock</button></> : <><label htmlFor="fni-new-passcode">New passcode (6–12 digits)</label><input id="fni-new-passcode" type="password" inputMode="numeric" autoComplete="new-password" maxLength={12} value={passcodeValue} onChange={event => setPasscodeValue(event.target.value.replace(/\D/g,''))} placeholder="Create passcode"/><label htmlFor="fni-confirm-passcode">Confirm passcode</label><input id="fni-confirm-passcode" type="password" inputMode="numeric" autoComplete="new-password" maxLength={12} value={passcodeConfirm} onChange={event => setPasscodeConfirm(event.target.value.replace(/\D/g,''))} placeholder="Re-enter passcode"/><button className="modal-submit" type="submit">Enable passcode lock</button></>}
        {passcodeError && <p className="settings-footnote" role="alert">{passcodeError}</p>}<p className="settings-footnote">This passcode is stored as a salted hash in this browser. Clearing browser data removes it.</p>
      </form></div>}
      {appLocked && <div className="fni-lock-screen"><div className="fni-lock-card"><img src="/FNI-APP-2.0/fni-logo.jpg" alt="FNI"/><h2>FNI is locked</h2><p>Verify it's you to continue</p>{deviceLockEnabled && <button type="button" onClick={unlockWithDevice}>Unlock with phone</button>}{passcodeEnabled && <form onSubmit={event => { event.preventDefault(); unlockApp(); }}><input autoFocus type="password" inputMode="numeric" autoComplete="current-password" maxLength={12} value={unlockValue} onChange={event => setUnlockValue(event.target.value.replace(/\D/g,''))} placeholder="FNI passcode" aria-label="FNI passcode"/><button type="submit" disabled={!unlockValue}>Unlock with passcode</button></form>}{passcodeError && <small role="alert">{passcodeError}</small>}<small>Device authentication is a local preview test. Full secure verification requires FNI account services.</small></div></div>}
    </main>
  );
}
