import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import './Results.css';

export default function Results() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.results.my()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>My results</h1>
      <p className="muted">Quiz scores and performance.</p>
      <div className="results-list">
        {list.length === 0 && <p className="muted">No quiz results yet. <Link to="/quizzes">Take a quiz</Link>.</p>}
        {list.map((r) => (
          <div key={r._id} className="card result-row">
            <div>
              <h3>{r.quiz?.title}</h3>
              <p className="meta">{r.quiz?.subject} · {new Date(r.submittedAt).toLocaleDateString()}</p>
            </div>
            <div className="score">
              <strong>{r.obtainedMarks} / {r.totalMarks}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
