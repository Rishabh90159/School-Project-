import { useEffect, useState } from 'react';
import { api } from '../../api';
import './AdminMaterials.css';

export default function AdminMaterials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', type: 'pdf', subject: '', topic: '', linkUrl: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => api.materials.list().then(setList).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.type !== 'link' && !file) return alert('Upload a file or use type Link and set link URL');
    if (form.type === 'link' && !form.linkUrl?.trim()) return alert('Enter link URL');
    setUploading(true);
    try {
      await api.materials.add({
        ...form,
        file: form.type !== 'link' ? file : undefined,
      });
      setForm({ title: '', description: '', type: 'pdf', subject: '', topic: '', linkUrl: '' });
      setFile(null);
      load();
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    try {
      await api.materials.delete(id);
      load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Study materials</h1>
      <p className="muted">Upload PDFs or add links.</p>
      <form onSubmit={handleSubmit} className="card admin-form">
        <h3>Add material</h3>
        <div className="form-group">
          <label className="label">Title</label>
          <input type="text" className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="label">Description</label>
          <input type="text" className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="pdf">PDF / File</option>
            <option value="notes">Notes</option>
            <option value="link">Link</option>
          </select>
        </div>
        {form.type === 'link' ? (
          <div className="form-group">
            <label className="label">Link URL</label>
            <input type="url" className="input" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} />
          </div>
        ) : (
          <div className="form-group">
            <label className="label">File (PDF, DOC, TXT)</label>
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0])} />
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="label">Subject</label>
            <input type="text" className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Topic</label>
            <input type="text" className="input" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Add material'}</button>
      </form>
      <div className="material-list">
        {list.map((m) => (
          <div key={m._id} className="card material-row">
            <div>
              <h4>{m.title}</h4>
              <p className="meta">{m.subject} {m.topic && `· ${m.topic}`}</p>
            </div>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
