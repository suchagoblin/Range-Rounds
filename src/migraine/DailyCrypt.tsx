import { useState, useEffect, useRef } from 'react';
import { Download, Settings, Clock } from 'lucide-react';

interface MedLog {
  time: string;
}

interface Entry {
  id: number;
  onset: string;
  endTime: string | null;
  intensity: number;
  medLog: MedLog | null;
  triggers: string[];
  notes: string;
}

const TRIGGERS = [
  'Weather / Pressure',
  'Sleep Deprivation',
  'Dehydration',
  'Cacophony (3 Kids / 2 Dogs)',
  'Hormones',
  'Stress',
  'Bright Lights / Screens',
  'Skipped Meal',
];

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function fmt(s: string, style: 'time' | 'date' | 'datetime'): string {
  const d = new Date(s);
  if (style === 'time') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (style === 'date') return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} @ ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function durationLabel(onset: string, endTime: string | null): string {
  if (!endTime) return 'Ongoing';
  const hrs = (new Date(endTime).getTime() - new Date(onset).getTime()) / 3_600_000;
  return hrs < 1 ? `${Math.round(hrs * 60)} min` : `${Math.round(hrs * 10) / 10} hrs`;
}

export default function DailyCrypt() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cooldownHours, setCooldownHours] = useState(4);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingEnd, setEditingEnd] = useState<number | null>(null);
  const [editEndValue, setEditEndValue] = useState('');
  const skipSave = useRef(true);

  // Form state
  const [onset, setOnset] = useState(nowLocal);
  const [endTime, setEndTime] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [tookMeds, setTookMeds] = useState(false);
  const [medTime, setMedTime] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cryptLogs');
      if (saved) setEntries(JSON.parse(saved));
      const savedCooldown = localStorage.getItem('cryptCooldown');
      if (savedCooldown) setCooldownHours(Number(savedCooldown));
    } catch { /* corrupt data — start fresh */ }
  }, []);

  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return; }
    localStorage.setItem('cryptLogs', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('cryptCooldown', cooldownHours.toString());
  }, [cooldownHours]);

  const toggleTrigger = (t: string) =>
    setSelectedTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEntries(prev => [{
      id: Date.now(),
      onset,
      endTime: endTime || null,
      intensity,
      medLog: tookMeds ? { time: medTime || nowLocal() } : null,
      triggers: selectedTriggers,
      notes: notes.trim(),
    }, ...prev]);
    setEndTime(''); setIntensity(5); setTookMeds(false);
    setMedTime(''); setSelectedTriggers([]); setNotes('');
    setOnset(nowLocal());
  };

  const markEnded = (id: number) => {
    if (!editEndValue) return;
    setEntries(prev => prev.map(e => e.id === id ? { ...e, endTime: editEndValue } : e));
    setEditingEnd(null);
  };

  const deleteEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setConfirmDelete(null);
  };

  const getMedStatus = () => {
    const withMeds = entries.filter(e => e.medLog);
    if (!withMeds.length) return null;
    const lastMed = Math.max(...withMeds.map(e => new Date(e.medLog!.time).getTime()));
    const nextSafe = lastMed + cooldownHours * 3_600_000;
    const now = Date.now();
    if (now < nextSafe) {
      const hoursLeft = ((nextSafe - now) / 3_600_000).toFixed(1);
      const safeAt = new Date(nextSafe).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { safe: false, hoursLeft, safeAt };
    }
    return { safe: true };
  };

  const exportCSV = () => {
    if (!entries.length) return;
    const headers = ['Date', 'Time', 'End Time', 'Duration', 'Intensity (1-10)', 'Medication Time', 'Triggers', 'Notes'];
    const rows = entries.map(e => [
      new Date(e.onset).toLocaleDateString(),
      fmt(e.onset, 'time'),
      e.endTime ? fmt(e.endTime, 'time') : '',
      durationLabel(e.onset, e.endTime),
      e.intensity,
      e.medLog ? fmt(e.medLog.time, 'time') : '',
      e.triggers.length ? `"${e.triggers.join('; ')}"` : '',
      `"${e.notes}"`,
    ].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `Crypt_Logs_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const medStatus = getMedStatus();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-serif safe-area-pad">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6 pb-16">

        {/* Header */}
        <div className="text-center border-b border-purple-900 pb-4">
          <h1 className="text-4xl font-bold text-purple-500 tracking-wider">The Daily Crypt</h1>
          <p className="text-slate-500 italic mt-1 text-sm">Chronicles of Cranial Torment</p>
        </div>

        {/* Medication Status */}
        {medStatus && !medStatus.safe && (
          <div className="p-4 rounded-lg border bg-red-950 border-red-800 text-red-400 animate-pulse text-center">
            <p className="font-bold">☠️ Blood Toxicity High — wait {medStatus.hoursLeft} hrs</p>
            <p className="text-sm mt-1">Safe to consume at: {medStatus.safeAt}</p>
          </div>
        )}
        {medStatus?.safe && (
          <div className="p-3 rounded-lg border bg-green-950 border-green-800 text-green-400 text-center text-sm">
            🧪 Safe to consume elixirs if the agony persists.
          </div>
        )}

        {/* Log Form */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-2xl shadow-purple-900/20">
          <h2 className="text-xl text-purple-400 mb-4 font-semibold border-b border-slate-700 pb-2">Log a Curse</h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">

            <div>
              <label className="block text-slate-400 mb-1">Onset of Doom</label>
              <input type="datetime-local" value={onset} onChange={e => setOnset(e.target.value)} required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                End Time <span className="text-slate-600 text-xs">(leave blank if still suffering)</span>
              </label>
              <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="block text-slate-400 mb-2">
                Agony Level: <span className="text-purple-400 font-bold text-base">{intensity}</span>
                <span className="text-slate-600">/10</span>
              </label>
              <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))}
                className="w-full accent-purple-600" />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>Mild annoyance</span><span>Existential dread</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Curse Catalysts</label>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map(t => (
                  <button key={t} type="button" onClick={() => toggleTrigger(t)}
                    className={`px-3 py-2 rounded-full text-xs font-bold border transition-colors ${
                      selectedTriggers.includes(t)
                        ? 'bg-purple-900 border-purple-500 text-purple-100'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-700 cursor-pointer">
                <input type="checkbox" checked={tookMeds} onChange={e => setTookMeds(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 flex-shrink-0" />
                <span className="text-slate-300 font-medium">Consumed Elixir (Medication)</span>
              </label>
              {tookMeds && (
                <div>
                  <label className="block text-slate-500 mb-1 text-xs">Elixir consumed at (defaults to now)</label>
                  <input type="datetime-local" value={medTime} onChange={e => setMedTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Notes <span className="text-slate-600 text-xs">(optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Any other dark omens..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none placeholder-slate-700 resize-none" />
            </div>

            <button type="submit"
              className="w-full bg-purple-900 hover:bg-purple-800 active:bg-purple-700 text-purple-100 font-bold py-3.5 rounded-lg transition border border-purple-700 text-base">
              Seal in the Catacombs
            </button>
          </form>
        </div>

        {/* Archives */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl text-purple-400 font-semibold">The Archives</h2>
            <button onClick={() => setShowSettings(s => !s)}
              className="text-slate-500 hover:text-purple-400 flex items-center gap-1 text-sm p-1">
              <Settings size={15} /> Settings
            </button>
          </div>

          {showSettings && (
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 mb-4 space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 text-sm">Potion Cooldown (Hours)</label>
                <input type="number" value={cooldownHours} min={1} max={24}
                  onChange={e => setCooldownHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200" />
              </div>
              <button onClick={exportCSV}
                className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <Download size={14} /> Export Grimoire to CSV
              </button>
            </div>
          )}

          <div className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-slate-600 italic text-center py-10">The crypt is currently empty.</p>
            ) : entries.map(entry => (
              <div key={entry.id} className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-purple-300">{fmt(entry.onset, 'datetime')}</div>
                    <div className="text-sm text-slate-400 mt-1 flex flex-wrap gap-3">
                      <span>🌪️ {entry.intensity}/10</span>
                      <span>⏳ {durationLabel(entry.onset, entry.endTime)}</span>
                    </div>

                    {entry.triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.triggers.map(t => (
                          <span key={t} className="text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-500">{t}</span>
                        ))}
                      </div>
                    )}

                    {entry.medLog && (
                      <p className="text-sm text-green-500/80 mt-2 border-t border-slate-800 pt-2">
                        🧪 Elixir at {fmt(entry.medLog.time, 'time')}
                      </p>
                    )}

                    {entry.notes && (
                      <p className="text-xs text-slate-500 mt-2 italic">{entry.notes}</p>
                    )}

                    {!entry.endTime && editingEnd !== entry.id && (
                      <button onClick={() => { setEditingEnd(entry.id); setEditEndValue(nowLocal()); }}
                        className="text-xs text-slate-600 hover:text-purple-400 mt-2 flex items-center gap-1">
                        <Clock size={11} /> Mark as ended
                      </button>
                    )}

                    {editingEnd === entry.id && (
                      <div className="mt-2 flex gap-2 items-center">
                        <input type="datetime-local" value={editEndValue} onChange={e => setEditEndValue(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-purple-500 outline-none" />
                        <button onClick={() => markEnded(entry.id)}
                          className="text-xs bg-purple-900 border border-purple-700 text-purple-200 px-3 py-2 rounded-lg">Save</button>
                        <button onClick={() => setEditingEnd(null)} className="text-slate-600 text-lg px-1">×</button>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {confirmDelete === entry.id ? (
                      <div className="flex flex-col gap-1 items-end text-xs">
                        <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-300 font-bold">delete</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-slate-600 hover:text-slate-400">cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(entry.id)}
                        className="text-slate-700 hover:text-red-500 text-2xl leading-none px-1 py-0.5">×</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
