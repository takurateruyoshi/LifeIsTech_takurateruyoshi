import React, { useState } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Modal, Box, Typography, Button } from '@mui/material';
import { Home, Psychology, Description, HelpOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation showLabels>
          <BottomNavigationAction label="ホーム" icon={<Home />} onClick={() => navigate('/dashboard')} />
          <BottomNavigationAction label="分析" icon={<Psychology />} onClick={() => navigate('/analysis')} />
          <BottomNavigationAction label="ES作成" icon={<Description />} onClick={() => navigate('/es-generator')} />
          <BottomNavigationAction label="ヘルプ" icon={<HelpOutline />} onClick={() => setOpen(true)} />
        </BottomNavigation>
      </Paper>

      {/* ヘルプモーダル */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 300, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 24, p: 4, textAlign: 'center'
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            使いかたガイド
          </Typography>
          <Typography sx={{ mt: 2, mb: 3 }} color="textSecondary">
            日々のちょっとしたエピソードを入力するだけで、AIがあなたの「社会人基礎力」を12要素で分析します。蓄積データはES作成に活用できます！
          </Typography>
          <Button variant="contained" onClick={() => setOpen(false)}>閉じる</Button>
        </Box>
      </Modal>
    </>
  );
};

export default BottomNav;