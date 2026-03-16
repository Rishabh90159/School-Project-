import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import './AdminQuizzes.css';

export default function AdminQuizzes() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    totalMarks: 10,
    durationMinutes: 30,
    questions: [{ question: '', options: ['', ''], correctIndex: 0, marks: 1 }],
  });
  const [saving, setSaving] = useState(false);

  const load = () => api.quizzes.list().then(setList).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const addQuestion = () => setForm((f) => ({ ...f, questions: [...f.questions, { question: '', options: ['', ''], correctIndex: 0, marks: 1 }] }));
  const updateQuestion = (idx, field, value) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    }));
  };
  const updateOption = (qIdx, oIdx, value) => {
    setForm((f) => {
      const q = f.questions[qIdx];
      const opts = [...(q.options || [])];
      opts[oIdx] = value;
      return { ...f, questions: f.questions.map((q, i) => (i === qIdx ? { ...q, options: opts } : q)) };
    });
  };
  const addOption = (qIdx) => {
    setForm((f) => {
      const q = f.questions[qIdx];
      return { ...f, questions: f.questions.map((q, i) => (i === qIdx ? { ...q, options: [...(q.options || []), ''] } : q)) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = form.questions.every((q) => q.question.trim() && q.options?.length >= 2 && q.options.every((o) => o.trim()));
    if (!valid || !form.title.trim()) return alert('Fill title and all questions with at least 2 options.');
    setSaving(true);
    try {
      await api.quizzes.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', subject: '', totalMarks: 10, durationMinutes: 30, questions: [{ question: '', options: ['', ''], correctIndex: 0, marks: 1 }] });
      load();
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id, isPublished) => {
    try {
      await api.quizzes.publish(id, !isPublished);
      load();
    } catch (err) {
      alert(err.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await api.quizzes.delete(id);
      load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Quizzes</h1>
      <p className="muted">Create and publish quizzes.</p>
      <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Create quiz'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="card quiz-form">
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
              <label className="label">Total marks</label>
              <input type="number" className="input" min={1} value={form.totalMarks} onChange={(e) => setForm((f) => ({ ...f, totalMarks: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Duration (min)</label>
              <input type="number" className="input" min={1} value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: +e.target.value }))} />
            </div>
          </div>
          <h4>Questions</h4>
          {form.questions.map((q, qIdx) => (
            <div key={qIdx} className="card question-block">
              <div className="form-group">
                <label className="label">Question {qIdx + 1}</label>
                <input type="text" className="input" value={q.question} onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)} placeholder="Question text" />
              </div>
              <div className="form-group">
                <label className="label">Options (select correct)</label>
                {(q.options || []).map((opt, oIdx) => (
                  <label key={oIdx} className="option-row">
                    <input type="radio" name={`correct-${qIdx}`} checked={q.correctIndex === oIdx} onChange={() => updateQuestion(qIdx, 'correctIndex', oIdx)} />
                    <input type="text" className="input" value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} />
                  </label>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => addOption(qIdx)}>+ Option</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addQuestion}>+ Add question</button>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>{saving ? 'Saving...' : 'Create quiz'}</button>
        </form>
      )}
      <div className="quiz-list">
        {list.map((q) => (
          <div key={q._id} className="card quiz-row">
            <div>
              <h4>{q.title}</h4>
              <p className="meta">{q.questions?.length || 0} questions · {q.totalMarks} marks · {q.isPublished ? 'Published' : 'Draft'}</p>
            </div>
            <div className="quiz-actions">
              <Link to={`/admin/results/${q._id}`} className="btn btn-ghost btn-sm">Results</Link>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => togglePublish(q._id, q.isPublished)}>
                {q.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
