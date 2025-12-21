import React, { useState, useEffect } from 'react';
import { 
    Container, TextField, Button, Typography, LinearProgress, Box, Card, 
    Divider, Chip, Paper, Accordion, AccordionSummary, AccordionDetails 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchHistory, runAnalysis } from '../api/client'; 
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BookIcon from '@mui/icons-material/Book';

const Analysis = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await fetchHistory();
            setHistory(data || []);
        } catch (e) {
            console.error("履歴の取得に失敗しました");
        }
    };

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await runAnalysis(text);
            // 入力したテキストを履歴に反映
            const newEntry = { ...res, text: text };
            setHistory([newEntry, ...history]);
            setText('');
        } catch (e) { 
            alert("分析中にエラーが発生しました。"); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="sm">
                {/* エピソード入力エリア */}
                <Card sx={{ p: 4, borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeIcon color="primary" /> New Episode
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                        今日のできごとをAIが分析して、日記にタイトルをつけて保存します。
                    </Typography>
                    
                    <TextField 
                        fullWidth multiline rows={4} variant="outlined" 
                        value={text} onChange={(e) => setText(e.target.value)}
                        placeholder="どんな出来事がありましたか？"
                        sx={{ bgcolor: '#fff', borderRadius: 2 }}
                        disabled={loading}
                    />
                    
                    {loading && (
                        <Box sx={{ width: '100%', mt: 3 }}>
                            <LinearProgress sx={{ borderRadius: 5, height: 6 }} />
                        </Box>
                    )}
                    
                    <Button 
                        variant="contained" fullWidth size="large" 
                        sx={{ mt: 3, py: 1.5, borderRadius: 3, fontWeight: 'bold', bgcolor: '#0f172a' }} 
                        onClick={handleAnalyze} disabled={loading || !text.trim()}
                    >
                        {loading ? 'AIがタイトルを考案中...' : '分析して日記に保存'}
                    </Button>
                </Card>

                {/* 日記セクション */}
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryEduIcon /> Analysis Diary
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {history.map((item, index) => (
                        <Accordion 
                            key={item.id || index} 
                            sx={{ 
                                borderRadius: '20px !important', 
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                '&:before': { display: 'none' },
                                mb: 1,
                                overflow: 'hidden',
                                transition: '0.3s',
                                '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }
                            }}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    {/* アイコンで日記らしさを演出 */}
                                    <Box sx={{ bgcolor: '#f1f5f9', p: 1, borderRadius: 2, display: 'flex' }}>
                                        <BookIcon sx={{ color: '#64748b', fontSize: 20 }} />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                                            {item.date ? new Date(item.date).toLocaleDateString('ja-JP') : 'Just Now'}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                            {item.summary || "無題のエピソード"}
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={item.growth_diff || "完了"} 
                                        size="small"
                                        sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.65rem' }} 
                                    />
                                </Box>
                            </AccordionSummary>

                            <AccordionDetails sx={{ px: 3, pb: 4, bgcolor: '#fff' }}>
                                <Divider sx={{ mb: 3, opacity: 0.5 }} />

                                {/* 自分の文章セクション */}
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 900, letterSpacing: 1, display: 'block', mb: 1.5 }}>
                                    MY JOURNAL
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.8, mb: 4, whiteSpace: 'pre-wrap' }}>
                                    {item.title || "内容が記録されていません"}
                                </Typography>

                                {/* AI分析セクション */}
                                <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 4, border: '1px solid #f1f5f9' }}>
                                    <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 900, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 14 }} /> AI ANALYSIS
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                        {item.feedback}
                                    </Typography>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    {history.length === 0 && !loading && (
                        <Paper sx={{ p: 6, textAlign: 'center', border: '2px dashed #cbd5e1', bgcolor: 'transparent', borderRadius: 6 }} elevation={0}>
                            <Typography sx={{ color: '#94a3b8', fontWeight: 700 }}>まだ日記がありません。最初の一歩を記録しましょう！</Typography>
                        </Paper>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default Analysis;