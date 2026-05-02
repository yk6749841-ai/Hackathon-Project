import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Grid, Card, CardContent, Typography, Avatar, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Select,
    MenuItem, FormControl, InputLabel, Paper, Divider, Chip, Collapse,
    CircularProgress
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { managerApi } from '../services/api';
import type { Scenario, SimulationResult, User } from '../types';

const DIRECT_BLUE = '#1b2045';
const DIRECT_PINK = '#ea145a';

export const AgentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [agent, setAgent] = useState<User | null>(null);
    const [history, setHistory] = useState<SimulationResult[]>([]);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<number | ''>('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('NORMAL');

    useEffect(() => {
        const loadAgentData = async () => {
            try {
                const res = await managerApi.searchAgent('');
                const foundAgent = res.data.find(a => a.id === Number(id));
                if (foundAgent) {
                    setAgent(foundAgent);
                    const histRes = await managerApi.getResultsByAgent(foundAgent.id);
                    setHistory(histRes.data);
                }
            } catch (err) {
                console.error("Error loading agent details:", err);
            }
        };

        managerApi.getScenarios().then(res => setScenarios(res.data));
        loadAgentData();
    }, [id]);

    const handleAssignSubmit = async () => {
        if (!selectedScenario) return;
        try {
            await managerApi.assignToAgent(Number(id), Number(selectedScenario), selectedDifficulty);
            setOpenDialog(false);
            alert('התרחיש שויך בהצלחה!');
        } catch (err) {
            alert('שגיאה בשיוך התרחיש');
        }
    };

    if (!agent) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: '1400px', margin: '0 auto', p: 2, direction: 'rtl' }}>
            <Button
                startIcon={<ArrowForwardIcon sx={{ ml: 1 }} />}
                onClick={() => navigate('/dashboard')}
                sx={{ color: DIRECT_BLUE, fontWeight: 800, mb: 4 }}
            >
                חזרה לרשימת הנציגים
            </Button>

            <Grid container spacing={4}>
                {/* פרופיל נציג */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid rgba(27, 32, 69, 0.05)', textAlign: 'center', p: 4 }}>
                        <Avatar src={agent.pictureUrl} sx={{ width: 120, height: 120, margin: '0 auto', mb: 3, border: `4px solid #f3f5f9`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Typography variant="h4" sx={{ fontWeight: 900, color: DIRECT_BLUE }}>{agent.fullName}</Typography>
                        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 4 }}>מזהה: {agent.id}</Typography>

                        <Box sx={{ textAlign: 'right', bgcolor: '#f3f5f9', p: 3, borderRadius: '16px', mb: 4 }}>
                            <Typography><strong>אימייל:</strong> {agent.email}</Typography>
                            <Typography><strong>ת.ז:</strong> {agent.idNumber || '---'}</Typography>
                            <Typography><strong>דרגה:</strong> {agent.rank || 'נציג'}</Typography>
                        </Box>

                        <Button variant="contained" fullWidth onClick={() => setOpenDialog(true)} sx={{ bgcolor: DIRECT_PINK, borderRadius: '16px', py: 1.5, fontWeight: 800 }}>
                            שיוך תרחיש אימון
                        </Button>
                    </Card>
                </Grid>

                {/* היסטוריית סימולציות */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="h5" sx={{ mb: 4, color: DIRECT_BLUE, fontWeight: 800 }}>היסטוריית סימולציות</Typography>
                    {history.slice().reverse().map((sim) => (
                        <Card key={sim.id} sx={{ borderRadius: '20px', mb: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                            <CardContent
                                onClick={() => setExpandedId(expandedId === sim.id ? null : sim.id)}
                                sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: DIRECT_BLUE }}>{sim.scenario?.name || 'סימולציה'}</Typography>
                                    <Typography variant="body2" color="textSecondary">{new Date(sim.createdAt).toLocaleDateString('he-IL')}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip label={sim.finalScore} sx={{ bgcolor: DIRECT_PINK, color: 'white', fontWeight: 900, fontSize: '1.1rem' }} />
                                    <ExpandMoreIcon sx={{ transform: expandedId === sim.id ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                </Box>
                            </CardContent>

                            <Collapse in={expandedId === sim.id}>
                                <Divider />
                                <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: DIRECT_PINK, mb: 1 }}>משוב AI:</Typography>
                                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{sim.feedback || "אין משוב."}</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 7 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: DIRECT_BLUE, mb: 1 }}>תמליל השיחה:</Typography>
                                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white', maxHeight: 250, overflow: 'auto', borderRadius: 2 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                                    {/* שימוש בשם השדה fullTranscript שמצאנו ב-Console */}
                                                    {sim.fullTranscript || (sim as any).transcript || "התמליל אינו זמין כרגע."}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Collapse>
                        </Card>
                    ))}
                </Grid>
            </Grid>

            {/* דיאלוג שיוך */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 900, textAlign: 'center' }}>שיוך תרחיש</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    <FormControl fullWidth variant="filled">
                        <InputLabel>בחר תרחיש</InputLabel>
                        <Select value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value as number)}>
                            {scenarios.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
                    <Button variant="contained" onClick={handleAssignSubmit} sx={{ bgcolor: DIRECT_PINK, px: 4 }}>שייך</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};