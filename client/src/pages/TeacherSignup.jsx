import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import School from '@mui/icons-material/School';

export default function TeacherSignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerTeacher } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerTeacher(form);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <School sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Teacher / Admin Sign up
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              Create the teacher account to manage the portal. Only one teacher is allowed unless enabled via server config.
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" name="email" value={form.email} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password (min 6)" type="password" name="password" value={form.password} onChange={handleChange} required inputProps={{ minLength: 6 }} sx={{ mb: 2 }} />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? 'Creating account...' : 'Create teacher account'}
            </Button>
          </form>
          <Typography color="text.secondary" sx={{ mt: 3, textAlign: 'center', fontSize: '0.9rem' }}>
            <Link to="/login" style={{ color: 'var(--mui-palette-primary-main)' }}>Back to Login</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
