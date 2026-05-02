import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Card, Avatar, Chip,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../services/api';
import type { User } from '../types'; // ייבוא הטיפוס אם קיים

const PIE_COLORS = ['#006064', '#f57c00', '#b71c1c'];

const ResultsDashboard = () => {
    const [results, setResults] = useState<any[]>([]);
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [agents, setAgents] = useState<User[]>([]); // הוספנו סטייט לנציגים
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
    const [selectedScenario, setSelectedScenario] = useState('');
    const [difficulty, setDifficulty] = useState('NORMAL');
    const navigate = useNavigate();

    // טעינת נתונים אמיתיים מהשרת כולל רשימת הנציגים
    useEffect(() => {
        const loadRealData = async () => {
            try {
                setLoading(true);
                const [resResults, resScenarios, resAgents] = await Promise.all([
                    managerApi.getAllResults(),
                    managerApi.getScenarios(),
                    managerApi.searchAgent('') // שולף את כל הנציגים במערכת
                ]);
                setResults(resResults.data || []);
                setScenarios(resScenarios.data || []);
                setAgents(resAgents.data || []); // שומרים את הנציגים בזיכרון
            } catch (err) {
                console.error("שגיאה בטעינת נתונים מהשרת:", err);
            } finally {
                setLoading(false);
            }
        };
        loadRealData();
    }, []);

    const getScenarioChartData = () => {
        const data = results.reduce((acc: any[], curr) => {
            const name = curr.scenario?.name || "כללי";
            const found = acc.find((i: any) => i.name === name);
            if (found) { found.score = (found.score + curr.finalScore) / 2; }
            else { acc.push({ name, score: curr.finalScore }); }
            return acc;
        }, []);

        data.forEach((d: any) => d.score = Number(d.score.toFixed(1)));
        return data.length > 0 ? data : [{ name: 'אין נתונים', score: 0 }];
    };

    const getPieData = () => {
        if (results.length === 0) return [{ name: 'אין נתונים', value: 1, color: '#eee' }];
        return [
            { name: 'מצטיינים (9-10)', value: results.filter(r => r.finalScore >= 9).length, color: PIE_COLORS[0] },
            { name: 'טובים (7-8.9)', value: results.filter(r => r.finalScore >= 7 && r.finalScore < 9).length, color: PIE_COLORS[1] },
            { name: 'לשיפור (0-6.9)', value: results.filter(r => r.finalScore < 7).length, color: PIE_COLORS[2] },
        ].filter(d => d.value > 0);
    };

    const getTrendData = () => {
        return results.map((r, i) => ({ n: i + 1, score: r.finalScore }));
    };

    const handleOpenAssign = (agentId: number | null) => {
        setSelectedAgentId(agentId);
        setOpenDialog(true);
    };

    const handleAssignSubmit = async () => {
        try {
            if (selectedAgentId === null) {
                await managerApi.assignToAll(Number(selectedScenario), difficulty);
                alert("התרחיש שויך לכל הצוות בהצלחה!");
            } else {
                alert(`פעולת שיוך אישי תופעל מול השרת עבור נציג ${selectedAgentId}`);
            }
            setOpenDialog(false);
            setSelectedScenario('');
        } catch (err) {
            alert("שגיאה בביצוע השיוך. ודאי שהשרת למעלה ומקבל את הבקשה.");
            console.error(err);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress sx={{ color: '#1a237e' }} />
        </Box>
    );

    return (
        <Box sx={{ p: 4, backgroundColor: '#f4f7fc', minHeight: '100vh', direction: 'rtl' }}>

            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', mb: 4, textAlign: 'right' }}>
                לוח בקרה ניהולי - תוצאות סימולציה
            </Typography>

            <Grid container spacing={3} sx={{ mb: 5 }}>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: 420 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>ביצועים לפי תרחיש</Typography>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={getScenarioChartData()}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1a237e" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#00acc1" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} domain={[0, 10]} />
                                <Tooltip />
                                <Bar dataKey="score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: 420 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>פילוח רמות ציון</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={getPieData()}
                                    cx="50%" cy="50%"
                                    outerRadius={90} innerRadius={0}
                                    dataKey="value" label
                                >
                                    {getPieData().map((entry: any, index) => (
                                        <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: 420 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>מגמת ציונים כללית</Typography>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={getTrendData()}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3f51b5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="n" hide />
                                <YAxis axisLine={false} tickLine={false} domain={[0, 10]} />
                                <Tooltip />
                                <Area type="monotone" dataKey="score" stroke="#3f51b5" strokeWidth={3} fill="url(#areaGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>ניהול ופירוט נציגים</Typography>
                <Button
                    variant="contained"
                    startIcon={<GroupAddIcon />}
                    onClick={() => handleOpenAssign(null)}
                    sx={{ bgcolor: '#1a237e', borderRadius: 3, px: 4, py: 1.2, fontWeight: 'bold' }}
                >
                    שיוך תרחיש לכל הצוות
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 6, boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#1a237e' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>נציג</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>תרחיש אחרון</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ציון</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#666' }}>
                                    אין נתונים להצגה. בצעו סימולציה ראשונה כדי לראות תוצאות!
                                </TableCell>
                            </TableRow>
                        ) : (
                            results.map((r) => {
                                // הקסם שלנו: מוצאים את הנציג האמיתי מתוך הרשימה שמשכנו לפי ה-ID
                                const realAgent = agents.find(a =>
                                    a.agentCode === r.traineeId ||
                                    a.id?.toString() === r.traineeId?.toString()
                                );

                                // עכשיו מושכים את השם והתמונה מהנציג האמיתי שמצאנו (אם הוא קיים)
                                const displayName = realAgent?.fullName || r.agent?.fullName || r.user?.fullName || r.traineeId || 'נציג לא ידוע';
                                const displayPic = realAgent?.pictureUrl || r.agent?.pictureUrl || r.user?.pictureUrl || '';
                                const targetId = realAgent?.id || r.agent?.id || r.user?.id || r.traineeId;

                                return (
                                    <TableRow key={r.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar src={displayPic} sx={{ bgcolor: '#ea145a' }}>
                                                    {!displayPic && displayName[0]}
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 600 }}>{displayName}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{r.scenario?.name || 'ללא שם'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={r.finalScore}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    backgroundColor: r.finalScore >= 8 ? '#e8f5e9' : r.finalScore >= 6 ? '#fff3e0' : '#ffebee',
                                                    color: r.finalScore >= 8 ? '#2e7d32' : r.finalScore >= 6 ? '#ef6c00' : '#c62828'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="info"
                                                onClick={() => navigate(`/manager/agent-history/${targetId}`)}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                צפה בהיסטוריה
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pt: 3 }}>
                    {selectedAgentId ? 'שיוך תרחיש אישי' : 'שיוך תרחיש קבוצתי'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>בחר תרחיש</InputLabel>
                            <Select
                                value={selectedScenario}
                                label="בחר תרחיש"
                                onChange={(e) => setSelectedScenario(e.target.value)}
                            >
                                {scenarios.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>רמת קושי</InputLabel>
                            <Select
                                value={difficulty}
                                label="רמת קושי"
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <MenuItem value="EASY">קל</MenuItem>
                                <MenuItem value="NORMAL">רגיל</MenuItem>
                                <MenuItem value="HARD">קשה</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">ביטול</Button>
                    <Button
                        onClick={handleAssignSubmit}
                        variant="contained"
                        disabled={!selectedScenario}
                        sx={{ bgcolor: '#1a237e', px: 4 }}
                    >
                        שייך תרחיש
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ResultsDashboard;