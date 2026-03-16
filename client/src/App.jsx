import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherSignup from './pages/TeacherSignup';
import StudentDashboard from './pages/student/Dashboard';
import Materials from './pages/student/Materials';
import QuizList from './pages/student/QuizList';
import QuizAttempt from './pages/student/QuizAttempt';
import Assignments from './pages/student/Assignments';
import Results from './pages/student/Results';
import Doubts from './pages/student/Doubts';
import Leaderboard from './pages/student/Leaderboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminMaterials from './pages/admin/Materials';
import AdminQuizzes from './pages/admin/Quizzes';
import AdminAssignments from './pages/admin/Assignments';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminDoubts from './pages/admin/Doubts';
import AdminQuizResults from './pages/admin/QuizResults';

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={48} />
    </Box>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'teacher' ? '/admin' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="teacher-signup" element={<TeacherSignup />} />
        <Route path="dashboard" element={<Protected><StudentDashboard /></Protected>} />
        <Route path="materials" element={<Protected role="student"><Materials /></Protected>} />
        <Route path="quizzes" element={<Protected role="student"><QuizList /></Protected>} />
        <Route path="quizzes/:id" element={<Protected role="student"><QuizAttempt /></Protected>} />
        <Route path="assignments" element={<Protected role="student"><Assignments /></Protected>} />
        <Route path="results" element={<Protected role="student"><Results /></Protected>} />
        <Route path="doubts" element={<Protected role="student"><Doubts /></Protected>} />
        <Route path="leaderboard" element={<Protected><Leaderboard /></Protected>} />
        <Route path="admin" element={<Protected role="teacher"><AdminDashboard /></Protected>} />
        <Route path="admin/students" element={<Protected role="teacher"><AdminStudents /></Protected>} />
        <Route path="admin/materials" element={<Protected role="teacher"><AdminMaterials /></Protected>} />
        <Route path="admin/quizzes" element={<Protected role="teacher"><AdminQuizzes /></Protected>} />
        <Route path="admin/assignments" element={<Protected role="teacher"><AdminAssignments /></Protected>} />
        <Route path="admin/announcements" element={<Protected role="teacher"><AdminAnnouncements /></Protected>} />
        <Route path="admin/doubts" element={<Protected role="teacher"><AdminDoubts /></Protected>} />
        <Route path="admin/results/:quizId" element={<Protected role="teacher"><AdminQuizResults /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
