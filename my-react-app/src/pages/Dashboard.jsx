import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Card, Box, IconButton, Stack, Tooltip as MuiTooltip } from '@mui/material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchHistory } from '../api/client';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [viewMode, setViewMode] = useState('summary'); 
    const [selectedCategory, setSelectedCategory] = useState(null);

    const colors = {
        action: "#ff7300",    
        thinking: "#387908",  
        teamwork: "#1976d2",  
        default: "#8884d8"
    };

    const skillDescriptions = {
        '前に踏み出す力': '一歩前に踏み出し、失敗を恐れず行動する力',
        '考え抜く力': '疑問を持ち、考え抜く力',
        'チームで働く力': '多様な人々とともに、目標に向けて協力する力',
        '主体性': '物事に進んで取り組み、他者に先駆けて行動する',
        '働きかけ力': '他人に働きかけ、巻き込んでいく',
        '実行力': '目標を設定し、確実に行動する',
        '課題発見力': '現状を分析し、目的や課題を明らかにする',
        '計画力': '課題の解決に向けたプロセスを明確にし、準備する',
        '創造力': '新しい価値を生み出す',
        '発信力': '自分の意見をわかりやすく伝える',
        '傾聴力': '相手の話を丁寧に聴く',
        '柔軟性': '意見の違いや状況の変化を理解し受け入れる',
        '状況把握力': '自分と周囲の人々や物事との関係性を理解する',
        '規律性': '社会のルールや人との約束を守る',
        'ストレス管理': 'ストレスの発生源に対応し、適切に処理する'
    };

    useEffect(() => {
        fetchHistory().then(setHistory);
    }, []);

    if (history.length === 0) return <Typography sx={{ p: 4, textAlign: 'center' }}>読み込み中...</Typography>;

    const latest = history[history.length - 1].scores;

    const summaryData = [
        { subject: '前に踏み出す力', score: (latest.initiative + latest.influence + latest.execution) / 3, category: 'action', color: colors.action },
        { subject: '考え抜く力', score: (latest.problem_solving + latest.planning + latest.creativity) / 3, category: 'thinking', color: colors.thinking },
        { subject: 'チームで働く力', score: (latest.communication + latest.listening + latest.flexibility + latest.situation_awareness + latest.discipline + latest.stress_control) / 6, category: 'teamwork', color: colors.teamwork },
    ];

    const handleSetCategory = (cat) => {
        setSelectedCategory(cat);
        setViewMode('detail');
    };

    const handleLabelClick = (data) => {
        if (viewMode === 'summary') {
            const item = summaryData.find(d => d.subject === data.value);
            if (item) handleSetCategory(item.category);
        }
    };

    // --- ラベルのカスタマイズ（サイズアップ版） ---
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
                        style={{ 
                            textAlign: 'center',
                            cursor: viewMode === 'summary' ? 'pointer' : 'help',
                            color: labelColor,
                            fontSize: '16px', // 14pxから16pxに拡大
                            fontWeight: '800', // さらに太く
                            whiteSpace: 'nowrap',
                            textShadow: '0px 0px 2px rgba(255,255,255,0.8)',
                            lineHeight: '1.2'
                        }}
                        onClick={() => handleLabelClick(payload)}
                    >
                        {payload.value}
                    </div>
                </MuiTooltip>
            </foreignObject>
        );
    };

    const getDetailData = (category) => {
        const mapping = {
            'action': [{ subject: '主体性', score: latest.initiative }, { subject: '働きかけ力', score: latest.influence }, { subject: '実行力', score: latest.execution }],
            'thinking': [{ subject: '課題発見力', score: latest.problem_solving }, { subject: '計画力', score: latest.planning }, { subject: '創造力', score: latest.creativity }],
            'teamwork': [{ subject: '発信力', score: latest.communication }, { subject: '傾聴力', score: latest.listening }, { subject: '柔軟性', score: latest.flexibility }, { subject: '状況把握力', score: latest.situation_awareness }, { subject: '規律性', score: latest.discipline }, { subject: 'ストレス管理', score: latest.stress_control }]
        };
        return (mapping[category] || []).map(d => ({ ...d, color: colors[category] }));
    };

    const growthData = history.map(item => ({
        dateLabel: new Date(item.date).getMonth() + 1 + "/" + new Date(item.date).getDate(),
        '前に踏み出す力': (item.scores.initiative + item.scores.influence + item.scores.execution) / 3,
        '考え抜く力': (item.scores.problem_solving + item.scores.planning + item.scores.creativity) / 3,
        'チームで働く力': (item.scores.communication + item.scores.listening + item.scores.flexibility + item.scores.situation_awareness + item.scores.discipline + item.scores.stress_control) / 6,
        '主体性': item.scores.initiative, '働きかけ力': item.scores.influence, '実行力': item.scores.execution,
        '課題発見力': item.scores.problem_solving, '計画力': item.scores.planning, '創造力': item.scores.creativity,
        '発信力': item.scores.communication, '傾聴力': item.scores.listening, '柔軟性': item.scores.flexibility,
        '状況把握力': item.scores.situation_awareness, '規律性': item.scores.discipline, 'ストレス管理': item.scores.stress_control
    }));

    const detailKeysMap = {
        'action': ['主体性', '働きかけ力', '実行力'],
        'thinking': ['課題発見力', '計画力', '創造力'],
        'teamwork': ['発信力', '傾聴力', '柔軟性', '状況把握力', '規律性', 'ストレス管理']
    };

    const getOpacity = (index) => 1 - (index * 0.15);

    const renderCustomLegend = (props) => {
        const { payload } = props;
        return (
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ flexWrap: 'wrap', mb: 2, px: 2 }}>
                {payload.map((entry, index) => (
                    <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', opacity: viewMode === 'summary' ? 1 : getOpacity(index) }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: entry.color, borderRadius: '3px', mr: 0.8 }} />
                        <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#444' }}>{entry.value}</Typography>
                    </Box>
                ))}
            </Stack>
        );
    };

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 6, fontWeight: '900', textAlign: 'center', color: '#0f172a', letterSpacing: '0.05em' }}>
                    SOCIAL SKILLS ANALYSIS
                </Typography>

                <Stack spacing={4}>
                    {/* 1. 能力バランス分析 */}
                    <Card elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            {viewMode === 'detail' && (
                                <IconButton onClick={() => {setViewMode('summary'); setSelectedCategory(null);}} size="small" sx={{ mr: 2, bgcolor: '#f1f5f9', '&:hover': {bgcolor: '#e2e8f0'} }}><ArrowBackIcon /></IconButton>
                            )}
                            <Typography variant="h6" sx={{ fontWeight: '800', color: '#1e293b' }}>
                                {viewMode === 'summary' ? 'Current Balance' : `${skillDescriptions[selectedCategory === 'action' ? '前に踏み出す力' : selectedCategory === 'thinking' ? '考え抜く力' : 'チームで働く力']}の詳細`}
                            </Typography>
                        </Box>

                        <Box sx={{ height: 450, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={viewMode === 'summary' ? summaryData : getDetailData(selectedCategory)} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                    <PolarGrid stroke="#cbd5e1" />
                                    <PolarAngleAxis dataKey="subject" tick={renderCustomPolarAngleAxis} />
                                    <Radar 
                                        dataKey="score" 
                                        stroke={viewMode === 'summary' ? colors.default : colors[selectedCategory]} 
                                        fill={viewMode === 'summary' ? colors.default : colors[selectedCategory]} 
                                        fillOpacity={0.3} 
                                        strokeWidth={3}
                                        animationDuration={1200} 
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Card>

                    {/* 2. 成長の軌跡 */}
                    <Card elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Typography variant="h6" sx={{ fontWeight: '800', mb: 3, color: '#1e293b' }}>
                            Growth Timeline
                        </Typography>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12, fontWeight: '600', fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Legend content={renderCustomLegend} verticalAlign="top" align="right" />
                                    {viewMode === 'summary' ? (
                                        <>
                                            <Line name="前に踏み出す力" type="monotone" dataKey="前に踏み出す力" stroke={colors.action} strokeWidth={4} dot={{ r: 4, fill: colors.action }} activeDot={{ r: 7 }} />
                                            <Line name="考え抜く力" type="monotone" dataKey="考え抜く力" stroke={colors.thinking} strokeWidth={4} dot={{ r: 4, fill: colors.thinking }} activeDot={{ r: 7 }} />
                                            <Line name="チームで働く力" type="monotone" dataKey="チームで働く力" stroke={colors.teamwork} strokeWidth={4} dot={{ r: 4, fill: colors.teamwork }} activeDot={{ r: 7 }} />
                                        </>
                                    ) : (
                                        detailKeysMap[selectedCategory].map((key, index) => (
                                            <Line key={key} name={key} type="monotone" dataKey={key} stroke={colors[selectedCategory]} strokeWidth={4} strokeOpacity={getOpacity(index)} dot={{ r: 4, fillOpacity: getOpacity(index), strokeOpacity: getOpacity(index) }} activeDot={{ r: 6 }} />
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