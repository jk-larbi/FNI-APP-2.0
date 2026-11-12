import { useEffect, useMemo, useRef, useState } from 'react';
import ChatEmojiPicker from './ChatEmojiPicker';
import VoiceMessageButton from './VoiceMessageButton';
import { ArrowLeft, Bookmark, Search, Plus, Paperclip, Send, Image as ImageIcon, Video, Link2, FileText, Pin, Trash2, Download, ExternalLink, X, MoreVertical, Smile, Camera, MapPin, BarChart3, CheckSquare, Music, ChevronDown, Sticker } from 'lucide-react';

type SavedType = 'note' | 'image' | 'video' | 'document' | 'link' | 'audio' | 'message';
type SavedItem = { id: string; type: SavedType; title: string; content: string; fileName?: string; mime?: string; size: number; createdAt: string; source?: string; folderId: string; pinned: boolean; };
type SavedFolder = { id: string; name: string; };
const ITEMS_KEY = 'fni-personal-cloud-items';
const FOLDERS_KEY = 'fni-personal-cloud-folders';
const initialFolders: SavedFolder[] = [{id:'important',name:'Important'},{id:'work',name:'Work'},{id:'personal',name:'Personal'},{id:'study',name:'Study'},{id:'media',name:'Media'},{id:'documents',name:'Documents'}];
const formatBytes = (n:number) => n < 1024 ? n+' B' : n < 1048576 ? (n/1024).toFixed(1)+' KB' : (n/1048576).toFixed(1)+' MB';
const dayLabel = (value:string) => { const d=new Date(value),now=new Date(); if(d.toDateString()===now.toDateString())return 'Today'; const y=new Date(now);y.setDate(now.getDate()-1);if(d.toDateString()===y.toDateString())return 'Yesterday';return d.toLocaleDateString(undefined,{day:'numeric',month:'long',year:d.getFullYear()===now.getFullYear()?undefined:'numeric'}); };

