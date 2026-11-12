import { useMemo, useState } from 'react';
import { Images, Search, CalendarDays, ImageOff } from 'lucide-react';

type MediaItem = { id: string; title: string; body: string; category: string; createdAt: string; status?: string };

function readMedia(): MediaItem[] {
  try {
    const value = JSON.parse(localStorage.getItem('fni-ministry-media-drafts') || '[]');
    return Array.isArray(value) ? value.filter((item): item is MediaItem => item && typeof item.id === 'string' && typeof item.title === 'string') : [];
  } catch { return []; }
}

function getLink(body: string) {
  return body.match(/Media link:\\s*(https?:\\/\\/[^\\s]+)/i)?.[1] || '';
}
function getEventDate(body: string, createdAt: string) {
  const match = body.match(/Event date:\\s*([^\\n]+)/i);
  const raw = match?.[1]?.trim() || createdAt;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MediaHubWorkspace() {
  const [query, setQuery] = useState('');
  const photos = useMemo(() => readMedia().filter(item => item.category.toLowerCase() === 'photo' && getLink(item.body)).filter(item => (item.title + ' ' + item.body).toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="content media-hub-page">
    <div className="media-hub-heading">
      <div><span className="eyebrow">FORERUNNERS NETWORK INTERNATIONAL</span><h2>Media Hub</h2><p>Photos and memories from FNI programmes, services and events.</p></div>
      <div className="media-hub-mark"><Images size={24}/></div>
    </div>
    <label className="media-hub-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events and photos..." aria-label="Search Media Hub"/></label>
    {photos.length ? <div className="media-hub-grid">{photos.map(item => {
      const link = getLink(item.body);
      const caption = item.body.split('Media link:')[0].trim();
      return <article className="media-hub-card" key={item.id}>
        <a className="media-hub-image" href={link} target="_blank" rel="noreferrer" aria-label={'Open photo: '+item.title}>
          <img src={link} alt={item.title} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('media-hub-image-unavailable'); }}/>
          <span className="media-hub-image-fallback"><ImageOff size={24}/>Photo preview unavailable</span>
        </a>
        <div className="media-hub-card-copy"><h3>{item.title}</h3><span><CalendarDays size={14}/>{getEventDate(item.body,item.createdAt)}</span>{caption && <p>{caption}</p>}</div>
      </article>;
    })}</div> : <div className="media-hub-empty"><div><Images size={25}/></div><h3>{query ? 'No matching photos' : 'No photos in the hub yet'}</h3><p>{query ? 'Try another event name or search term.' : 'Photos added by the media team in FNI Ministry will appear here with their event title and date.'}</p></div>}
    <div className="media-hub-footnote">Photos are sourced from FNI Ministry → Media Library. Videos and sermons remain in their respective ministry spaces.</div>
  </div>;
}
