import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    Button, Box, Typography, Card, CardContent,
    Chip, Container, Avatar, Paper, Grid
} from "@mui/material";
import ScriptForm from './ScriptForm';

// --- הגדרות ה-Theme ---
const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: "'Heebo', sans-serif",
        h1: { fontWeight: 900, fontSize: '3.5rem', letterSpacing: '-1.5px' },
        h5: { fontWeight: 800, letterSpacing: '-0.5px' },
        subtitle1: { fontWeight: 700, fontSize: '1.1rem' },
        body1: { lineHeight: 1.7 },
    },
    palette: {
        primary: {
            main: '#ea145a',
            dark: '#c90e4a',
        },
        secondary: {
            main: '#1b2045',
        },
        background: {
            default: '#f3f5f9',
        },
        text: {
            primary: '#1b2045',
            secondary: '#6e7496',
        }
    },
});

const DataItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '1.05rem' }}>
            {value}
        </Typography>
    </Box>
);

const Dashboard = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [scripts, setScripts] = useState<any[]>([]);

    useEffect(() => {
        const savedScripts = localStorage.getItem('mySavedScripts');
        if (savedScripts) {
            setScripts(JSON.parse(savedScripts));
        }
    }, []);

    const openNewScenario = async () => {
        try {
            console.log("שולח בקשה לאיפוס בשרת (Port 8000)...");
            await fetch('http://localhost:8000/reset-scenario', { method: 'POST' });
            setIsFormOpen(true);
        } catch (error) {
            console.error("לא ניתן לאפס את התרחיש", error);
            setIsFormOpen(true);
        }
    };

    const handleSave = async (newScript: any) => {
        try {
            const scriptWithDate = {
                ...newScript,
                createdAt: newScript.createdAt || new Date().toISOString()
            };

            const saveResponse = await fetch('http://localhost:8000/save-scenario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scriptWithDate),
            });

            if (!saveResponse.ok) throw new Error("השמירה ל-test.json נכשלה");

            const initResponse = await fetch('http://localhost:8000/initialize-simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!initResponse.ok) throw new Error("בניית הפרומפט נכשלה");

            const initResult = await initResponse.json();
            console.log("✅ הפרומפט נוצר בהצלחה:", initResult.final_prompt);

            alert("התרחיש נשמר והסימולציה מוכנה להרצה!");

            const updatedScripts = [...scripts, scriptWithDate];
            setScripts(updatedScripts);
            localStorage.setItem('mySavedScripts', JSON.stringify(updatedScripts));
            setIsFormOpen(false);

        } catch (error) {
            console.error("שגיאה בתהליך המאוחד:", error);
            alert("הייתה בעיה בשמירה או באתחול של התרחיש.");
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>

                <Box sx={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', bgcolor: 'rgba(234, 20, 90, 0.03)' }} />
                <Box sx={{ position: 'absolute', bottom: '100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', bgcolor: 'rgba(27, 32, 69, 0.02)' }} />

                <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>

                    <Grid container spacing={4} sx={{ alignItems: 'center', mb: { xs: 8, md: 12 } }}>
                        {/* שימוש ב-size במקום item xs md */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="h1" component="h1" sx={{ color: 'secondary.main', mb: 2 }}>
                                ניהול <span style={{ color: '#ea145a' }}>תסריטים</span>
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: '600px', lineHeight: 1.6 }}>
                                פלטפורמה חכמה ליצירה, עריכה ומעקב אחר תסריטי שיחה מנצחים עבור נציגי השירות והמכירות.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'right', md: 'left' } }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={openNewScenario}
                                sx={{
                                    borderRadius: '16px',
                                    py: 2, px: 5,
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 12px 30px rgba(234, 20, 90, 0.25)',
                                    '&:hover': { boxShadow: '0 15px 40px rgba(234, 20, 90, 0.35)' }
                                }}
                            >
                                צור תרחיש חדש +
                            </Button>
                        </Grid>
                    </Grid>

                    <Box>
                        <Typography variant="h5" sx={{ mb: 6, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: '3px' }} />
                            מאגר תסריטים פעילים ({scripts.length})
                        </Typography>

                        <Grid container spacing={4}>
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
                                            borderRadius: '24px',
                                            bgcolor: 'white',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            border: '1px solid rgba(27, 32, 69, 0.05)',
                                            position: 'relative',
                                            overflow: 'visible',
                                            '&:hover': {
                                                boxShadow: '0 20px 60px rgba(27, 32, 69, 0.08)',
                                                transform: 'translateY(-5px)',
                                            }
                                        }}>
                                            <Box sx={{ position: 'absolute', top: '24px', right: 0, bottom: '24px', width: '4px', bgcolor: 'primary.main', borderRadius: '4px 0 0 4px' }} />

                                            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                                                <Grid container spacing={4}>

                                                    <Grid size={{ xs: 12, md: 3 }} sx={{ borderLeft: { md: '1px solid rgba(27, 32, 69, 0.06)' }, pl: { md: 4 } }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                                            <Avatar sx={{ bgcolor: 'rgba(27, 32, 69, 0.05)', color: 'secondary.main', width: 56, height: 56, fontWeight: 800, fontSize: '1.2rem' }}>
                                                                {s.customerName ? s.customerName.substring(0, 2).toUpperCase() : 'CU'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle1" sx={{ color: 'secondary.main' }}>לקוח</Typography>
                                                                <Typography variant="h5" sx={{ color: 'secondary.main' }}>{s.customerName}</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                                            <DataItem label="ת.ז" value={s.customerId} />
                                                            <DataItem label="פוליסה" value={s.policyNumber} />
                                                            <DataItem label="אשראי (4 ספרות)" value={s.lastDigits} />
                                                            <DataItem label="קוד SMS" value={s.smsCode} />
                                                        </Box>
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 9 }} sx={{ pr: { md: 2 } }}>
                                                        <Box sx={{ mb: 4 }}>
                                                            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <span style={{ fontSize: '1.3rem' }}>📣</span> סיבת הפנייה המרכזית
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ color: 'secondary.main', fontSize: '1.1rem', fontWeight: 500, bgcolor: 'rgba(234, 20, 90, 0.03)', p: 2, borderRadius: '12px', border: '1px solid rgba(234, 20, 90, 0.08)' }}>
                                                                {s.reason}
                                                            </Typography>
                                                        </Box>

                                                        <Grid container spacing={3}>
                                                            <Grid size={{ xs: 12, md: 5 }}>
                                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>מצב רגשי / קונפליקט:</Typography>
                                                                <Typography variant="body2" sx={{ color: 'secondary.main', fontStyle: 'italic', bgcolor: '#f8f9fc', p: 1.5, borderRadius: '8px' }}>
                                                                    {s.conflict}
                                                                </Typography>
                                                            </Grid>

                                                            <Grid size={{ xs: 12, md: 7 }}>
                                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>זרימת השיחה:</Typography>
                                                                {s.questions && s.questions.length > 0 ? (
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                                        {s.questions.map((q: any, idx: number) => (
                                                                            <Box key={idx} sx={{ position: 'relative', pr: 2 }}>
                                                                                <Box sx={{ position: 'absolute', top: '8px', right: 0, width: '6px', height: '6px', bgcolor: 'rgba(27, 32, 69, 0.2)', borderRadius: '50%' }} />
                                                                                <Typography variant="body2" sx={{ color: 'secondary.main' }}>
                                                                                    <b>Q:</b> {q.question}
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{ color: '#00b074', fontWeight: 600 }}>
                                                                                    <b>A:</b> {q.answer}
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

                                                <Box sx={{ position: 'absolute', bottom: '16px', left: '24px' }}>
                                                    <Chip
                                                        label={`נוצר: ${new Date(s.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} | ${new Date(s.createdAt).toLocaleDateString('he-IL')}`}
                                                        size="small"
                                                        sx={{ bgcolor: '#f0f3f7', color: 'text.secondary', fontWeight: 500, borderRadius: '6px', fontSize: '0.75rem' }}
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    </Box>

                    <ScriptForm
                        open={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSave={handleSave}
                    />
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Dashboard;