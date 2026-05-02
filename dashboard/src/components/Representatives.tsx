import React, { useState } from 'react';
import {
    Box, Typography, Button, Card, CardContent, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Chip, Avatar, Divider, MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';

// צבעי המותג
const DIRECT_BLUE = '#1b2045';
const DIRECT_PINK = '#ea145a';

// הגדרת המבנה של נציג
type Representative = {
    id: string;
    fullName: string;
    role: string;
    email: string;
    phone: string;
    status: 'פעיל' | 'לא פעיל' | 'בהפסקה';
};

// נתוני דמה התחלתיים כדי שהמסך לא יהיה ריק
const initialReps: Representative[] = [
    { id: '1001', fullName: 'ישראל ישראלי', role: 'נציג מכירות', email: 'israel@direct.co.il', phone: '050-1234567', status: 'פעיל' },
    { id: '1002', fullName: 'שירה כהן', role: 'מנהלת צוות', email: 'shira@direct.co.il', phone: '052-7654321', status: 'פעיל' },
];

const Representatives = () => {
    const [representatives, setRepresentatives] = useState<Representative[]>(initialReps);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // טיפול בשמירת הטופס
    const handleAddRepresentative = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const newRep: Representative = {
            id: formData.get('employeeId') as string,
            fullName: formData.get('fullName') as string,
            role: formData.get('role') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            status: 'פעיל', // ברירת מחדל לנציג חדש
        };

        setRepresentatives([...representatives, newRep]);
        setIsDialogOpen(false);
    };

    // סגנון הכרטיסיות המודרני
    const cardStyle = {
        borderRadius: '24px',
        p: 1,
        bgcolor: 'white',
        boxShadow: '0 10px 40px rgba(27, 32, 69, 0.04)',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(27, 32, 69, 0.05)',
        position: 'relative' as const,
        overflow: 'visible',
        '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 20px 50px rgba(27, 32, 69, 0.1)',
            borderColor: 'rgba(234, 20, 90, 0.3)',
        },
    };

    return (
        <Box sx={{ direction: 'rtl', py: 4 }}>

            {/* Header: כותרת וכפתור הוספה */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: DIRECT_BLUE, mb: 1, letterSpacing: '-1px' }}>
                        צוות הנציגים
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6e7496' }}>
                        ניהול, צפייה והוספת נציגים חדשים למערכת
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    onClick={() => setIsDialogOpen(true)}
                    startIcon={<PersonAddIcon sx={{ ml: 1 }} />}
                    sx={{
                        bgcolor: DIRECT_PINK,
                        color: 'white',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 20px rgba(234, 20, 90, 0.3)',
                        '&:hover': {
                            bgcolor: '#c90e4a',
                            boxShadow: '0 12px 25px rgba(234, 20, 90, 0.4)'
                        }
                    }}
                >
                    הוספת נציג חדש
                </Button>
            </Box>

            {/* רשת הנציגים */}
            <Grid container spacing={4}>
                {representatives.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '24px', border: '2px dashed #e0e6ed' }}>
                            <Typography sx={{ color: '#6e7496', fontSize: '1.2rem' }}>
                                אין נציגים במערכת. לחצו על הכפתור כדי להוסיף את הנציג הראשון.
                            </Typography>
                        </Box>
                    </Grid>
                ) : (
                    representatives.map((rep, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                            <Card elevation={0} sx={cardStyle}>
                                {/* פס סטטוס עליון */}
                                <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '4px', bgcolor: rep.status === 'פעיל' ? '#00b074' : '#ff9800', borderRadius: '0 0 8px 8px' }} />

                                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            bgcolor: 'rgba(27, 32, 69, 0.05)',
                                            color: DIRECT_BLUE,
                                            fontWeight: 800,
                                            fontSize: '1.8rem',
                                            mb: 2,
                                            border: '3px solid white',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {rep.fullName.substring(0, 2)}
                                    </Avatar>

                                    <Typography variant="h6" sx={{ fontWeight: 800, color: DIRECT_BLUE }}>
                                        {rep.fullName}
                                    </Typography>

                                    <Chip
                                        label={rep.role}
                                        size="small"
                                        sx={{ mt: 1, mb: 3, bgcolor: 'rgba(234, 20, 90, 0.08)', color: DIRECT_PINK, fontWeight: 700, borderRadius: '8px' }}
                                    />

                                    <Divider sx={{ width: '100%', mb: 2, opacity: 0.5 }} />

                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#6e7496' }}>
                                            <BadgeIcon sx={{ fontSize: 18, color: DIRECT_BLUE, opacity: 0.5 }} />
                                            <Typography variant="body2">{rep.id}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#6e7496' }}>
                                            <AlternateEmailIcon sx={{ fontSize: 18, color: DIRECT_BLUE, opacity: 0.5 }} />
                                            <Typography variant="body2" sx={{ direction: 'ltr', textAlign: 'right' }}>{rep.email}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#6e7496' }}>
                                            <PhoneIcon sx={{ fontSize: 18, color: DIRECT_BLUE, opacity: 0.5 }} />
                                            <Typography variant="body2" sx={{ direction: 'ltr', textAlign: 'right' }}>{rep.phone}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* פופאפ (Dialog) הוספת נציג */}
            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: '24px', padding: 1 } }}
            >
                <form onSubmit={handleAddRepresentative}>
                    <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Box sx={{ bgcolor: 'rgba(234, 20, 90, 0.1)', p: 2, borderRadius: '50%', color: DIRECT_PINK }}>
                                <PersonAddIcon sx={{ fontSize: 40 }} />
                            </Box>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: DIRECT_BLUE }}>
                            הוספת נציג למערכת
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ px: 4, pb: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField name="fullName" label="שם מלא" required fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField name="employeeId" label="מספר עובד / ת.ז" required fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField name="phone" label="טלפון נייד" required fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField name="email" label="אימייל ארגוני" type="email" required fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        name="role"
                                        label="תפקיד"
                                        select
                                        required
                                        fullWidth
                                        defaultValue="נציג שירות"
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                    >
                                        <MenuItem value="נציג שירות">נציג שירות</MenuItem>
                                        <MenuItem value="נציג מכירות">נציג מכירות</MenuItem>
                                        <MenuItem value="מנהל צוות">מנהל צוות</MenuItem>
                                        <MenuItem value="אחמ''ש">אחמ"ש</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button
                            onClick={() => setIsDialogOpen(false)}
                            sx={{ color: '#6e7496', fontWeight: 700, borderRadius: '50px', px: 4 }}
                        >
                            ביטול
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                bgcolor: DIRECT_BLUE,
                                color: 'white',
                                fontWeight: 700,
                                borderRadius: '50px',
                                px: 5,
                                '&:hover': { bgcolor: '#11142d' }
                            }}
                        >
                            שמור והוסף
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Representatives;