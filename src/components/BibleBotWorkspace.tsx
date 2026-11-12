import { useMemo, useState } from 'react';
import { BookOpen, Search, Copy, Send, ChevronDown, Bot, Languages, MessageSquareText, LoaderCircle } from 'lucide-react';

type VerseResult = { reference: string; text: string; translation: string; verses?: { book_name?: string; chapter?: number; verse?: number; text: string }[] };
type Props = { onNotice?: (message: string) => void };

const versions = [
  { id: 'kjv', name: 'King James Version (KJV)', short: 'KJV' },
  { id: 'web', name: 'World English Bible (WEB)', short: 'WEB' },
  { id: 'asv', name: 'American Standard Version (ASV)', short: 'ASV' },
  { id: 'bbe', name: 'Bible in Basic English (BBE)', short: 'BBE' },
  { id: 'darby', name: 'Darby Bible', short: 'DARBY' },
  { id: 'ylt', name: "Young's Literal Translation (YLT)", short: 'YLT' },
  { id: 'oeb-cw', name: 'Open English Bible (OEB)', short: 'OEB' },
];

const topics: Record<string, string[]> = {
  faith: ['Hebrews 11:1', 'Romans 10:17', 'Mark 11:22-24'],
  love: ['1 Corinthians 13:4-8', 'John 13:34-35', '1 John 4:7-8'],
  prayer: ['Philippians 4:6-7', '1 Thessalonians 5:17', 'Matthew 6:9-13'],
  strength: ['Isaiah 40:29-31', 'Philippians 4:13', 'Psalm 46:1'],
  hope: ['Romans 15:13', 'Jeremiah 29:11', 'Psalm 42:11'],
  forgiveness: ['Ephesians 4:32', '1 John 1:9', 'Matthew 6:14-15'],
  salvation: ['John 3:16', 'Romans 10:9-10', 'Ephesians 2:8-9'],
  wisdom: ['James 1:5', 'Proverbs 3:5-6', 'Proverbs 4:7'],
  peace: ['John 14:27', 'Isaiah 26:3', 'Philippians 4:6-7'],
  healing: ['Jeremiah 17:14', 'Psalm 103:2-3', 'James 5:14-15'],
};

