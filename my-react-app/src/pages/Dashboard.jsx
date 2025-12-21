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

// カテゴリ名またはスキル名から色を取得する
const getSkillColor = (name) => {
    // カテゴリ名との一致を確認
    if (name === SKILL_MAP.action.label) return SKILL_MAP.action.color;
    if (name === SKILL_MAP.thinking.label) return SKILL_MAP.thinking.color;
    if (name === SKILL_MAP.teamwork.label) return SKILL_MAP.teamwork.color;

    // スキル名が含まれるか確認
    if (SKILL_MAP.action.skills.includes(name)) return SKILL_MAP.action.color;
    if (SKILL_MAP.thinking.skills.includes(name)) return SKILL_MAP.thinking.color;
    return SKILL_MAP.teamwork.color;
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

    // グラフ用にデータを整形（各時点でのカテゴリ平均値を計算して追加）
    const chartData = useMemo(() => {
        return [...history].reverse().map(item => {
            const baseData = {
                date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
                ...item.scores
            };
            
            // カテゴリごとの平均値を計算してデータに追加
            Object.values(SKILL_MAP).forEach(cat => {
                const total = cat.skills.reduce((sum, skill) => sum + (item.scores[skill] || 0), 0);
                const avg = total / cat.skills.length;
                baseData[cat.label] = avg; // キー名を「前に踏み出す力」などにする
            });

            return baseData;
        });
    }, [history]);

    // タイムラインに表示する項目のリスト生成（ソート処理含む）
    const displaySkillsForTimeline = useMemo(() => {
        let targets = [];
        
        // 最新のグラフデータ（chartDataの最後尾）を取得してソートに使用
        // chartDataはreverse済み（古い順）なので、最後の要素が最新
        const latestChartData = chartData[chartData.length - 1] || {};

        if (viewMode === 'summary') {
            // Summaryモード：3つのカテゴリ名を表示対象にする
            targets = Object.values(SKILL_MAP).map(v => v.label);
        } else if (selectedCategory && SKILL_MAP[selectedCategory]) {
            // Detailモード：選択されたカテゴリ内のスキルを表示対象にする
            targets = SKILL_MAP[selectedCategory].skills;
        }
        
        // 最新のスコア（カテゴリ平均 or 個別スキル）が高い順にソート
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
        let color = '#64748b';
        let isClickable = false;

        if (viewMode === 'summary') {
            const found = Object.values(SKILL_MAP).find(v => v.label === label);
            if (found) {
                color = found.color;
                isClickable = true;
            }
        } else {
            color = getSkillColor(label);
        }

        return (
            <text
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
                {...rest}
            >
                {label}
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
            color: category.color
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
                                        fillOpacity={0.4} 
                                        strokeWidth={3}
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
                                ※ 最新スコアが高い順に表示されています。<br/>
                                {viewMode === 'summary' 
                                    ? "レーダーチャートの項目名をクリックすると詳細に絞り込めます。" 
                                    : "左上の矢印ボタンで全体表示に戻ります。"}
                            </Typography>
                        </Box>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                    data={chartData} 
                                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} />
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