import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './QuizAttempt.css';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    api.quizzes.get(id)
      .then(setQuiz)
      .catch(() => setQuiz(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    const questions = quiz?.questions || [];
    const answerList = questions.map((_, i) => ({
      questionIndex: i,
      selectedIndex: answers[i] ?? -1,
    }));
    const unanswered = answerList.filter((a) => a.selectedIndex < 0).length;
    if (unanswered > 0) {
      alert(`Please answer all questions. (${unanswered} left)`);
      return;
    }
    try {
      const res = await api.quizzes.submit(id, {
        answers: answerList,
        timeTakenSeconds: Math.round((Date.now() - startTime) / 1000),
      });
      setResult(res);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'Submit failed');
    }
  };

  if (loading || !quiz) return <div className="page">{loading ? 'Loading...' : 'Quiz not found.'}</div>;

  if (submitted && result) {
    return (
      <div className="page">
        <h1>Quiz submitted</h1>
        <div className="card result-card">
          <p><strong>Score: {result.obtainedMarks} / {result.totalMarks}</strong></p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/results')}>View all results</button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];

  return (
    <div className="page">
      <h1>{quiz.title}</h1>
      <p className="muted">Total: {quiz.totalMarks} marks · Answer all questions.</p>
      <div className="quiz-questions">
        {questions.map((q, idx) => (
          <div key={idx} className="card question-card">
            <p className="question-text"><strong>Q{idx + 1}.</strong> {q.question}</p>
            <div className="options">
              {q.options.map((opt, oi) => (
                <label key={oi} className="option">
                  <input
                    type="radio"
                    name={`q${idx}`}
                    checked={answers[idx] === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [idx]: oi }))}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit quiz</button>
    </div>
  );
}
