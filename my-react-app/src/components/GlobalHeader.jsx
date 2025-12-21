import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar, Typography, IconButton, Avatar, 
  Menu, MenuItem, Divider, ListItemIcon 
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';

/**
 * GlobalHeader コンポーネント
 * @param {Object} user - App.js から渡されるユーザー情報
 * @param {Function} onLogout - App.js で定義されたログアウト関数
 */
const GlobalHeader = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ログイン画面、またはユーザー情報がない場合は表示しない
  if (location.pathname === '/' || !user) return null;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // 表示名の決定（usernameプロパティを優先し、なければEmailの@前を抽出）
  const displayName = user.username || user.name || (user.email ? user.email.split('@')[0] : "User");

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid #e2e8f0', 
        color: '#0f172a' 
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* アプリ名（クリックでダッシュボードへ） */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: '900', 
            cursor: 'pointer', 
            letterSpacing: '-0.5px',
            color: '#2563eb' 
          }} 
          onClick={() => navigate('/dashboard')}
        >
          SKILL NAVI
        </Typography>

        {/* ユーザー操作エリア */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography 
            variant="body2" 
            sx={{ fontWeight: '700', color: '#475569', display: { xs: 'none', sm: 'block' } }}
          >
            {displayName} さん
          </Typography>
          
          <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0.5 }}>
            <Avatar 
              sx={{ 
                width: 34, 
                height: 34, 
                bgcolor: '#1e293b', 
                fontSize: '0.9rem', 
                fontWeight: 'bold' 
              }}
            >
              {displayName[0].toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        {/* ユーザーメニュー（ドロップダウン） */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 4,
            sx: { mt: 1, minWidth: 200, borderRadius: 2, border: '1px solid #f1f5f9' }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: '800' }}>{displayName}</Typography>
            <Typography variant="caption" color="textSecondary">{user.email}</Typography>
          </Box>
          
          <Divider />
          
          <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
            <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
            ダッシュボード
          </MenuItem>
          
          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            プロフィール
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={() => { handleMenuClose(); onLogout(); }} 
            sx={{ color: '#ef4444' }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
            </ListItemIcon>
            ログアウト
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default GlobalHeader;