export default function SavedMessagesWorkspace({ onBack }: { onBack?: () => void }) {
  const [items,setItems] = useState<SavedItem[]>(() => { try{return JSON.parse(localStorage.getItem(ITEMS_KEY)||'[]')}catch{return []} });
  const [folders,setFolders] = useState<SavedFolder[]>(() => { try{return JSON.parse(localStorage.getItem(FOLDERS_KEY)||'null')||initialFolders}catch{return initialFolders} });
  const [folder,setFolder] = useState('all');
  const [draft,setDraft] = useState('');
  const [query,setQuery] = useState('');
  const [searchOpen,setSearchOpen] = useState(false);
  const [attachOpen,setAttachOpen] = useState(false);
  const [folderOpen,setFolderOpen] = useState(false);
  const [newFolder,setNewFolder] = useState('');
  const [notice,setNotice] = useState('');
  const [emojiOpen,setEmojiOpen] = useState(false);
  const [mediaPickerOpen,setMediaPickerOpen] = useState(false);
  const [mediaPickerTab,setMediaPickerTab] = useState<'gallery'|'file'|'location'|'poll'|'checklist'|'audio'>('gallery');
  const [recentMedia,setRecentMedia] = useState<{url:string;type:'image'|'video';duration?:string}[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{localStorage.setItem(ITEMS_KEY,JSON.stringify(items))},[items]);
  useEffect(()=>{localStorage.setItem(FOLDERS_KEY,JSON.stringify(folders))},[folders]);
  const visible = useMemo(() => items.filter(item => (folder==='all'||item.folderId===folder) && (item.title+' '+item.content+' '+(item.fileName||'')).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime()),[items,folder,query]);
  useEffect(()=>{if(listRef.current)listRef.current.scrollTop=listRef.current.scrollHeight},[visible.length]);
  const addItem=(item:SavedItem)=>setItems(v=>[...v,item]);
  const sendMessage=()=>{const text=draft.trim();if(!text)return;addItem({id:crypto.randomUUID(),type:'message',title:'Saved message',content:text,size:new Blob([text]).size,createdAt:new Date().toISOString(),folderId:'personal',pinned:false});setDraft('');setEmojiOpen(false);if(composerRef.current)composerRef.current.style.height='auto'};
  const saveVoiceMessage=async(blob:Blob,duration:number)=>{try{const content=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob)});addItem({id:crypto.randomUUID(),type:'audio',title:'Voice message',content,fileName:'fni-voice-message.'+(blob.type.includes('mp4')?'m4a':'webm'),mime:blob.type,size:blob.size,createdAt:new Date().toISOString(),folderId:'media',pinned:false});setNotice('Voice message saved in Saved Messages on this device ('+duration+'s).')}catch{setNotice('The voice message could not be saved.')}};
  const uploadFile=async(file?:File)=>{if(!file)return;if(file.size>3*1024*1024){setNotice('Files are limited to 3 MB each in this preview.');return}try{const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file)});const type:SavedType=file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':file.type.startsWith('audio/')?'audio':'document';addItem({id:crypto.randomUUID(),type,title:file.name,content:data,fileName:file.name,mime:file.type,size:file.size,createdAt:new Date().toISOString(),folderId:type==='image'||type==='video'||type==='audio'?'media':'documents',pinned:false});setNotice('Attachment saved in this chat on this device.')}catch{setNotice('This file could not be added. Try another file.')}};
  const saveLink=()=>{const raw=window.prompt('Paste a link to save');if(!raw?.trim())return;try{const url=new URL(raw.trim());if(!['http:','https:'].includes(url.protocol))throw new Error();addItem({id:crypto.randomUUID(),type:'link',title:url.hostname,content:url.toString(),size:new Blob([url.toString()]).size,createdAt:new Date().toISOString(),folderId:'important',pinned:false})}catch{setNotice('Enter a valid link beginning with https:// or http://.')}};
  const addFolder=()=>{const name=newFolder.trim();if(!name)return;if(folders.some(f=>f.name.toLowerCase()===name.toLowerCase())){setNotice('That tag already exists.');return}const id=crypto.randomUUID();setFolders(v=>[...v,{id,name}]);setFolder(id);setNewFolder('');setFolderOpen(false)};
  const removeItem=(id:string)=>setItems(v=>v.filter(i=>i.id!==id));
  const downloadItem=(item:SavedItem)=>{if(!item.content.startsWith('data:'))return;const a=document.createElement('a');a.href=item.content;a.download=item.fileName||item.title;a.click()};
  const renderAttachment=(item:SavedItem)=>item.type==='image'?<img className="saved-chat-image" src={item.content} alt={item.title}/>:item.type==='video'?<video className="saved-chat-video" src={item.content} controls/>:item.type==='audio'?<audio className="saved-chat-audio" src={item.content} controls/>:item.type==='document'?<div className="saved-chat-file"><span><FileText size={21}/></span><div><b>{item.fileName||item.title}</b><small>{formatBytes(item.size)} · File</small></div></div>:item.type==='link'?<a className="saved-chat-link" href={item.content} target="_blank" rel="noreferrer"><span><Link2 size={18}/></span><div><b>{item.title}</b><small>{item.content}</small></div><ExternalLink size={15}/></a>:null;
  return <section className="saved-chat-shell">
    <header className="saved-chat-header">
      {onBack && <button className="saved-chat-back-button" onClick={onBack} aria-label="Back to chats"><ArrowLeft size={21}/></button>}
      <div className="saved-chat-avatar"><Bookmark size={21}/></div>
      <div className="saved-chat-identity"><b>Saved Messages</b><span>Personal chat · Only you</span></div>
      <div className="saved-chat-header-actions">
        <button aria-label="Search messages" onClick={()=>setSearchOpen(v=>!v)}><Search size={19}/></button>
        <button aria-label="Saved message options" onClick={()=>setFolderOpen(v=>!v)}><MoreVertical size={19}/></button>
      </div>
    </header>
    {searchOpen&&<div className="saved-chat-search"><Search size={17}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search messages"/><button onClick={()=>{setSearchOpen(false);setQuery('')}} aria-label="Close search"><X size={17}/></button></div>}
    {folderOpen&&<div className="saved-chat-tags">
      <button className={folder==='all'?'active':''} onClick={()=>{setFolder('all');setFolderOpen(false)}}>All messages</button>
      {folders.map(f=><button key={f.id} className={folder===f.id?'active':''} onClick={()=>{setFolder(f.id);setFolderOpen(false)}}>{f.name}</button>)}
      <button className="saved-chat-add-tag" onClick={()=>setFolderOpen(false)} aria-label="Close filters"><X size={15}/></button>
    </div>}
    {folderOpen&&<div className="saved-chat-tag-create"><input value={newFolder} onChange={e=>setNewFolder(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addFolder()} placeholder="Create a message tag"/><button onClick={addFolder}>Add tag</button><button aria-label="Close" onClick={()=>setFolderOpen(false)}><X size={16}/></button></div>}
    <div className="saved-chat-wallpaper" ref={listRef}>
      {visible.map((item,index)=>{const previous=visible[index-1];const showDay=!previous||dayLabel(previous.createdAt)!==dayLabel(item.createdAt);return <div className="saved-chat-entry" key={item.id}>{showDay&&<div className="saved-chat-day"><span>{dayLabel(item.createdAt)}</span></div>}<article className="saved-chat-bubble">{item.type==='message'||item.type==='note'?<p className="saved-chat-text">{item.content}</p>:<>{renderAttachment(item)}{item.type==='note'&&item.title!=='Saved message'&&<b className="saved-chat-note-title">{item.title}</b>}</>}<div className="saved-chat-meta">{item.pinned&&<Pin size={12}/>}<time>{new Date(item.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time><span className="saved-chat-check">✓✓</span><div className="saved-chat-message-actions"><button title={item.pinned?'Unpin':'Pin'} onClick={()=>setItems(v=>v.map(i=>i.id===item.id?{...i,pinned:!i.pinned}:i))}><Pin size={13}/></button>{item.content.startsWith('data:')&&<button title="Download" onClick={()=>downloadItem(item)}><Download size={13}/></button>}<button title="Delete" onClick={()=>removeItem(item.id)}><Trash2 size={13}/></button></div></div></article></div>})}
      {!visible.length&&<div className="saved-chat-no-results">{query?'No messages match your search.':'Your saved messages will appear here.'}</div>}
    </div>
    {mediaPickerOpen&&<div className="saved-chat-media-picker">
      <div className="saved-chat-media-picker-header"><button className="saved-chat-media-picker-close" onClick={()=>setMediaPickerOpen(false)} aria-label="Close media picker"><X size={22}/></button><button className="saved-chat-media-picker-recents"><span>Recents</span><ChevronDown size={16}/></button></div>
      <div className="saved-chat-media-picker-grid">
        <button className="saved-chat-media-thumb saved-chat-media-thumb-camera" onClick={()=>{setNotice('Camera is not available in browser preview.');}}><Camera size={26}/></button>
        {recentMedia.length>0?recentMedia.map((m,i)=><button key={i} className="saved-chat-media-thumb" onClick={()=>fileRef.current?.click()}>{m.type==='video'?<><div className="saved-chat-media-thumb-overlay"/><span className="saved-chat-media-duration">{m.duration||'0:00'}</span></>:null}<div className="saved-chat-media-thumb-select"/></button>):<div className="saved-chat-media-empty"><ImageIcon size={25}/><b>No recent media in this preview</b><span>Choose a photo, video or file from your device.</span><button onClick={()=>fileRef.current?.click()}>Browse files</button></div>}
      </div>
      <div className="saved-chat-media-picker-tabs">
        {([['gallery','Gallery',<ImageIcon size={20} key="g"/>],['file','File',<FileText size={20} key="f"/>],['location','Location',<MapPin size={20} key="l"/>],['poll','Poll',<BarChart3 size={20} key="p"/>],['checklist','Checklist',<CheckSquare size={20} key="c"/>],['audio','Audio',<Music size={20} key="a"/>]] as [string,string,React.ReactNode][]).map(([key,label,icon])=><button key={key} className={mediaPickerTab===key?'active':''} onClick={()=>{setMediaPickerTab(key as typeof mediaPickerTab);if(key==='file'){fileRef.current?.click();setMediaPickerOpen(false)}else if(key!=='gallery'){setNotice(label+' is not yet available in this preview.');setMediaPickerOpen(false)}}}>{icon}<span>{label}</span></button>)}
      </div>
    </div>}
    {emojiOpen&&<div className="saved-chat-emoji-popover"><ChatEmojiPicker onSelect={emoji=>setDraft(value=>value+emoji)}/></div>}
    <footer className="saved-chat-compose-wrap">
      <input ref={fileRef} type="file" hidden onChange={e=>{void uploadFile(e.target.files?.[0]);e.currentTarget.value='';setAttachOpen(false);setMediaPickerOpen(false)}}/>
      <button className="saved-chat-attach" aria-label="Attach media" onClick={()=>{setMediaPickerOpen(v=>!v);setAttachOpen(false)}}><Paperclip size={21}/></button>
      <div className="saved-chat-input-wrap"><textarea ref={composerRef} value={draft} rows={1} onChange={e=>{setDraft(e.target.value);e.currentTarget.style.height='auto';e.currentTarget.style.height=Math.min(e.currentTarget.scrollHeight,120)+'px'}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}}} placeholder="Message"/></div>
      <div className="saved-chat-compose-right">
        <button aria-label="Add emoji" aria-expanded={emojiOpen} onClick={()=>setEmojiOpen(v=>!v)}><Smile size={21}/></button>
        <button aria-label="Stickers" onClick={()=>setNotice('Sticker sending is available in group conversations.')}><Sticker size={21}/></button>
        <button aria-label="Camera" onClick={()=>fileRef.current?.click()}><Camera size={21}/></button>
      </div>
      {draft.trim()?<button className="saved-chat-send" aria-label="Send message" onClick={sendMessage}><Send size={19}/></button>:<VoiceMessageButton onRecorded={(blob,duration)=>{void saveVoiceMessage(blob,duration)}} onNotice={setNotice}/>}
    </footer>
    <div className="saved-chat-local-note">Saved privately on this device</div>
    {notice&&<div className="saved-chat-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={14}/></button></div>}
  </section>;
}
