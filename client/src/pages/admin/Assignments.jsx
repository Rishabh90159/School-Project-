import { useEffect, useState } from 'react';
import { api } from '../../api';
import './AdminAssignments.css';

export default function AdminAssignments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', subject: '', dueDate: '', totalMarks: 100 });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => api.assignments.list().then(setList).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return alert('Title and due date required.');
    setUploading(true);
    try {
      await api.assignments.create({ ...form, file });
      setForm({ title: '', description: '', subject: '', dueDate: '', totalMarks: 100 });
      setFile(null);
      load();
    } catch (err) {
      alert(err.message || 'Create failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await api.assignments.delete(id);
      load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Assignments</h1>
      <p className="muted">Create assignments and grade submissions.</p>
      <form onSubmit={handleSubmit} className="card admin-form">
        <h3>Create assignment</h3>
        <div className="form-group">
          <label className="label">Title</label>
          <input type="text" className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="label">Description</label>
          <input type="text" className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Subject</label>
            <input type="text" className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Due date</label>
            <input type="datetime-local" className="input" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Total marks</label>
            <input type="number" className="input" min={0} value={form.totalMarks} onChange={(e) => setForm((f) => ({ ...f, totalMarks: +e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Attachment (optional)</label>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0])} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Creating...' : 'Create assignment'}</button>
      </form>
      <div className="assign-list">
        {list.map((a) => (
          <AssignmentRow key={a._id} assignment={a} onDelete={() => handleDelete(a._id)} onRefresh={load} />
        ))}
      </div>
    </div>
  );
}

function AssignmentRow({ assignment, onDelete, onRefresh }) {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSubs = () => {
    setLoading(true);
    api.assignments.submissions(assignment._id)
      .then(setSubmissions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const due = new Date(assignment.dueDate);

  return (
    <div className="card assign-row">
      <div className="assign-head">
        <div>
          <h4>{assignment.title}</h4>
          <p className="meta">Due: {due.toLocaleString()} · {assignment.totalMarks} marks</p>
        </div>
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={loadSubs}>{loading ? 'Loading...' : 'View submissions'}</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
        </div>
      </div>
      {submissions && (
        <div className="subs-section">
          {submissions.length === 0 && <p className="muted">No submissions yet.</p>}
          {submissions.map((s) => (
            <div key={s._id} className="sub-row">
              <div>
                <strong>{s.student?.name}</strong> — {s.fileName}
                {s.marks != null && <span className="badge badge-success"> {s.marks}/{assignment.totalMarks}</span>}
                {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Download</a>}
              </div>
              {s.marks == null ? (
                <GradeForm assignmentId={assignment._id} submissionId={s._id} totalMarks={assignment.totalMarks} onGraded={() => { loadSubs(); onRefresh(); }} />
              ) : (
                <span className="muted">{s.feedback}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GradeForm({ assignmentId, submissionId, totalMarks, onGraded }) {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (marks === '' || marks < 0) return;
    setGrading(true);
    try {
      await api.assignments.grade(assignmentId, { submissionId, marks: +marks, feedback });
      onGraded();
    } catch (err) {
      alert(err.message || 'Grade failed');
    } finally {
      setGrading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grade-form">
      <input type="number" className="input small" placeholder="Marks" min={0} max={totalMarks} value={marks} onChange={(e) => setMarks(e.target.value)} />
      <input type="text" className="input small" placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      <button type="submit" className="btn btn-primary btn-sm" disabled={grading}>Grade</button>
    </form>
  );
}
