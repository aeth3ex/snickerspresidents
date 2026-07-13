import { useEffect, useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, Newspaper } from 'lucide-react';
import {
  type NewsEntry,
  fetchNews,
  addNewsEntry,
  updateNewsEntry,
  deleteNewsEntry,
} from '../lib/supabase';
import { useI18n, type Lang } from '../i18n';

interface NewsModalProps {
  onClose: () => void;
  adminCode: string | null;
  lang: Lang;
}

export function NewsModal({ onClose, adminCode, lang }: NewsModalProps) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<NewsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const isAdmin = !!adminCode;

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitleRu, setNewTitleRu] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newBodyRu, setNewBodyRu] = useState('');
  const [newBodyEn, setNewBodyEn] = useState('');
  const [newSort, setNewSort] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleRu, setEditTitleRu] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editBodyRu, setEditBodyRu] = useState('');
  const [editBodyEn, setEditBodyEn] = useState('');
  const [editSort, setEditSort] = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNews();
      setEntries(data);
    } catch (e) { setError((e as Error).message); }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!adminCode || !newTitleRu || !newBodyRu || !newTitleEn || !newBodyEn) return;
    setSaving(true); setActionError('');
    try {
      await addNewsEntry(adminCode, newTitleRu, newTitleEn, newBodyRu, newBodyEn, newSort);
      setNewTitleRu(''); setNewTitleEn(''); setNewBodyRu(''); setNewBodyEn(''); setNewSort(0);
      setShowNewForm(false);
      await load();
    } catch (e) { setActionError((e as Error).message); }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!adminCode || !editingId) return;
    setSaving(true); setActionError('');
    try {
      await updateNewsEntry(adminCode, editingId, {
        title_ru: editTitleRu, title_en: editTitleEn, body_ru: editBodyRu, body_en: editBodyEn, sort_order: editSort,
      });
      setEditingId(null);
      await load();
    } catch (e) { setActionError((e as Error).message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!adminCode || !confirm(lang === 'ru' ? 'Удалить эту новость?' : 'Delete this news?')) return;
    setActionError('');
    try {
      await deleteNewsEntry(adminCode, id);
      await load();
    } catch (e) { setActionError((e as Error).message); }
  };

  const startEdit = (e: NewsEntry) => {
    setEditingId(e.id);
    setEditTitleRu(e.title_ru);
    setEditTitleEn(e.title_en);
    setEditBodyRu(e.body_ru);
    setEditBodyEn(e.body_en);
    setEditSort(e.sort_order);
  };

  const title = lang === 'ru' ? 'Новости сайта' : 'Site News';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-ink-850 border border-ink-600 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto scroll-thin" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-ink-700 sticky top-0 bg-ink-850 z-10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Newspaper size={18} className="text-accent-400" /> {title}
            {isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-semibold">ADMIN</span>}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ink-700 text-slate-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-4">
          {loading && <p className="text-slate-400 text-sm">{t.loading}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {actionError && <p className="text-sm mb-3 text-red-400">{actionError}</p>}

          {!isAdmin && !loading && entries.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">{lang === 'ru' ? 'Новостей пока нет' : 'No news yet'}</p>
          )}

          {isAdmin && (
            <div className="mb-4">
              <button onClick={() => setShowNewForm(!showNewForm)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors">
                <Plus size={13} /> {lang === 'ru' ? 'Новая новость' : 'New News'}
              </button>
            </div>
          )}

          {isAdmin && showNewForm && (
            <div className="mb-4 p-3 bg-ink-900 border border-ink-600 rounded-xl space-y-2">
              <input type="number" value={newSort} onChange={(e) => setNewSort(+e.target.value)} placeholder={t.sortPlaceholder} className="w-16 px-2 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-teamred-300 font-semibold">RU</label>
                  <input value={newTitleRu} onChange={(e) => setNewTitleRu(e.target.value)} placeholder={`${t.titlePlaceholder} (RU)`} className="w-full px-2 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 mb-1" />
                  <textarea value={newBodyRu} onChange={(e) => setNewBodyRu(e.target.value)} placeholder={`${t.bodyPlaceholder} (RU)`} rows={3} className="w-full px-2 py-1.5 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 resize-y" />
                </div>
                <div>
                  <label className="text-[10px] text-teamgold-300 font-semibold">EN</label>
                  <input value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} placeholder={`${t.titlePlaceholder} (EN)`} className="w-full px-2 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 mb-1" />
                  <textarea value={newBodyEn} onChange={(e) => setNewBodyEn(e.target.value)} placeholder={`${t.bodyPlaceholder} (EN)`} rows={3} className="w-full px-2 py-1.5 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 resize-y" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors disabled:opacity-50">
                  <Save size={12} /> {saving ? '...' : t.save}
                </button>
                <button onClick={() => setShowNewForm(false)} className="px-3 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-400 transition-colors">{t.cancel}</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="p-3 bg-ink-900 border border-ink-600 rounded-xl">
                {editingId === e.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="number" value={editSort} onChange={(e2) => setEditSort(+e2.target.value)} className="w-16 px-2 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-teamred-300 font-semibold">RU</label>
                        <input value={editTitleRu} onChange={(e2) => setEditTitleRu(e2.target.value)} className="w-full px-2 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 mb-1" />
                        <textarea value={editBodyRu} onChange={(e2) => setEditBodyRu(e2.target.value)} rows={4} className="w-full px-2 py-1.5 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 resize-y" />
                      </div>
                      <div>
                        <label className="text-[10px] text-teamgold-300 font-semibold">EN</label>
                        <input value={editTitleEn} onChange={(e2) => setEditTitleEn(e2.target.value)} className="w-full px-2 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 mb-1" />
                        <textarea value={editBodyEn} onChange={(e2) => setEditBodyEn(e2.target.value)} rows={4} className="w-full px-2 py-1.5 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-200 resize-y" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleUpdate} disabled={saving} className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors disabled:opacity-50">
                        <Save size={12} /> {saving ? '...' : t.save}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-400 transition-colors">{t.cancel}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{lang === 'en' ? e.title_en : e.title_ru}</span>
                      {isAdmin && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => startEdit(e)} className="p-1 rounded hover:bg-ink-700 text-slate-400 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => handleDelete(e.id)} className="p-1 rounded hover:bg-red-900 text-slate-400 hover:text-red-300 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{lang === 'en' ? e.body_en : e.body_ru}</p>
                    <p className="mt-1.5 text-[10px] text-slate-600">{new Date(e.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
