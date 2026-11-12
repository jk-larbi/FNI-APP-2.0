import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, Globe, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';

type Props = { onNotice: (message: string) => void };

export default function ProfileIdentity({ onNotice }: Props) {
  const [displayName, setDisplayName] = useState('FNI Member');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profileLink, setProfileLink] = useState('');
  const [photo, setPhoto] = useState('');
  const [onlineVisible, setOnlineVisible] = useState(true);
  const [saved, setSaved] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const usernameClean = username.replace(/^@/, '').trim();
  const usernameValid = /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(usernameClean);
  const usernameMessage = !usernameClean
    ? 'Choose a public username so FNI members can find you.'
    : usernameValid
      ? 'Username format looks good. Availability will be checked when FNI accounts are connected.'
      : 'Use 5–32 characters: letters, numbers or underscores. Start with a letter.';
  const profileUrl = usernameClean ? 'fni.app/@' + usernameClean : 'fni.app/@yourusername';

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) {
      onNotice('Please enter a display name.');
      return;
    }
    if (usernameClean && !usernameValid) {
      setUsernameTouched(true);
      onNotice('Please correct the username format before saving.');
      return;
    }
    setSaved(true);
    onNotice('Profile preview saved in this browser only. Account sync and username availability checks will be enabled with the FNI backend.');
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onNotice('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onNotice('Choose a profile image smaller than 5 MB.');
      return;
    }
    setPhoto(URL.createObjectURL(file));
    setSaved(false);
  }

  return <section className="settings-detail profile-identity">
    <div className="settings-detail-head">
      <div className="setting-detail-icon"><UserRound size={20} /></div>
      <div><h3>Profile & Identity</h3><p>Manage how people recognise and find you across FNI.</p></div>
    </div>
    <form onSubmit={saveProfile}>
      <div className="profile-editor-grid">
        <div className="profile-editor-main">
          <div className="profile-photo-editor">
            <div className="large-profile-avatar">
              {photo ? <img src={photo} alt="Profile preview" /> : <span>{displayName.trim().charAt(0).toUpperCase() || 'F'}</span>}
            </div>
            <div className="photo-actions">
              <strong>Profile photo</strong><span>JPG, PNG or WEBP · up to 5 MB</span>
              <label className="profile-upload-button">Upload photo<input type="file" accept="image/*" onChange={choosePhoto} /></label>
              {photo && <button type="button" className="profile-text-button" onClick={() => setPhoto('')}>Remove photo</button>}
            </div>
          </div>

          <div className="profile-form-section">
            <div className="profile-section-heading"><div><h4>Personal information</h4><p>Your display name is shown across FNI.</p></div><span className="profile-section-tag">IDENTITY</span></div>
            <label className="profile-field"><span>Display name <b>Required</b></span><input value={displayName} onChange={e => { setDisplayName(e.target.value); setSaved(false); }} maxLength={60} placeholder="Your name" required /><small>This is the name people see in chats, calls and groups.</small></label>
            <label className="profile-field"><span>Public username</span><div className="username-input"><span>@</span><input value={usernameClean} onChange={e => { setUsername(e.target.value.replace(/^@/, '')); setSaved(false); }} onBlur={() => setUsernameTouched(true)} maxLength={32} placeholder="yourusername" autoCapitalize="none" autoCorrect="off" spellCheck={false} /></div><small className={usernameTouched && usernameClean && !usernameValid ? 'field-error' : 'field-hint'}>{usernameMessage}</small><div className="profile-link-preview"><Globe size={14} /><span>Profile link preview: <strong>{profileUrl}</strong></span></div></label>
            <label className="profile-field"><span>Bio <em>Optional</em></span><textarea value={bio} onChange={e => { setBio(e.target.value); setSaved(false); }} maxLength={160} rows={3} placeholder="A little about you, your interests or ministry..." /><small>{bio.length}/160 characters</small></label>
          </div>

          <div className="profile-form-section">
            <div className="profile-section-heading"><div><h4>Contact information</h4><p>Used for account access and recovery. Visibility is managed separately.</p></div><span className="profile-section-tag">PRIVATE BY DEFAULT</span></div>
            <label className="profile-field"><span>Phone number</span><input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setSaved(false); }} placeholder="+233 ..." /><small><LockKeyhole size={12} /> Hidden from other members unless you change Privacy settings.</small></label>
            <label className="profile-field"><span>Email address</span><input type="email" value={email} onChange={e => { setEmail(e.target.value); setSaved(false); }} placeholder="you@example.com" /><small><LockKeyhole size={12} /> Verification will be available after account services are connected.</small></label>
          </div>

          <div className="profile-form-section">
            <div className="profile-section-heading"><div><h4>Profile links</h4><p>Add a website or public link to your profile.</p></div><span className="profile-section-tag">OPTIONAL</span></div>
            <label className="profile-field"><span>Website or social link</span><input type="url" value={profileLink} onChange={e => { setProfileLink(e.target.value); setSaved(false); }} placeholder="https://example.com" /><small>Only share links you are comfortable making public.</small></label>
          </div>

          <div className="profile-form-section">
            <div className="profile-section-heading"><div><h4>Online presence</h4><p>Choose whether members can see when you are active.</p></div><span className="profile-section-tag">PRIVACY LINKED</span></div>
            <div className="profile-online-setting"><div><strong>Show online status</strong><span>This setting will also appear under Privacy & Security.</span></div><button type="button" className={onlineVisible ? 'switch on' : 'switch'} role="switch" aria-checked={onlineVisible} aria-label="Show online status" onClick={() => setOnlineVisible(v => !v)}><span /></button></div>
          </div>

          <div className="profile-save-row"><span>{saved ? 'Preview saved on this device' : 'Changes are not synced to an FNI account yet.'}</span><button className="profile-save-button" type="submit"><Check size={16} /> Save profile preview</button></div>
        </div>

        <aside className="profile-preview-column">
          <div className="profile-preview-card">
            <span className="profile-preview-label">PROFILE PREVIEW</span>
            <div className="preview-avatar">{photo ? <img src={photo} alt="" /> : <span>{displayName.trim().charAt(0).toUpperCase() || 'F'}</span>}</div>
            <h4>{displayName.trim() || 'Your display name'}</h4>
            <span className="preview-username">{usernameClean ? '@' + usernameClean : '@yourusername'}</span>
            <p>{bio || 'Your bio will appear here when you add one.'}</p>
            <div className="preview-divider" />
            <div className="preview-meta"><span><Globe size={13} /> {profileUrl}</span><span><LockKeyhole size={13} /> Phone number private</span></div>
            <div className="preview-verified"><ShieldCheck size={14} /> FNI member verification <b>Not yet available</b></div>
          </div>
          <div className="profile-guidance"><ShieldCheck size={16} /><div><strong>Your identity, your control</strong><p>Your display name is public. Phone and email remain account details, with visibility controlled separately in Privacy & Security.</p></div></div>
          <div className="profile-history-note"><h4>Profile change history</h4><p>Changes and username updates will be recorded securely once FNI account history is connected.</p></div>
        </aside>
      </div>
    </form>
  </section>;
}
