import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, materials: 0, quizzes: 0, assignments: 0, doubts: 0 });

  useEffect(() => {
    Promise.all([
      api.students.list(),
      api.materials.list(),
      api.quizzes.list(),
      api.assignments.list(),
      api.doubts.list(),
    ])
      .then(([students, materials, quizzes, assignments, doubts]) => {
        setStats({
          students: students.length,
          materials: materials.length,
          quizzes: quizzes.length,
          assignments: assignments.length,
          doubts: doubts.filter((d) => d.status === 'open').length,
        });
      })
      .catch(console.error);
  }, []);

  const links = [
    { to: '/admin/students', label: 'Students', count: stats.students },
    { to: '/admin/materials', label: 'Materials', count: stats.materials },
    { to: '/admin/quizzes', label: 'Quizzes', count: stats.quizzes },
    { to: '/admin/assignments', label: 'Assignments', count: stats.assignments },
    { to: '/admin/announcements', label: 'Announcements', count: '—' },
    { to: '/admin/doubts', label: 'Open doubts', count: stats.doubts },
  ];

  return (
    <div className="page">
      <h1>Admin dashboard</h1>
      <p className="muted">Manage students and content.</p>
      <div className="admin-grid">
        {links.map(({ to, label, count }) => (
          <Link key={to} to={to} className="card admin-card">
            <span className="admin-card-count">{count}</span>
            <span className="admin-card-label">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
