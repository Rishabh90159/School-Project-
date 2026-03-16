import { useEffect, useState } from 'react';
import { api } from '../../api';
import './AdminStudents.css';

export default function AdminStudents() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '', class: '' });
  const [adding, setAdding] = useState(false);

  const load = () => api.students.list().then(setList).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.students.add(form);
      setForm({ name: '', email: '', password: '', rollNumber: '', class: '' });
      load();
    } catch (err) {
      alert(err.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this student?')) return;
    try {
      await api.students.remove(id);
      load();
    } catch (err) {
      alert(err.message || 'Failed to remove');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Students</h1>
      <p className="muted">Add or remove students.</p>
      <form onSubmit={handleAdd} className="card admin-form">
        <h3>Add student</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Name</label>
            <input type="text" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Roll number</label>
            <input type="text" className="input" value={form.rollNumber} onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Class</label>
            <input type="text" className="input" value={form.class} onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={adding}>{adding ? 'Adding...' : 'Add student'}</button>
      </form>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roll no.</th>
              <th>Class</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.rollNumber || '—'}</td>
                <td>{s.class || '—'}</td>
                <td><button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemove(s._id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
