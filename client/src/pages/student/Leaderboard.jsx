import { useEffect, useState } from 'react';
import { api } from '../../api';
import './Leaderboard.css';

export default function Leaderboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.results.leaderboard()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Leaderboard</h1>
      <p className="muted">Top performers by total quiz marks.</p>
      <div className="leaderboard-table card">
        {list.length === 0 && <p className="muted">No data yet. Attempt quizzes to appear here.</p>}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Roll no.</th>
              <th>Quizzes</th>
              <th>Total score</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, i) => (
              <tr key={row._id}>
                <td>{i + 1}</td>
                <td>{row.name}</td>
                <td>{row.rollNumber || '—'}</td>
                <td>{row.count}</td>
                <td><strong>{row.totalObtained} / {row.totalMax}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
