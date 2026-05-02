import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, CircularProgress,
    Card, Grid, Avatar, Chip, Divider, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControl, InputLabel,
    Select, MenuItem, Collapse, Container
} from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { managerApi } from '../services/api';


const DIRECT_BLUE = '#1b2045';
const DIRECT_PINK = '#ea145a';
const BG_SOFT = '#f8fafd';

const AgentHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [history, setHistory] = useState<any[]>([]);
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState('');
    const [difficulty, setDifficulty] = useState('NORMAL');

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setLoading(true);
                const [resHistory, resScenarios] = await Promise.all([
                    managerApi.getResultsByAgent(Number(id)),
                    managerApi.getScenarios()
                ]);

                // --- כאן התיקון: סינון כפילויות לפי ID בדיוק כמו שעשית אצל הנציג ---
                const uniqueHistory = resHistory.data.filter(
                    (v: any, i: any, a: any) => a.findIndex((t: any) => t.id === v.id) === i
                );

                setHistory(uniqueHistory); // שומרים את הרשימה הנקייה
                setScenarios(resScenarios.data);
            } catch (err) {
                console.error("שגיאה בטעינת נתונים:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [id]);

    const handleAssignSubmit = async () => {
        if (!selectedScenario) return;
        try {
            await managerApi.assignToAgent(Number(id), Number(selectedScenario), difficulty);
            alert("התרחיש שויך בהצלחה!");
            setOpenDialog(false);
        } catch (err) {
            alert("שגיאה בשיוך");
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: BG_SOFT }}>
            <CircularProgress sx={{ color: DIRECT_PINK }} />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: BG_SOFT, py: 3, px: 1, direction: 'rtl' }}>
            {/* maxWidth={false} מאפשר להתפרס על כל הרוחב הזמין */}
            <Container maxWidth={false} sx={{ px: { xs: 1, md: 3 } }}>

                {/* כותרת עליונה */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, px: 1 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: DIRECT_BLUE }}>תיק ביצועי נציג</Typography>
                        <Typography variant="body1" color="text.secondary">מגמות שיפור ופירוט סימולציות</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon sx={{ ml: 1 }} />}
                            onClick={() => navigate(-1)}
                            sx={{ borderRadius: '10px', color: DIRECT_BLUE, borderColor: DIRECT_BLUE, fontWeight: 700 }}
                        >
                            חזרה
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon sx={{ ml: 1 }} />}
                            onClick={() => setOpenDialog(true)}
                            sx={{
                                borderRadius: '10px', bgcolor: DIRECT_PINK, px: 3, fontWeight: 800,
                                boxShadow: '0 4px 12px rgba(234, 20, 90, 0.2)',
                                '&:hover': { bgcolor: '#c2185b' }
                            }}
                        >
                            שיוך תרגול חדש
                        </Button>
                    </Box>
                </Box>

                {/* @ts-ignore */}
                <Grid container spacing={3} alignItems="stretch">
                    {/* צד ימין - רשימת סימולציות (רוחב 65% בערך) */}
                    <Grid size={{ xs: 12, md: 7.5 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: DIRECT_BLUE, px: 1 }}>היסטוריית פעילות</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {history.length === 0 ? (
                                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '20px', border: '2px dashed #ccc' }}>
                                    <Typography color="text.secondary">אין סימולציות להצגה</Typography>
                                </Paper>
                            ) : (
                                history.slice().reverse().map((run) => (
                                    <Card
                                        key={run.id}
                                        elevation={0}
                                        sx={{
                                            borderRadius: '16px', border: '1px solid rgba(27, 32, 69, 0.08)',
                                            transition: '0.2s ease', bgcolor: 'white',
                                            '&:hover': { boxShadow: '0 8px 24px rgba(27, 32, 69, 0.05)' }
                                        }}
                                    >
                                        <Box
                                            onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                                            sx={{ p: 2.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Chip
                                                    label={run.finalScore || 0}
                                                    sx={{
                                                        height: 45, width: 45, fontWeight: 900, fontSize: '1.1rem',
                                                        bgcolor: (run.finalScore || 0) >= 7 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(234, 20, 90, 0.1)',
                                                        color: (run.finalScore || 0) >= 7 ? '#2e7d32' : DIRECT_PINK,
                                                        border: '1px solid currentColor'
                                                    }}
                                                />
                                                <Box>
                                                    <Typography sx={{ fontWeight: 800, color: DIRECT_BLUE, fontSize: '1.1rem' }}>
                                                        {run.scenario?.name || 'תרחיש שירות'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {run.createdAt ? new Date(run.createdAt).toLocaleDateString('he-IL') : '-'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <ExpandMoreIcon sx={{ transform: expandedId === run.id ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                        </Box>

                                        <Collapse in={expandedId === run.id} timeout="auto">
                                            <Divider sx={{ mx: 3 }} />
                                            <Box sx={{ p: 3, bgcolor: '#fafbfc' }}>
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 5 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: DIRECT_PINK, mb: 1 }}>משוב מפורט</Typography>
                                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', minHeight: '120px', bgcolor: 'white' }}>
                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{run.feedback || "אין משוב."}</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 7 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: DIRECT_BLUE, mb: 1 }}>תמליל שיחה</Typography>
                                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', maxHeight: 250, overflow: 'auto', bgcolor: 'white' }}>
                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                                                {run.fullTranscript || "התמליל אינו זמין."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Collapse>
                                    </Card>
                                ))
                            )}
                        </Box>
                    </Grid>

                    {/* צד שמאל - גרף ביצועים (רוחב 35% בערך) */}
                    <Grid size={{ xs: 12, md: 4.5 }}>
                        <Box sx={{ position: 'sticky', top: 90 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: DIRECT_BLUE, px: 1 }}>מגמת ציונים</Typography>
                            <Card sx={{ p: 3, borderRadius: '20px', boxShadow: '0 10px 30px rgba(27, 32, 69, 0.05)', border: '1px solid rgba(27, 32, 69, 0.05)' }}>
                                <Box sx={{ width: '100%', height: 380 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={history.map((r, i) => ({ date: i + 1, score: r.finalScore || 0 }))}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={DIRECT_PINK} stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor={DIRECT_PINK} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="date" hide />
                                            <YAxis domain={[0, 10]} ticks={[0, 5, 10]} axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e' }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="score" stroke={DIRECT_PINK} strokeWidth={4} fill="url(#colorScore)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                                    ניתוח מגמה על פני {history.length} סימולציות אחרונות
                                </Typography>
                            </Card>
                        </Box>
                    </Grid>

                </Grid>

                {/* דיאלוג שיוך */}
                {/* דיאלוג שיוך */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs" sx={{ '& .MuiDialog-paper': { borderRadius: '20px' } }}>
                    <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', color: DIRECT_BLUE }}>שיוך תרגול חדש</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <FormControl fullWidth variant="filled">
                                <InputLabel>בחר תרחיש</InputLabel>
                                <Select value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
                                    {scenarios.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                        <Button onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary' }}>ביטול</Button>
                        <Button onClick={handleAssignSubmit} variant="contained" sx={{ bgcolor: DIRECT_PINK, px: 6, fontWeight: 800 }}>אשר ושייך</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AgentHistory;