export default function BibleBotWorkspace({ onNotice }: Props) {
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('kjv');
  const [result, setResult] = useState<VerseResult | null>(null);
  const [results, setResults] = useState<VerseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [compare, setCompare] = useState<VerseResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const selectedVersion = versions.find(v => v.id === version) ?? versions[0];

  const suggestions = useMemo(() => Object.keys(topics), []);

  async function lookup(reference: string, translation = version): Promise<VerseResult> {
    const clean = reference.trim().replace(/^@BibleBot\s*/i, '').replace(/^\/verse\s*/i, '');
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(clean)}?translation=${encodeURIComponent(translation)}`);
    if (!response.ok) throw new Error('That passage could not be found in this translation. Check the reference or choose another version.');
    const data = await response.json();
    if (!data.text || !data.reference) throw new Error('No passage was returned. Try a reference such as John 3:16.');
    return { reference: data.reference, text: data.text.trim(), translation: selectedVersion.short, verses: data.verses };
  }

  async function runSearch(value = query) {
    const raw = value.trim();
    if (!raw) { setError('Enter a Bible reference or a topic to search.'); return; }
    setLoading(true); setError(''); setResults([]); setCompare(null);
    try {
      const command = raw.replace(/^@BibleBot\s*/i, '').replace(/^\/(verse|search)\s*/i, '').trim();
      const topic = command.toLowerCase().replace(/^scriptures? about\s+/, '').replace(/^verses? about\s+/, '').replace(/^about\s+/, '');
      if (topics[topic]) {
        const passages = await Promise.all(topics[topic].map(ref => lookup(ref, version)));
        setResults(passages); setResult(null);
      } else {
        const found = await lookup(command, version);
        setResult(found); setResults([]);
      }
      setHistory(items => [raw, ...items.filter(item => item !== raw)].slice(0, 8));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to retrieve this passage right now.');
    } finally { setLoading(false); }
  }

  async function compareVersion() {
    if (!result) return;
    setLoading(true); setError('');
    try {
      const other = versions.find(v => v.id !== version && v.id === 'web') ?? versions[1];
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(result.reference)}?translation=${encodeURIComponent(other.id)}`);
      if (!response.ok) throw new Error('The comparison translation is currently unavailable.');
      const data = await response.json();
      setCompare({ reference: data.reference, text: String(data.text || '').trim(), translation: other.short });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to compare translations.'); }
    finally { setLoading(false); }
  }

  function share(text: string) {
    const formatted = text;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(formatted).then(() => onNotice?.('Scripture copied. You can paste it into a group or meeting chat.')).catch(() => onNotice?.('Select and copy the scripture text manually.'));
    else onNotice?.('Select and copy the scripture text manually.');
  }

  function submit() {
    const raw = query.trim();
    if (/^\/versions?$/i.test(raw)) { setShowVersions(true); setError('Choose a translation from the list below.'); return; }
    if (/^\/help$/i.test(raw)) { setError('Try @BibleBot John 3:16, /verse Psalm 23:1, or /search faith.'); return; }
    runSearch(raw);
  }

  return <div className="biblebot-workspace">
    <div className="biblebot-intro">
      <div className="biblebot-avatar"><BookOpen size={23}/></div>
      <div><span className="biblebot-eyebrow">OFFICIAL FNI BOT</span><h3>FNI Bible Bot</h3><p>Scripture lookup for your conversations and meetings.</p></div>
    </div>
    <div className="biblebot-version-row">
      <div><Languages size={16}/><span>Translation</span></div>
      <select aria-label="Bible translation" value={version} onChange={e => { setVersion(e.target.value); setResult(null); setResults([]); setCompare(null); }}>
        {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
    </div>
    <form className="biblebot-search" onSubmit={e => { e.preventDefault(); submit(); }}>
      <Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="@BibleBot John 3:16 or search faith" aria-label="Search Bible passages"/>
      <button type="submit" disabled={loading}>{loading ? <LoaderCircle size={18} className="biblebot-spin"/> : <Send size={17}/>}</button>
    </form>
    <div className="biblebot-command-hint"><code>@BibleBot John 3:16</code><code>/search faith</code><code>/versions</code><code>/help</code></div>
    {error && <div className="biblebot-error" role="alert">{error}</div>}
    {showVersions && <div className="biblebot-version-list"><strong>Available in this preview</strong>{versions.map(v => <button key={v.id} onClick={() => { setVersion(v.id); setShowVersions(false); }}>{v.name}<span>{v.short}</span></button>)}<small>Translation availability depends on the public Scripture service. More licensed versions can be added when FNI connects its backend.</small></div>}
    {result && <div className="biblebot-passage">
      <div className="biblebot-passage-head"><div><span>SCRIPTURE</span><h4>{result.reference}</h4></div><span className="biblebot-tag">{selectedVersion.short}</span></div>
      <p>{result.text}</p>
      <div className="biblebot-passage-actions"><button onClick={() => share(`${result.reference} — ${result.text} (${selectedVersion.name})`)}><Copy size={15}/> Copy / share</button><button onClick={compareVersion} disabled={loading}><Languages size={15}/> Compare WEB</button></div>
      {compare && <div className="biblebot-compare"><span>{compare.translation} · {compare.reference}</span><p>{compare.text}</p></div>}
    </div>}
    {results.length > 0 && <div className="biblebot-topic-results"><div className="biblebot-topic-heading"><strong>Passages about {query.replace(/^.*?(faith|love|prayer|strength|hope|forgiveness|salvation|wisdom|peace|healing).*$/i, '$1')}</strong><span>{results.length} passages</span></div>{results.map((item,i) => <article className="biblebot-passage compact" key={item.reference}><div className="biblebot-passage-head"><h4>{item.reference}</h4><span className="biblebot-tag">{selectedVersion.short}</span></div><p>{item.text}</p><button onClick={() => share(`${item.reference} — ${item.text} (${selectedVersion.name})`)}><Copy size={14}/> Copy passage</button></article>)}</div>}
    {!result && !results.length && !error && <div className="biblebot-empty"><div><Bot size={22}/></div><strong>What does the Bible say?</strong><p>Enter a verse reference or choose a topic. The bot retrieves the passage text from a public Bible service.</p><div className="biblebot-topics">{suggestions.map(topic => <button key={topic} onClick={() => { setQuery(`/search ${topic}`); runSearch(`/search ${topic}`); }}>{topic}</button>)}</div></div>}
    {history.length > 0 && <div className="biblebot-history"><span>RECENT SEARCHES</span>{history.slice(0,4).map(item => <button key={item} onClick={() => { setQuery(item); runSearch(item); }}><MessageSquareText size={14}/>{item}</button>)}</div>}
    <div className="biblebot-footnote">Preview mode: searches use a public Bible text service directly from this browser. Group mentions, automatic bot replies and meeting-wide delivery will be connected when the FNI backend is built. Translation coverage and licensing must be verified before public release.</div>
  </div>;
}
