import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Card, Tab, Tabs } from '@mui/material';
import { login, signup } from '../api/client';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState(0);
    const [form, setForm] = useState({ email: '', password: '', username: '' });
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            if (mode === 0) {
                await login(form.email, form.password);
                onLoginSuccess();
                navigate('/dashboard');
            } else {
                await signup(form.email, form.password, form.username);
                alert("登録成功！ログインしてください");
                setMode(0);
            }
        } catch (e) {
            alert(e.response?.data?.detail || "エラーが発生しました");
        }
    };

    return (
        <Container maxWidth="xs">
            <Card sx={{ mt: 8, p: 4, borderRadius: 3 }}>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold">SKILL NAVI</Typography>
                <Tabs value={mode} onChange={(e, v) => setMode(v)} variant="fullWidth" sx={{ mb: 2 }}>
                    <Tab label="ログイン" /><Tab label="新規登録" />
                </Tabs>
                {mode === 1 && <TextField fullWidth label="Username" margin="normal" onChange={e => setForm({...form, username: e.target.value})} />}
                <TextField fullWidth label="Email" margin="normal" onChange={e => setForm({...form, email: e.target.value})} />
                <TextField fullWidth label="Password" type="password" margin="normal" onChange={e => setForm({...form, password: e.target.value})} />
                <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={handleSubmit}>
                    {mode === 0 ? "ログイン" : "アカウント作成"}
                </Button>
            </Card>
        </Container>
    );
};
export default Login;