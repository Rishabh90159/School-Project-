import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../api';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import MenuBook from '@mui/icons-material/MenuBook';
import Quiz from '@mui/icons-material/Quiz';
import Assignment from '@mui/icons-material/Assignment';
import BarChart from '@mui/icons-material/BarChart';
import Campaign from '@mui/icons-material/Campaign';
import ArrowForward from '@mui/icons-material/ArrowForward';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ materials: 0, quizzes: 0, announcements: 0 });
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    Promise.all([api.materials.list(), api.quizzes.list(), api.announcements.list()])
      .then(([mats, quizzes, ann]) => {
        setStats({ materials: mats.length, quizzes: quizzes.length, announcements: ann.length });
        setAnnouncements(ann.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  const quickLinks = [
    { to: '/materials', label: 'Study materials', count: stats.materials, icon: <MenuBook /> },
    { to: '/quizzes', label: 'Quizzes', count: stats.quizzes, icon: <Quiz /> },
    { to: '/assignments', label: 'Assignments', count: '—', icon: <Assignment /> },
    { to: '/results', label: 'My results', count: '—', icon: <BarChart /> },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome back. Here's a quick overview.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickLinks.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.to}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to={item.to} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ color: 'primary.main', mb: 1 }}>{item.icon}</Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {item.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {item.count}
                    </Typography>
                  </Box>
                  <ArrowForward color="action" />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {announcements.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Campaign color="primary" /> Recent announcements
          </Typography>
          <Grid container spacing={2}>
            {announcements.map((a) => (
              <Grid item xs={12} key={a._id}>
                <Card variant="outlined" sx={{ borderColor: 'divider' }}>
                  <CardContent>
                    <Chip label="Announcement" size="small" sx={{ mb: 1.5 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {a.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.content?.slice(0, 180)}{a.content?.length > 180 ? '…' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
