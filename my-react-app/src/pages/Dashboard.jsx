import React, { useEffect, useState, useMemo } from 'react';
import { Container, Typography, Button, Card, Box, IconButton, Stack, CircularProgress, Paper } from '@mui/material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { fetchHistory } from '../api/client';

const SKILL_MAP = {
    action: {
        label: '前に踏み出す力',
        color: "#ff7300",
        skills: ['主体性', '働きかけ力', '実行力']
    },
    thinking: {
        label: '考え抜く力',
        color: "#387908",
        skills: ['課題発見力', '計画力', '創造力']
    },
    teamwork: {
        label: 'チームで働く力',
        color: "#1976d2",
        skills: ['発信力', '傾聴力', '柔軟性', '情況把握力', '規律性', 'ストレスコントロール力']
    }
};

const INDIVIDUAL_COLORS = {
    '主体性': '#FF8042', 
    '働きかけ力': '#FFBB28', 
    '実行力': '#FF6B6B',
    '課題発見力': '#00C49F', 
    '計画力': '#0088FE', 
    '創造力': '#8884d8',
    '発信力': '#82ca9d', 
    '傾聴力': '#a4de6c', 
    '柔軟性': '#d0ed57', 
    '情況把握力': '#ffc658', 
    '規律性': '#8dd1e1', 
    'ストレスコントロール力': '#83a6ed'
};

const skillDescriptions = {
    '前に踏み出す力': '一歩前に踏み出し、失敗を恐れず行動する力。',
    '考え抜く力': '疑問を持ち、考え抜く力。',
    'チームで働く力': '多様な人々とともに協力する力。',
    '主体性': '物事に進んで取り組み、他者に先駆けて行動する力。', 
    '働きかけ力': '他人に働きかけ、周囲を巻き込んでいく力。', 
    '実行力': '自ら目標を設定し、粘り強く行動する力。',
    '課題発見力': '現状を分析し、目的や課題を明らかにする力。', 
    '計画力': '解決に向けたプロセスを明確にし、準備する力。', 
    '創造力': '既存の発想にとらわず、新しい価値を生み出す力。',
    '発信力': '自分の意見をわかりやすく他者に伝える力。', 
    '傾聴力': '相手の話を丁寧に聴き、意図を理解する力。', 
    '柔軟性': '意見の違いや状況の変化を理解し、受け入れる力。', 
    '情況把握力': '自分と周囲の人々や物事との関係性を客観的に理解する力。', 
    '規律性': '社会のルールや人との約束を尊重し守る力。', 
    'ストレスコントロール力': 'ストレスの発生源に対応し、適切に処理する力。'
};

const toFiveStep = (score) => (score / 20).toFixed(1);

