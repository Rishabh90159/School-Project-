import { useEffect, useState } from 'react';
import { api } from '../../api';
import './AdminDoubts.css';

export default function AdminDoubts() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [answeringId, setAnsweringId] = useState(null);

  const load = () => api.doubts.list().then(setList).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleAnswer = async (id, answerText) => {
    if (!answerText?.trim()) return;
    setAnsweringId(id);
    try {
      await api.doubts.answer(id, answerText.trim());
      setAnswers((a) => ({ ...a, [id]: '' }));
      setAnsweringId(null);
      load();
    } catch (err) {
      alert(err.message || 'Failed to post answer');
      setAnsweringId(null);
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Student doubts</h1>
      <p className="muted">Answer student questions.</p>
      <div className="doubt-list">
        {list.length === 0 && <p className="muted">No doubts.</p>}
        {list.map((d) => (
          <div key={d._id} className="card doubt-row">
            <div className="doubt-meta">
              <strong>{d.student?.name}</strong> ({d.student?.email})
              {d.subject && <span className="badge badge-muted">{d.subject}</span>}
              <span className={`badge ${d.status === 'answered' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span>
            </div>
            <p className="doubt-q">{d.question}</p>
            {d.answer ? (
              <div className="doubt-a"><strong>Your answer:</strong> {d.answer}</div>
            ) : (
              <div className="answer-form">
                <textarea className="input" rows={2} placeholder="Your answer..." value={answers[d._id] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [d._id]: e.target.value }))} />
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleAnswer(d._id, answers[d._id])} disabled={answeringId === d._id || !(answers[d._id]?.trim())}>
                  {answeringId === d._id ? 'Posting...' : 'Post answer'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
