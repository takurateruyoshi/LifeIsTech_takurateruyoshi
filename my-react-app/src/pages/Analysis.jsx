import React, { useState } from 'react';
import { Container, TextField, Button, Typography, LinearProgress, Box } from '@mui/material';
import { runAnalysis } from '../api/client';

const Analysis = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const res = await runAnalysis(text);
            localStorage.setItem('lastResult', JSON.stringify(res));
            window.location.href = '/result';
        } catch (e) { alert("エラーが発生しました"); }
        setLoading(false);
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" sx={{ my: 4 }}>Episode Analysis</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                今日経験した「ちょっとした成功」や「工夫したこと」を教えてください。
            </Typography>
            <TextField 
                fullWidth multiline rows={8} variant="outlined" 
                value={text} onChange={(e) => setText(e.target.value)}
                placeholder="例：イベントの企画で意見が割れた際、全員の意見をホワイトボードに書き出して整理したところ、納得感のある結論を出せました。"
            />
            {loading && <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>}
            <Button 
                variant="contained" fullWidth size="large" sx={{ mt: 3 }} 
                onClick={handleAnalyze} disabled={loading || !text}
            >
                AI分析を開始する
            </Button>
        </Container>
    );
};
export default Analysis;