import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import School from '@mui/icons-material/School';
import MenuBook from '@mui/icons-material/MenuBook';
import Quiz from '@mui/icons-material/Quiz';
import Assignment from '@mui/icons-material/Assignment';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Dashboard from '@mui/icons-material/Dashboard';
import People from '@mui/icons-material/People';
import Campaign from '@mui/icons-material/Campaign';
import BarChart from '@mui/icons-material/BarChart';

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
  { to: '/materials', label: 'Materials', icon: <MenuBook /> },
  { to: '/quizzes', label: 'Quizzes', icon: <Quiz /> },
  { to: '/assignments', label: 'Assignments', icon: <Assignment /> },
  { to: '/results', label: 'Results', icon: <BarChart /> },
  { to: '/doubts', label: 'Doubts', icon: <HelpOutline /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <EmojiEvents /> },
];

const teacherNav = [
  { to: '/admin', label: 'Dashboard', icon: <Dashboard /> },
  { to: '/admin/students', label: 'Students', icon: <People /> },
  { to: '/admin/materials', label: 'Materials', icon: <MenuBook /> },
  { to: '/admin/quizzes', label: 'Quizzes', icon: <Quiz /> },
  { to: '/admin/assignments', label: 'Assignments', icon: <Assignment /> },
  { to: '/admin/announcements', label: 'Announcements', icon: <Campaign /> },
  { to: '/admin/doubts', label: 'Doubts', icon: <HelpOutline /> },
];

const guestNav = [
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Sign up' },
  { to: '/teacher-signup', label: 'Teacher' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = !user ? guestNav : user.role === 'student' ? studentNav : teacherNav;

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
  };

  const NavLinks = ({ vertical }) => (
    <>
      {(user ? (user.role === 'student' ? studentNav : teacherNav) : guestNav).map(({ to, label, icon }) => (
        <Button
          key={to}
          component={Link}
          to={to}
          startIcon={vertical && icon}
          onClick={() => vertical && setDrawerOpen(false)}
          sx={{
            color: location.pathname === to ? 'primary.main' : 'text.secondary',
            fontWeight: location.pathname === to ? 600 : 500,
            bgcolor: location.pathname === to ? 'action.selected' : 'transparent',
            '&:hover': { color: 'primary.light', bgcolor: 'action.hover' },
          }}
        >
          {label}
        </Button>
      ))}
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ display: { xs: 'block', md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography
              component={Link}
              to="/"
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <School sx={{ fontSize: 28 }} /> EduPortal
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <NavLinks />
          </Box>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="large" onClick={handleMenu} color="inherit">
                <AccountCircle />
              </IconButton>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }}>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            {(user ? (user.role === 'student' ? studentNav : teacherNav) : guestNav).map(({ to, label, icon }) => (
              <ListItem key={to} disablePadding>
                <ListItemButton component={Link} to={to} selected={location.pathname === to} onClick={() => setDrawerOpen(false)}>
                  {icon && <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>}
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {user && (
            <Box sx={{ px: 2, pt: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<Logout />} onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
