import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Collapse, IconButton, Divider, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

const DIRECT_BLUE = '#1b2045';
const DIRECT_PINK = '#ea145a';
const API_BASE = "https://hackathon-java.onrender.com/api";

const AgentHistory: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const agentIdentifier = user.id; // שימוש ב-ID המספרי

            const res = await axios.get(`${API_BASE}/agent/${agentIdentifier}/history`);

            if (res.data && Array.isArray(res.data)) {
                // מניעת כפילויות מהשרת ומיון
                const uniqueData = res.data.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.id === v.id) === i);
                const sortedData = uniqueData.sort((a: any, b: any) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                setHistory(sortedData);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
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
                <HistoryIcon sx={{ fontSize: 40, color: DIRECT_PINK }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: DIRECT_BLUE }}>היסטוריית סימולציות</Typography>
            </Box>

            {history.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
                    <Typography variant="h6" color="text.secondary">עדיין לא בוצעו סימולציות במערכת.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {history.map((sim) => (
                        <Grid item xs={12} key={sim.id}>
                            <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #edf2f7', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Box sx={{
                                            bgcolor: sim.finalScore >= 90 ? '#e8f5e9' : sim.finalScore >= 70 ? '#fff8e1' : '#ffebee',
                                            p: 2, borderRadius: '12px', textAlign: 'center', minWidth: '80px'
                                        }}>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: sim.finalScore >= 90 ? '#2e7d32' : sim.finalScore >= 70 ? '#f57f17' : '#c62828' }}>
                                                {sim.finalScore}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ציון</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: DIRECT_BLUE }}>
                                                {sim.scenarioName || 'סימולציית שירות'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {new Date(sim.createdAt).toLocaleDateString('he-IL')} | {new Date(sim.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={() => toggleExpand(sim.id)} sx={{ bgcolor: '#f0f2f5' }}>
                                        {expandedId === sim.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Box>

                                <Collapse in={expandedId === sim.id}>
                                    <Divider />
                                    <Box sx={{ p: 3, bgcolor: '#fafbfc' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DIRECT_PINK, mb: 1 }}>משוב מפורט:</Typography>
                                        <Typography variant="body1" sx={{ mb: 3, color: '#333', lineHeight: 1.6 }}>{sim.feedback}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DIRECT_BLUE, mb: 1 }}>תמליל השיחה:</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DIRECT_BLUE, mb: 1 }}>תמליל השיחה:</Typography>
                                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                                            {(() => {
                                                if (!sim.transcript || sim.transcript === '[]') return "לא הוקלט תמליל לשיחה זו.";
                                                try {
                                                    const parsed = JSON.parse(sim.transcript);
                                                    return parsed.map((msg: any, idx: number) => (
                                                        <Box key={idx} sx={{ mb: 1.5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 900, color: msg.role === 'user' ? DIRECT_PINK : DIRECT_BLUE, display: 'block' }}>
                                                                {msg.role === 'user' ? 'נציג' : 'לקוח'}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#444', bgcolor: msg.role === 'user' ? '#fff0f5' : '#f0f4f8', p: 1, borderRadius: '8px', display: 'inline-block' }}>
                                                                {msg.text}
                                                            </Typography>
                                                        </Box>
                                                    ));
                                                } catch (e) {
                                                    // למקרה שנשמרו נתונים ישנים כטקסט פשוט
                                                    return <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{sim.transcript}</Typography>;
                                                }
                                            })()}
                                        </Paper>
                                    </Box>
                                </Collapse>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AgentHistory;