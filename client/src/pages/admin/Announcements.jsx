import { useEffect, useState } from 'react';
import { api } from '../../api';
import './AdminAnnouncements.css';

export default function AdminAnnouncements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' });
  const [posting, setPosting] = useState(false);

  const load = () => api.announcements.list().then(setList).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setPosting(true);
    try {
      await api.announcements.create(form);
      setForm({ title: '', content: '', priority: 'normal' });
      load();
    } catch (err) {
      alert(err.message || 'Post failed');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.announcements.delete(id);
      load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Announcements</h1>
      <p className="muted">Post notices for students.</p>
      <form onSubmit={handleSubmit} className="card admin-form">
        <h3>New announcement</h3>
        <div className="form-group">
          <label className="label">Title</label>
          <input type="text" className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="label">Content</label>
          <textarea className="input" rows={4} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={posting}>{posting ? 'Posting...' : 'Post'}</button>
      </form>
      <div className="announce-list">
        {list.map((a) => (
          <div key={a._id} className="card announce-row">
            <div>
              <h4>{a.title}</h4>
              <p className="announce-content">{a.content}</p>
              <p className="meta">{new Date(a.createdAt).toLocaleString()} · {a.priority}</p>
            </div>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
