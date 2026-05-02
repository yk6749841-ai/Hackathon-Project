import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Divider, Box, IconButton, Grid as Grid
} from '@mui/material';

type QA = { question: string; answer: string };

interface ScriptFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any; // הוספנו את ה-Prop הזה בשביל העריכה
}

const DIRECT_BLUE = '#1a1f4c';
const DIRECT_PINK = '#e61e54';
const LIGHT_BG = '#f4f6f9';

const ScriptForm: React.FC<ScriptFormProps> = ({ open, onClose, onSave, initialData }) => {
    const [qaList, setQaList] = React.useState<QA[]>([{ question: '', answer: '' }]);

    // טוען את השאלות הקיימות אם אנחנו בעריכה, או מאפס אם זה חדש
    React.useEffect(() => {
        if (open) {
            if (initialData && initialData.questions && initialData.questions.length > 0) {
                setQaList(initialData.questions);
            } else {
                setQaList([{ question: '', answer: '' }]);
            }
        }
    }, [initialData, open]);

    const addQA = () => setQaList([...qaList, { question: '', answer: '' }]);
    const removeQA = (index: number) => setQaList(qaList.filter((_, i) => i !== index));

    const handleQAChange = (index: number, field: keyof QA, value: string) => {
        const newList = [...qaList];
        newList[index][field] = value;
        setQaList(newList);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const baseData = Object.fromEntries(formData.entries());
        const cleanedQA = qaList.filter(item => item.question.trim() || item.answer.trim());

        const payload = {
            ...initialData, // שומר על נתונים מהעבר (כמו ID) אם קיימים
            ...baseData,
            questions: cleanedQA,
            createdAt: initialData?.createdAt || new Date().toISOString(), // לא דורס תאריך יצירה קיים בעריכה
        };

        onSave(payload);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{
                '& .MuiDialog-paper': { borderRadius: 4, padding: 1 },
                direction: 'rtl'
            }}
        >
            {/* ה-key גורם לטופס להתאפס לחלוטין כשעוברים מלקוח ללקוח */}
            <form onSubmit={handleSubmit} key={initialData ? JSON.stringify(initialData) : 'new_form'}>
                <DialogTitle sx={{
                    fontWeight: 900,
                    color: DIRECT_BLUE,
                    fontSize: '1.8rem',
                    textAlign: 'center',
                    pt: 3
                }}>
                    {initialData ? 'עריכת תסריט קיים' : 'הוספת תסריט חדש'}
                </DialogTitle>

                <DialogContent sx={{ border: 'none', direction: 'rtl' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2 }}>

                        {/* חלק 1: פרטי הלקוח */}
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: DIRECT_BLUE, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 4, height: 24, bgcolor: DIRECT_PINK, borderRadius: 1 }} />
                                חלק 1: פרטי הלקוח
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField name="customerName" defaultValue={initialData?.customerName || ''} label="שם הלקוח" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField name="customerId" defaultValue={initialData?.customerId || ''} label="תעודת זהות" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField name="policyNumber" defaultValue={initialData?.policyNumber || ''} label="מספר פוליסה" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField name="lastDigits" defaultValue={initialData?.lastDigits || ''} label="4 ספרות אחרונות באשראי" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ opacity: 0.6 }} />

                        {/* חלק 2: עלילת התרחיש */}
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: DIRECT_BLUE, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 4, height: 24, bgcolor: DIRECT_PINK, borderRadius: 1 }} />
                                חלק 2: עלילת התרחיש
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField name="reason" defaultValue={initialData?.reason || ''} label="סיבת הפנייה המרכזית" multiline rows={3} fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField name="conflict" defaultValue={initialData?.conflict || ''} label="מצב רגשי / קונפליקט" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ opacity: 0.6 }} />

                        {/* חלק 3: שאלות ותשובות */}
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: DIRECT_BLUE, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 4, height: 24, bgcolor: DIRECT_PINK, borderRadius: 1 }} />
                                חלק 3: שאלות ותשובות
                            </Typography>
                            {qaList.map((item, index) => (
                                <Box key={index} sx={{
                                    mb: 3, p: 3, bgcolor: LIGHT_BG, borderRadius: 4, position: 'relative', border: '1px solid #e0e6ed'
                                }}>
                                    <Grid container spacing={2} sx={{ alignItems: 'flex-start', direction: 'rtl' }}>
                                        <Grid size={{ xs: 1 }} sx={{ display: 'flex', justifyContent: 'center', pt: 1, order: 2 }}>
                                            <IconButton color="error" onClick={() => removeQA(index)} sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#fee2e2' }, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>✕</span>
                                            </IconButton>
                                        </Grid>

                                        <Grid size={{ xs: 11 }} sx={{ order: 1 }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        label={`שאלה ${index + 1}`}
                                                        fullWidth
                                                        variant="filled"
                                                        value={item.question}
                                                        onChange={(e) => handleQAChange(index, 'question', e.target.value)}
                                                        sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiFilledInput-root': { bgcolor: 'white', borderRadius: 2 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        label="תשובה מצופה"
                                                        fullWidth
                                                        variant="filled"
                                                        value={item.answer}
                                                        onChange={(e) => handleQAChange(index, 'answer', e.target.value)}
                                                        sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiFilledInput-root': { bgcolor: 'white', borderRadius: 2 }, '& label': { left: 'inherit', right: '1.75rem', transformOrigin: 'right' } }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                            <Button
                                variant="outlined"
                                onClick={addQA}
                                fullWidth
                                sx={{
                                    borderStyle: 'dashed', borderRadius: 3, py: 1.5, color: DIRECT_BLUE, borderColor: DIRECT_BLUE, fontWeight: 'bold', fontSize: '1rem',
                                    '&:hover': { borderStyle: 'dashed', bgcolor: 'rgba(26, 31, 76, 0.04)' }
                                }}
                            >
                                <span style={{ marginLeft: '8px', fontSize: '1.2rem' }}>➕</span> הוסף שאלה ותשובה נוספת
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 4, justifyContent: 'center', gap: 2, direction: 'rtl' }}>
                    <Button onClick={onClose} sx={{ color: DIRECT_BLUE, fontWeight: 700, px: 4, borderRadius: 10 }}>
                        ביטול
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            bgcolor: DIRECT_PINK, color: 'white', fontWeight: 700, px: 6, py: 1.5, borderRadius: 10, fontSize: '1.1rem',
                            boxShadow: '0 4px 14px 0 rgba(230, 30, 84, 0.39)',
                            '&:hover': { bgcolor: '#c21848', boxShadow: '0 6px 20px rgba(230, 30, 84, 0.23)' }
                        }}
                    >
                        {initialData ? 'עדכן תסריט' : 'שמור תסריט'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ScriptForm;