import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Card, Box, IconButton, Stack, Tooltip as MuiTooltip, CircularProgress } from '@mui/material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { fetchHistory } from '../api/client';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('summary'); 
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigate = useNavigate();

    const colors = {
        action: "#ff7300", thinking: "#387908", teamwork: "#1976d2", default: "#8884d8"
    };

    const skillDescriptions = {
        '前に踏み出す力': '一歩前に踏み出し、失敗を恐れず行動する力',
        '考え抜く力': '疑問を持ち、考え抜く力',
        'チームで働く力': '多様な人々とともに、目標に向けて協力する力',
        '主体性': '物事に進んで取り組み、他者に先駆けて行動する', '働きかけ力': '他人に働きかけ、巻き込んでいく', '実行力': '目標を設定し、確実に行動する',
        '課題発見力': '現状を分析し、目的や課題を明らかにする', '計画力': '課題の解決に向けたプロセスを明確にし、準備する', '創造力': '新しい価値を生み出す',
        '発信力': '自分の意見をわかりやすく伝える', '傾聴力': '相手の話を丁寧に聴く', '柔軟性': '意見の違いや状況の変化を理解し受け入れる', '状況把握力': '自分と周囲の人々や物事との関係性を理解する', '規律性': '社会のルールや人との約束を守る', 'ストレス管理': 'ストレスの発生源に対応し、適切に処理する'
    };

    useEffect(() => {
        fetchHistory()
            .then(data => {
                setHistory(data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // 1. 読み込み中
    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );

    // 2. データが空の場合の表示
    if (history.length === 0) return (
        <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
            <Card sx={{ p: 6, borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>分析データがまだありません</Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                    あなたの強みを可視化するために、まずは最初のエピソードを分析してみましょう。
                </Typography>
                <Button 
                    variant="contained" size="large" startIcon={<AddIcon />}
                    onClick={() => navigate('/analysis')}
                    sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 'bold' }}
                >
                    最初のアナリシスを始める
                </Button>
            </Card>
        </Container>
    );

    // --- 以降、データがある場合のレンダリング（以前のコードと同じ） ---
    const latest = history[0]?.scores || {}; // 降順で取得している前提
    const summaryData = [
        { subject: '前に踏み出す力', score: (latest.initiative + latest.influence + latest.execution) / 3, category: 'action', color: colors.action },
        { subject: '考え抜く力', score: (latest.problem_solving + latest.planning + latest.creativity) / 3, category: 'thinking', color: colors.thinking },
        { subject: 'チームで働く力', score: (latest.communication + latest.listening + latest.flexibility + latest.situation_awareness + latest.discipline + latest.stress_control) / 6, category: 'teamwork', color: colors.teamwork },
    ];

    const getDetailData = (category) => {
        const mapping = {
            'action': [{ subject: '主体性', score: latest.initiative }, { subject: '働きかけ力', score: latest.influence }, { subject: '実行力', score: latest.execution }],
            'thinking': [{ subject: '課題発見力', score: latest.problem_solving }, { subject: '計画力', score: latest.planning }, { subject: '創造力', score: latest.creativity }],
            'teamwork': [{ subject: '発信力', score: latest.communication }, { subject: '傾聴力', score: latest.listening }, { subject: '柔軟性', score: latest.flexibility }, { subject: '状況把握力', score: latest.situation_awareness }, { subject: '規律性', score: latest.discipline }, { subject: 'ストレス管理', score: latest.stress_control }]
        };
        return mapping[category].map(d => ({ ...d, color: colors[category] }));
    };

    const growthData = [...history].reverse().map(item => ({
        dateLabel: new Date(item.date).getMonth() + 1 + "/" + new Date(item.date).getDate(),
        '前に踏み出す力': (item.scores.initiative + item.scores.influence + item.scores.execution) / 3,
        '考え抜く力': (item.scores.problem_solving + item.scores.planning + item.scores.creativity) / 3,
        'チームで働く力': (item.scores.communication + item.scores.listening + item.scores.flexibility + item.scores.situation_awareness + item.scores.discipline + item.scores.stress_control) / 6,
        '主体性': item.scores.initiative, '働きかけ力': item.scores.influence, '実行力': item.scores.execution,
        '課題発見力': item.scores.problem_solving, '計画力': item.scores.planning, '創造力': item.scores.creativity,
        '発信力': item.scores.communication, '傾聴力': item.scores.listening, '柔軟性': item.scores.flexibility,
        '状況把握力': item.scores.situation_awareness, '規律性': item.scores.discipline, 'ストレス管理': item.scores.stress_control
    }));

    const renderCustomPolarAngleAxis = ({ payload, x, y, cx, cy, ...rest }) => {
        let labelColor = "#444";
        if (viewMode === 'summary') {
            const item = summaryData.find(d => d.subject === payload.value);
            labelColor = item ? item.color : labelColor;
        } else {
            labelColor = colors[selectedCategory];
        }
        return (
            <foreignObject x={x - 60} y={y - 20} width="120" height="40" style={{ overflow: 'visible' }}>
                <MuiTooltip title={skillDescriptions[payload.value] || ""} arrow placement="top">
                    <div 
                        style={{ textAlign: 'center', cursor: 'pointer', color: labelColor, fontSize: '15px', fontWeight: '800' }}
                        onClick={() => {
                            if(viewMode === 'summary') {
                                const item = summaryData.find(d => d.subject === payload.value);
                                if(item) { setSelectedCategory(item.category); setViewMode('detail'); }
                            }
                        }}
                    >
                        {payload.value}
                    </div>
                </MuiTooltip>
            </foreignObject>
        );
    };

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 6, fontWeight: '900', textAlign: 'center', color: '#0f172a' }}>SOCIAL SKILLS ANALYSIS</Typography>
                <Stack spacing={4}>
                    <Card elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            {viewMode === 'detail' && (
                                <IconButton onClick={() => {setViewMode('summary'); setSelectedCategory(null);}} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
                            )}
                            <Typography variant="h6" sx={{ fontWeight: '800' }}>
                                {viewMode === 'summary' ? 'Current Balance' : 'Detail Analysis'}
                            </Typography>
                        </Box>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={viewMode === 'summary' ? summaryData : getDetailData(selectedCategory)}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={renderCustomPolarAngleAxis} />
                                    <Radar dataKey="score" stroke={viewMode === 'summary' ? colors.default : colors[selectedCategory]} fill={viewMode === 'summary' ? colors.default : colors[selectedCategory]} fillOpacity={0.3} strokeWidth={3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Card>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <Typography variant="h6" sx={{ fontWeight: '800', mb: 3 }}>Growth Timeline</Typography>
                        <Box sx={{ height: 350, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="dateLabel" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    {viewMode === 'summary' ? (
                                        <>
                                            <Line name="前に踏み出す力" dataKey="前に踏み出す力" stroke={colors.action} strokeWidth={3} />
                                            <Line name="考え抜く力" dataKey="考え抜く力" stroke={colors.thinking} strokeWidth={3} />
                                            <Line name="チームで働く力" dataKey="チームで働く力" stroke={colors.teamwork} strokeWidth={3} />
                                        </>
                                    ) : (
                                        ['主体性', '働きかけ力', '実行力', '課題発見力', '計画力', '創造力', '発信力', '傾聴力', '柔軟性', '状況把握力', '規律性', 'ストレス管理'].filter(k => growthData[0].hasOwnProperty(k)).map(k => (
                                            <Line key={k} name={k} dataKey={k} stroke={colors[selectedCategory]} strokeWidth={2} />
                                        ))
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
};

export default Dashboard;