const getSkillColor = (name) => {
    if (INDIVIDUAL_COLORS[name]) return INDIVIDUAL_COLORS[name];
    if (name === SKILL_MAP.action.label) return SKILL_MAP.action.color;
    if (name === SKILL_MAP.thinking.label) return SKILL_MAP.thinking.color;
    if (name === SKILL_MAP.teamwork.label) return SKILL_MAP.teamwork.color;
    return "#64748b"; 
};

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('summary'); 
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory()
            .then(data => {
                setHistory(data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const latest = useMemo(() => {
        return history[0]?.scores || {}; 
    }, [history]);

    const chartData = useMemo(() => {
        return [...history].reverse().map(item => {
            const baseData = {
                date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
                ...item.scores
            };
            Object.values(SKILL_MAP).forEach(cat => {
                const total = cat.skills.reduce((sum, skill) => sum + (item.scores[skill] || 0), 0);
                const avg = total / cat.skills.length;
                baseData[cat.label] = avg; 
            });
            return baseData;
        });
    }, [history]);

    const displaySkillsForTimeline = useMemo(() => {
        let targets = [];
        const latestChartData = chartData[chartData.length - 1] || {};

        if (viewMode === 'summary') {
            targets = Object.values(SKILL_MAP).map(v => v.label);
        } else if (selectedCategory && SKILL_MAP[selectedCategory]) {
            targets = SKILL_MAP[selectedCategory].skills;
        }
        
        return targets.sort((a, b) => (latestChartData[b] || 0) - (latestChartData[a] || 0));
    }, [viewMode, selectedCategory, chartData]);

    const CustomRadarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Paper elevation={4} sx={{ p: 2, maxWidth: 240, borderRadius: 3, border: `2px solid ${data.color || '#6366f1'}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: data.color || '#6366f1', mb: 0.5 }}>
                        {data.subject}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: '900', mb: 1 }}>
                        {toFiveStep(data.score)} <small style={{ fontSize: '0.6em', color: '#64748b' }}>/ 5.0</small>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.4 }}>
                        {skillDescriptions[data.subject]}
                    </Typography>
                </Paper>
            );
        }
        return null;
    };

    const CustomTick = ({ payload, x, y, textAnchor, ...rest }) => {
        const label = payload.value;
        const color = getSkillColor(label);
        const isClickable = viewMode === 'summary' && Object.values(SKILL_MAP).some(v => v.label === label);

        return (
            <text
                {...rest}
                x={x}
                y={y}
                dy={4}
                textAnchor={textAnchor}
                fill={color}
                fontSize={13}
                fontWeight={700}
                cursor={isClickable ? 'pointer' : 'default'}
                onClick={() => {
                    if (isClickable) {
                        const found = Object.entries(SKILL_MAP).find(([_, v]) => v.label === label);
                        if (found) { setSelectedCategory(found[0]); setViewMode('detail'); }
                    }
                }}
            >
                {label}
            </text>
        );
    };

    const CustomRadarDot = (props) => {
        const { cx, cy, payload } = props;
        return (
            <circle cx={cx} cy={cy} r={5} fill={payload.color} stroke="#fff" strokeWidth={2} />
        );
    };

    // 【追加】タイムラインの各ドットの上に数値を表示するカスタムコンポーネント
    const CustomLineLabel = (props) => {
        const { x, y, value, stroke } = props;
        // 背景のグリッド線と重なっても見やすいように、白い縁取り（stroke）をつけています
        return (
            <text 
                x={x} 
                y={y} 
                dy={-10} // ドットの少し上に表示
                fill={stroke} 
                fontSize={12} 
                fontWeight="bold" 
                textAnchor="middle"
                stroke="#fff" 
                strokeWidth={3} 
                paintOrder="stroke"
            >
                {toFiveStep(value)}
            </text>
        );
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;

    if (history.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <Card sx={{ p: 6, borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>分析データがありません</Typography>
                    <Button variant="contained" onClick={() => navigate('/analysis')} sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 'bold' }}>分析を始める</Button>
                </Card>
            </Container>
        );
    }
    
    const summaryData = Object.entries(SKILL_MAP).map(([key, value]) => ({
        subject: value.label,
        score: value.skills.reduce((acc, s) => acc + (latest[s] || 0), 0) / value.skills.length,
        category: key,
        color: value.color
    }));

    const getDetailData = (categoryKey) => {
        const category = SKILL_MAP[categoryKey];
        return category.skills.map(name => ({
            subject: name,
            score: latest[name] || 0,
            color: getSkillColor(name)
        }));
    };

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 6, fontWeight: '900', textAlign: 'center', color: '#1e293b' }}>SKILL DASHBOARD</Typography>
                
                <Stack spacing={4}>
                    <Card elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {viewMode === 'detail' && (
                                <IconButton onClick={() => {setViewMode('summary'); setSelectedCategory(null);}} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
                            )}
                            <Typography variant="h6" sx={{ fontWeight: '800' }}>
                                {viewMode === 'summary' ? '能力バランス (3つの力)' : `${SKILL_MAP[selectedCategory].label}の詳細`}
                            </Typography>
                        </Box>
                        <Box sx={{ height: 450, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={viewMode === 'summary' ? summaryData : getDetailData(selectedCategory)}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis 
                                        dataKey="subject" 
                                        tick={<CustomTick />}
                                    />
                                    <PolarRadiusAxis 
                                        angle={30} 
                                        domain={[0, 100]} 
                                        tickCount={6} 
                                        stroke="none" 
                                        tick={false} 
                                    />
                                    <Tooltip content={<CustomRadarTooltip />} />
                                    <Radar 
                                        name="Score"
                                        dataKey="score" 
                                        stroke={viewMode === 'summary' ? "#6366f1" : SKILL_MAP[selectedCategory].color} 
                                        fill={viewMode === 'summary' ? "#6366f1" : SKILL_MAP[selectedCategory].color} 
                                        fillOpacity={0.2} 
                                        strokeWidth={3}
                                        dot={<CustomRadarDot />}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Card>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: '800' }}>
                                成長タイムライン：{viewMode === 'summary' ? '3つの力の推移' : SKILL_MAP[selectedCategory].label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                ※ 最新スコアが高い順に表示されています。
                            </Typography>
                        </Box>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                    data={chartData} 
                                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }} 
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} />
                                    {/* Y軸は0-100ですが、表示上は5段階評価の数値を表示するようにしても良いかもしれません */}
                                    <YAxis domain={[0, 100]} width={35} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />

                                    {displaySkillsForTimeline.map((item) => (
                                        <Line 
                                            key={item}
                                            type="monotone" 
                                            dataKey={item} 
                                            stroke={getSkillColor(item)} 
                                            strokeWidth={3} 
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                            connectNulls
                                            // 【ここが修正ポイント】ラベル表示を追加
                                            label={<CustomLineLabel />}
                                        />
                                    ))}
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