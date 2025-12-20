import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

import { fetchUser } from '../api/client'; // APIをインポート
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Analysis from '../pages/Analysis';
import Result from '../pages/Result';
import ESGenerator from '../pages/ESGenerator';
import BottomNav from '../pages/BottomNav';
import '../App.css';

const GlobalHeader = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/' || !user) return null;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: '900', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          SKILL NAVI
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: '700', color: '#64748b' }}>
            {user.name} さん
          </Typography>
          <IconButton onClick={handleMenuOpen} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1e293b' }}>
              {user.name ? user.name[0] : "?"}
            </Avatar>
          </IconButton>
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: '800' }}>{user.name}</Typography>
            <Typography variant="caption" color="textSecondary">{user.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose}><ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>プロフィール</MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }} sx={{ color: '#ef4444' }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>ログアウト
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // コンポーネント読み込み時にAPIからユーザー情報を取得
    fetchUser()
      .then(data => setUser(data))
      .catch(err => console.error("ユーザー情報の取得に失敗:", err));
  }, []);

  return (
    <Router>
      <div className="container">
        <GlobalHeader user={user} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/result" element={<Result />} />
          <Route path="/es-generator" element={<ESGenerator />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;