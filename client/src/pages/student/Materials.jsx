import { useEffect, useState } from 'react';
import { api } from '../../api';
import './Materials.css';

export default function Materials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingId, setViewingId] = useState(null);
  const [viewError, setViewError] = useState(null);

  useEffect(() => {
    api.materials.list()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleView(m) {
    setViewError(null);
    setViewingId(m._id);
    try {
      const blob = await api.materials.getFile(m._id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setViewError(err.message || 'Failed to load file');
    } finally {
      setViewingId(null);
    }
  }

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Study materials</h1>
      <p className="muted">Download PDFs and notes.</p>
      {viewError && <p className="error-msg" style={{ color: 'var(--danger, #c00)', marginBottom: '1rem' }}>{viewError}</p>}
      <div className="material-list">
        {list.length === 0 && <p className="muted">No materials yet.</p>}
        {list.map((m) => (
          <div key={m._id} className="card material-card">
            <div className="material-info">
              <h3>{m.title}</h3>
              {m.description && <p className="muted small">{m.description}</p>}
              {(m.subject || m.topic) && (
                <p className="meta">{[m.subject, m.topic].filter(Boolean).join(' · ')}</p>
              )}
            </div>
            <div className="material-actions">
              {m.fileUrl && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleView(m)}
                    disabled={viewingId === m._id}
                  >
                    {viewingId === m._id ? 'Opening…' : 'View'}
                  </button>
                  <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    Download {m.fileName || 'File'}
                  </a>
                </>
              )}
              {m.linkUrl && (
                <a href={m.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  Open link
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
