import React, { useState } from 'react';
import { Container, TextField, Button, Typography, LinearProgress, Box, Card } from '@mui/material';
import { runAnalysis } from '../api/client';
import { useNavigate } from 'react-router-dom';

const Analysis = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await runAnalysis(text);
            // 結果画面がない場合は、ひとまずダッシュボードへ戻る
            // もし専用の結果表示ページを作るなら navigate('/result', { state: res }) 等
            navigate('/dashboard');
        } catch (e) { 
            alert("分析中にエラーが発生しました。"); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '90vh', py: 6 }}>
            <Container maxWidth="sm">
                <Card sx={{ p: 4, borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Episode Analysis</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                        今日経験した「ちょっとした成功」や「工夫したこと」を教えてください。AIがあなたの社会人基礎力を分析します。
                    </Typography>
                    
                    <TextField 
                        fullWidth multiline rows={8} variant="outlined" 
                        value={text} onChange={(e) => setText(e.target.value)}
                        placeholder="例：イベントの企画で意見が割れた際、全員の意見をホワイトボードに書き出して整理したところ、納得感のある結論を出せました。"
                        sx={{ bgcolor: '#fff', borderRadius: 2 }}
                    />
                    
                    {loading && (
                        <Box sx={{ width: '100%', mt: 3 }}>
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1, display: 'block' }}>
                                AIがエピソードを精査中...
                            </Typography>
                            <LinearProgress sx={{ borderRadius: 5, height: 6 }} />
                        </Box>
                    )}
                    
                    <Button 
                        variant="contained" fullWidth size="large" sx={{ mt: 4, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }} 
                        onClick={handleAnalyze} disabled={loading || !text.trim()}
                    >
                        {loading ? '分析中...' : 'AI分析を開始する'}
                    </Button>
                </Card>
            </Container>
        </Box>
    );
};
export default Analysis;