import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import './AdminQuizzes.css';

export default function AdminQuizResults() {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.results.byQuiz(quizId)
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <Link to="/admin/quizzes" className="btn btn-ghost" style={{ marginBottom: '1rem' }}>← Back to Quizzes</Link>
      <h1>Quiz results</h1>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Roll no.</th>
              <th>Score</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.student?.name}</td>
                <td>{r.student?.email}</td>
                <td>{r.student?.rollNumber || '—'}</td>
                <td><strong>{r.obtainedMarks} / {r.totalMarks}</strong></td>
                <td>{new Date(r.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
