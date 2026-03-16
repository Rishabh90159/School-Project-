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
import PersonAdd from '@mui/icons-material/PersonAdd';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '', class: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
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
            <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Student Sign up
            </Typography>
            <Typography color="text.secondary">
              Create your account to access the portal.
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" name="email" value={form.email} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password (min 6)" type="password" name="password" value={form.password} onChange={handleChange} required inputProps={{ minLength: 6 }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Roll number (optional)" name="rollNumber" value={form.rollNumber} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Class (optional)" name="class" value={form.class} onChange={handleChange} sx={{ mb: 2 }} />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
          <Typography color="text.secondary" sx={{ mt: 3, textAlign: 'center', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--mui-palette-primary-main)' }}>Login</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
