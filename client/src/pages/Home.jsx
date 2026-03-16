import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuBook from '@mui/icons-material/MenuBook';
import Quiz from '@mui/icons-material/Quiz';
import Assignment from '@mui/icons-material/Assignment';
import HelpOutline from '@mui/icons-material/HelpOutline';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import School from '@mui/icons-material/School';
import ArrowForward from '@mui/icons-material/ArrowForward';

const features = [
  {
    icon: <MenuBook sx={{ fontSize: 40 }} />,
    title: 'Study Materials',
    description: 'Download PDFs and notes for your subjects.',
  },
  {
    icon: <Quiz sx={{ fontSize: 40 }} />,
    title: 'Quizzes & Tests',
    description: 'Attempt online quizzes and see results instantly.',
  },
  {
    icon: <Assignment sx={{ fontSize: 40 }} />,
    title: 'Assignments',
    description: 'Submit assignments and get feedback from your teacher.',
  },
  {
    icon: <HelpOutline sx={{ fontSize: 40 }} />,
    title: 'Ask Doubts',
    description: 'Post questions and get answers from your teacher.',
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 40 }} />,
    title: 'Leaderboard',
    description: 'See how you rank among your peers.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.08) 50%, transparent 100%)',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={4} sx={{ py: { xs: 4, md: 6 } }}>
            <Grid item xs={12} md={6}>
              <Typography component="h1" variant="h3" fontWeight={700} gutterBottom sx={{ lineHeight: 1.2 }}>
                Student Learning Portal
              </Typography>
              <Typography color="text.secondary" variant="h6" sx={{ mb: 3, maxWidth: 480 }}>
                Access study materials, take quizzes, submit assignments, and track your progress — all in one place.
              </Typography>
              {!user && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button component={Link} to="/signup" variant="contained" size="large" endIcon={<ArrowForward />}>
                    Sign up as Student
                  </Button>
                  <Button component={Link} to="/login" variant="outlined" size="large">
                    Login
                  </Button>
                  <Button component={Link} to="/teacher-signup" variant="text" size="large" startIcon={<School />}>
                    Teacher / Admin
                  </Button>
                </Box>
              )}
              {user?.role === 'student' && (
                <Button component={Link} to="/dashboard" variant="contained" size="large" endIcon={<ArrowForward />}>
                  Go to Dashboard
                </Button>
              )}
              {user?.role === 'teacher' && (
                <Button component={Link} to="/admin" variant="contained" size="large" endIcon={<ArrowForward />}>
                  Admin Dashboard
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="/hero-learning.png"
                alt="Students learning together"
                sx={{
                  width: '100%',
                  maxWidth: 480,
                  borderRadius: 3,
                  boxShadow: 4,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={600} textAlign="center" gutterBottom>
          Features
        </Typography>
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Everything you need to learn and grow
        </Typography>
        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ pt: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 1.5 }}>{f.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
