import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

const Login = () => {
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4">Login</Typography>
        <TextField margin="normal" fullWidth label="Email Address" />
        <TextField margin="normal" fullWidth label="Password" type="password" />
        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={() => window.location.href='/dashboard'}>
          ログイン
        </Button>
      </Box>
    </Container>
  );
};
export default Login;