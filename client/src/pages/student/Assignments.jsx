import { useEffect, useState } from 'react';
import { api } from '../../api';
import './Assignments.css';

export default function Assignments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.assignments.list()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Assignments</h1>
      <p className="muted">View and submit assignments.</p>
      <div className="assignment-list">
        {list.length === 0 && <p className="muted">No assignments yet.</p>}
        {list.map((a) => (
          <AssignmentCard key={a._id} assignment={a} />
        ))}
      </div>
    </div>
  );
}

function AssignmentCard({ assignment }) {
  const [detail, setDetail] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.assignments.get(assignment._id)
      .then((d) => {
        setDetail(d);
        if (d.submission) setDone(true);
      })
      .catch(console.error);
  }, [assignment._id]);

  const due = new Date(assignment.dueDate);
  const isOverdue = due < new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file');
    setSubmitting(true);
    try {
      await api.assignments.submit(assignment._id, file);
      setDone(true);
      setDetail((d) => d ? { ...d, submission: { fileName: file.name } } : null);
    } catch (err) {
      alert(err.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card assignment-card">
      <div>
        <h3>{assignment.title}</h3>
        {assignment.description && <p className="muted small">{assignment.description}</p>}
        <p className="meta">
          Due: {due.toLocaleDateString()}
          {isOverdue && <span className="badge badge-warning">Overdue</span>}
        </p>
        {assignment.fileUrl && (
          <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ marginTop: '0.5rem' }}>
            Download assignment
          </a>
        )}
      </div>
      <div className="submit-section">
        {done ? (
          <span className="badge badge-success">Submitted</span>
        ) : isOverdue ? (
          <span className="badge badge-muted">Closed</span>
        ) : (
          <form onSubmit={handleSubmit} className="submit-form">
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0])} />
            <button type="submit" className="btn btn-primary" disabled={!file || submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
