import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import './QuizList.css';

export default function QuizList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.quizzes.list()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Quizzes</h1>
      <p className="muted">Attempt published quizzes and see your score.</p>
      <div className="quiz-list">
        {list.length === 0 && <p className="muted">No quizzes available.</p>}
        {list.map((q) => (
          <div key={q._id} className="card quiz-card">
            <div>
              <h3>{q.title}</h3>
              {q.description && <p className="muted small">{q.description}</p>}
              <p className="meta">Marks: {q.totalMarks} · Duration: {q.durationMinutes} min</p>
            </div>
            <Link to={`/quizzes/${q._id}`} className="btn btn-primary">Start quiz</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
