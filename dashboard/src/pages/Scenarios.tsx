import React, { useState, useEffect } from 'react';
import {
    Button, Box, Typography, Card, CardContent,
    Chip, Avatar, Paper, Grid, IconButton
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditIcon from '@mui/icons-material/Edit';
import ScriptForm from '../components/ScriptForm';
import { managerApi } from '../services/api'; // הוספנו את ה-API מול Java
import DeleteIcon from '@mui/icons-material/Delete';

const DataItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1b2045', fontSize: '1.05rem' }}>
            {value}
        </Typography>
    </Box>
);

export const Scenarios: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [scripts, setScripts] = useState<any[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    // 1. עכשיו מושכים את התרחישים משרת ה-Java (DB) ולא מהדפדפן!
    // 1. פונקציית המשיכה
    const fetchScenarios = async () => {
        try {
            const res = await managerApi.getScenarios();
            const reconstructedScripts = res.data.map((item: any) => {
                if (item.rawData) {
                    const parsed = JSON.parse(item.rawData);
                    return { ...parsed, id: item.id }; // ה-id מה-Java חייב להיכנס לכאן!
                }
                return { ...item, id: item.id };
            });
            setScripts(reconstructedScripts);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    // מפעילים ברגע שהדף עולה
    useEffect(() => {
        fetchScenarios();
    }, []);

    const openNewScenario = () => {
        setEditIndex(null);
        setIsFormOpen(true);
    };

    const openEditScenario = (index: number) => {
        setEditIndex(index);
        setIsFormOpen(true);
    };


const handleSave = async (newScript: any) => {
    try {
        const scriptWithDate = {
            ...newScript,
            createdAt: newScript.createdAt || new Date().toISOString()
        };

        // קריאה לשרת הפייתון המקומי דרך מנהל ה-API
        const initResponse = await managerApi.initializeSimulation(scriptWithDate);

        if (initResponse.status !== 200) throw new Error("בניית התרחיש נכשלה");

        alert("התרחיש נשמר בהצלחה!");
        await fetchScenarios(); // ריענון משרת ה-Java
        setIsFormOpen(false);
        setEditIndex(null);

    } catch (error) {
        console.error("שגיאה:", error);
        alert("וודאי ששרת הפייתון מופעל בפורט 8001");
    }
};

    const handleDelete = async (id: number) => {
        // וידוא הריגה - שלא ימחקו בטעות
        if (window.confirm("האם את בטוחה שאת רוצה למחוק את התסריט הזה?")) {
            try {
                await managerApi.deleteScenario(id);
                // אחרי המחיקה בשרת, נרענן את הרשימה על המסך
                fetchScenarios();
            } catch (error) {
                console.error("שגיאה במחיקה:", error);
                alert("הייתה בעיה במחיקת התסריט.");
            }
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper elevation={0} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                mb: 4, p: 3, bgcolor: 'white', borderRadius: '20px', width: '100%',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1b2045', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SmartToyIcon sx={{ color: '#ea145a', fontSize: '2.5rem' }} />
                        ניהול <span style={{ color: '#ea145a' }}>תסריטי שיחה</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        פלטפורמה חכמה ליצירה, עריכה ומעקב אחר תסריטי שיחה מנצחים עבור נציגי השירות והמכירות.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={openNewScenario}
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    sx={{ bgcolor: '#ea145a', borderRadius: '12px', px: 4, py: 1.5, fontWeight: 800, '&:hover': { bgcolor: '#c90e4a' } }}
                >
                    תרחיש חדש
                </Button>
            </Paper>

            <Typography variant="h6" sx={{ mb: 3, color: '#1b2045', fontWeight: 800 }}>
                מאגר תסריטים פעילים ({scripts.length})
            </Typography>

            <Grid container spacing={3}>
                {scripts.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: '24px', bgcolor: 'white', border: '2px dashed rgba(27, 32, 69, 0.1)' }}>
                            <Typography sx={{ color: 'text.secondary', fontSize: '1.3rem', fontWeight: 500 }}>
                                המאגר ריק כרגע. זה הזמן ליצור את התסריט הראשון שלך!
                            </Typography>
                        </Paper>
                    </Grid>
                ) : (
                    scripts.map((s, i) => (
                        <Grid size={{ xs: 12 }} key={i}>
                            <Card elevation={0} sx={{
                                borderRadius: '20px', bgcolor: 'white',
                                border: '1px solid rgba(0,0,0,0.05)', position: 'relative',
                                '&:hover': { boxShadow: '0 15px 35px rgba(27, 32, 69, 0.05)' }
                            }}>
                                <Box sx={{ position: 'absolute', top: '16px', right: 0, bottom: '16px', width: '4px', bgcolor: '#ea145a', borderRadius: '4px 0 0 4px' }} />

                                <Box sx={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, display: 'flex', gap: 1 }}>
                                    {/* כפתור עריכה */}
                                    <IconButton
                                        onClick={() => openEditScenario(i)}
                                        sx={{ bgcolor: '#f4f6f9', color: '#1b2045', '&:hover': { bgcolor: '#1b2045', color: 'white' } }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>

                                    {/* כפתור מחיקה - הורדתי את התנאי של s.id כדי שתראי אותו קודם כל מופיע */}
                                    <IconButton
                                        onClick={() => handleDelete(s.id)}
                                        sx={{
                                            bgcolor: '#f4f6f9',
                                            color: '#d32f2f', // אדום של מחיקה
                                            '&:hover': {
                                                bgcolor: '#d32f2f',
                                                color: 'white',
                                                transform: 'scale(1.1)' // קצת תנועה הופכת את זה ליותר אינטראקטיבי
                                            },
                                            transition: 'all 0.2s'
                                        }}
                                        title="מחק תרחיש"
                                    >
                                        <DeleteIcon fontSize="small" />                                    </IconButton>
                                </Box>

                                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                    <Grid container spacing={4}>
                                        <Grid size={{ xs: 12, md: 3 }} sx={{ borderLeft: { md: '1px solid rgba(0,0,0,0.05)' }, pl: { md: 4 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                                <Avatar sx={{ bgcolor: 'rgba(234, 20, 90, 0.1)', color: '#ea145a', width: 56, height: 56, fontWeight: 800, fontSize: '1.2rem' }}>
                                                    {s.customerName ? s.customerName.substring(0, 2).toUpperCase() : 'CU'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>לקוח</Typography>
                                                    <Typography variant="h6" sx={{ color: '#1b2045', fontWeight: 800, lineHeight: 1 }}>{s.customerName}</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                                <DataItem label="ת.ז" value={s.customerId || '-'} />
                                                <DataItem label="פוליסה" value={s.policyNumber || '-'} />
                                                <DataItem label="אשראי" value={s.lastDigits || '-'} />
                                                <DataItem label="קוד SMS" value={s.smsCode || '-'} />
                                            </Box>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 9 }}>
                                            <Box sx={{ mb: 3, pr: { md: 4 } }}>
                                                <Typography variant="subtitle2" sx={{ color: '#ea145a', fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    סיבת הפנייה המרכזית
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#1b2045', bgcolor: '#f8f9fc', p: 2, borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                                                    {s.reason || 'לא צוינה סיבה'}
                                                </Typography>
                                            </Box>

                                            <Grid container spacing={3}>
                                                <Grid size={{ xs: 12, md: 5 }}>
                                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>מצב רגשי / קונפליקט:</Typography>
                                                    <Typography variant="body2" sx={{ color: '#1b2045', fontStyle: 'italic', bgcolor: '#fff0f4', p: 1.5, borderRadius: '8px' }}>
                                                        {s.conflict || 'ללא קונפליקט מיוחד'}
                                                    </Typography>
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 7 }}>
                                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>זרימת השיחה (שאלות ותשובות):</Typography>
                                                    {s.questions && s.questions.length > 0 ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                            {s.questions.map((q: any, idx: number) => (
                                                                <Box key={idx} sx={{ position: 'relative', pr: 2, borderRight: '2px solid rgba(234, 20, 90, 0.3)' }}>
                                                                    <Typography variant="body2" sx={{ color: '#1b2045', fontWeight: 600 }}>
                                                                        ש: {q.question}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
                                                                        ת: {q.answer}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>לא הוגדרו שאלות ותשובות.</Typography>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {s.createdAt && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <Chip
                                                label={`נוצר: ${new Date(s.createdAt).toLocaleDateString('he-IL')} | ${new Date(s.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`}
                                                size="small"
                                                sx={{ bgcolor: '#f4f6f9', color: 'text.secondary', fontWeight: 600 }}
                                            />
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            <ScriptForm
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditIndex(null); }}
                onSave={handleSave}
                initialData={editIndex !== null ? scripts[editIndex] : null}
            />

        </Box>
    );
};