import { useEffect, useState } from 'react';
import { api } from '../../api';
import './Doubts.css';

export default function Doubts() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [posting, setPosting] = useState(false);

  const load = () => api.doubts.list().then(setList).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setPosting(true);
    try {
      await api.doubts.create({ subject: subject.trim() || undefined, question: question.trim() });
      setQuestion('');
      setSubject('');
      load();
    } catch (err) {
      alert(err.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Ask a doubt</h1>
      <p className="muted">Post your question; the teacher will answer.</p>
      <form onSubmit={handlePost} className="card doubt-form">
        <div className="form-group">
          <label className="label">Subject (optional)</label>
          <input type="text" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Math" />
        </div>
        <div className="form-group">
          <label className="label">Your question</label>
          <textarea className="input" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} required placeholder="Describe your doubt..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={posting}>{posting ? 'Posting...' : 'Post doubt'}</button>
      </form>
      <h2 className="section-title">My doubts</h2>
      <div className="doubt-list">
        {list.length === 0 && <p className="muted">No doubts yet.</p>}
        {list.map((d) => (
          <div key={d._id} className="card doubt-card">
            <div className="doubt-meta">
              {d.subject && <span className="badge badge-muted">{d.subject}</span>}
              <span className="badge badge-success">{d.status}</span>
            </div>
            <p className="doubt-q">{d.question}</p>
            {d.answer && <div className="doubt-a"><strong>Answer:</strong> {d.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
