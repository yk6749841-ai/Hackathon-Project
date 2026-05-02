import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const DIRECT_BLUE = '#1b2045';
const DIRECT_PINK = '#ea145a';
const API_BASE = "https://hackathon-java.onrender.com/api";
const COLORS = [DIRECT_PINK, DIRECT_BLUE, '#4db6ac', '#ffb74d', '#9575cd'];

const AgentReports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        progress: [] as any[],
        metrics: [] as any[],
        types: [] as any[]
    });

    useEffect(() => {
        fetchAndProcessData();
    }, []);

    const fetchAndProcessData = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            // התיקון: תיאום מזהה המשתמש לזה של הסימולטור
            // החליפי את השורה הקיימת בזו:
            const agentIdentifier = user.id; // שימוש ב-ID המספרי בלבד, בלי agentCode            
            const res = await axios.get(`${API_BASE}/agent/${agentIdentifier}/history`);
            const history = res.data;

            if (history && Array.isArray(history) && history.length > 0) {
                // 1. עיבוד גרף קו - ציונים לאורך זמן
                const progress = history
                    .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
                    .map((s: any) => ({
                        date: new Date(s.createdAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
                        score: s.finalScore || 0
                    }));

                // 2. עיבוד גרף עמודות - ממוצע ציונים
                const avgScore = history.reduce((acc: number, curr: any) => acc + (curr.finalScore || 0), 0) / history.length;
                const metrics = [
                    { name: 'ציון ממוצע', score: Number(avgScore.toFixed(1)) },
                    { name: 'שיא אישי', score: Math.max(...history.map((s: any) => s.finalScore || 0)) },
                    { name: 'יציבות', score: 8.5 }
                ];

                // 3. עיבוד גרף עוגה - חלוקה לפי רמות ציון
                const excellent = history.filter((s: any) => s.finalScore >= 9).length;
                const good = history.filter((s: any) => s.finalScore >= 7 && s.finalScore < 9).length;
                const needsWork = history.filter((s: any) => s.finalScore < 7).length;

                const types = [
                    { name: 'מצוין (9+)', value: excellent },
                    { name: 'טוב (7-9)', value: good },
                    { name: 'לשיפור', value: needsWork }
                ].filter(t => t.value > 0);

                setStats({ progress, metrics, types });
            }
        } catch (err) {
            console.error("שגיאה בעיבוד נתונים לדוחות:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: DIRECT_PINK }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, direction: 'rtl' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: DIRECT_PINK }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: DIRECT_BLUE }}>דוחות ביצועים ושיפור</Typography>
            </Box>

            {stats.progress.length === 0 ? (
                <Typography>אין מספיק נתונים להצגת גרפים. בצע סימולציות כדי לראות תוצאות.</Typography>
            ) : (
                <Grid container spacing={4}>
                    {/* גרף קו - מגמת שיפור */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: DIRECT_BLUE }}>גרף התקדמות (ציונים לאורך זמן)</Typography>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={stats.progress}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="score" name="ציון" stroke={DIRECT_PINK} strokeWidth={4} dot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* גרף עוגה - התפלגות איכות */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: DIRECT_BLUE, textAlign: 'center' }}>איכות השיחות</Typography>
                            <Box sx={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={stats.types} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                                            {stats.types.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* גרף עמודות - KPI */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: DIRECT_BLUE }}>סיכום מדדי הצלחה</Typography>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={stats.metrics} barSize={60}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                                        <Tooltip cursor={{ fill: '#f5f5f5' }} />
                                        <Bar dataKey="score" name="ציון" fill={DIRECT_BLUE} radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default AgentReports;