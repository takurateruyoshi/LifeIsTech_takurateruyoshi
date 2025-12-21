import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { fetchUser } from '../api/client';
import GlobalHeader from '../components/GlobalHeader';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Analysis from '../pages/Analysis';
import BottomNav from '../pages/BottomNav';
import '../App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    const session = localStorage.getItem('session');
    if (session) {
      try {
        const data = await fetchUser();
        setUser(data);
      } catch (err) {
        localStorage.removeItem('session');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadUserData(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('session');
    setUser(null);
    window.location.href = '/';
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Router>
      <Box sx={{ pb: 7, minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <GlobalHeader user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={loadUserData} />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/analysis" element={user ? <Analysis /> : <Navigate to="/" />} />
        </Routes>
        {user && <BottomNav />}
      </Box>
    </Router>
  );
}

export default App;