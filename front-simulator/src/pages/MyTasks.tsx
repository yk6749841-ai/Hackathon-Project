import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Fade,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const PRIMARY_BLUE = '#1a237e';
const ACCENT_PINK = '#e91e63';
const API_BASE_URL = "https://hackathon-java.onrender.com";

interface Task {
    id: number;
    scenario: {
        name: string;
        description: string;
        difficulty: string
    };
    status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const MyTasks: React.FC = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // --- סטייטים עבור חלון אישור ההסרה ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(savedUser);

        const fetchTasks = async () => {
            try {
                const targetId = parsedUser.id || parsedUser.agentId || parsedUser.userId;
                
                // קריאה לשרת לשליפת המשימות
                const response = await axios.get(`${API_BASE_URL}/api/agent/${targetId}/tasks`);
                setTasks(response.data);
            } catch (error) {
                console.error("שגיאה במשיכת משימות:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [navigate]);

    // --- פתיחת הפופאפ המעוצב ---
    const askDeleteTask = (taskId: number) => {
        setTaskToDelete(taskId);
        setDeleteDialogOpen(true);
    };

    // --- הפונקציה המעודכנת שמבצעת "ארכיון" במקום מחיקה ---
    const confirmDeleteTask = async () => {
        if (taskToDelete === null) return;
        
        try {
            // קריאת PUT לשרת שמסתירה את המשימה בלי למחוק את ההיסטוריה
            await axios.put(`${API_BASE_URL}/api/agent/task/${taskToDelete}/archive`);
            
            // עדכון הרשימה במסך ללא רענון
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
        } catch (error) {
            console.error("שגיאה בהסרת המשימה:", error);
        } finally {
            // סגירת הפופאפ ואיפוס ה-ID בכל מקרה
            setDeleteDialogOpen(false);
            setTaskToDelete(null);
        }
    };

    const getDifficultyStyle = (diff: string) => {
        switch (diff?.toUpperCase()) {
            case 'EASY': return { color: '#4caf50', label: 'קל' };
            case 'MEDIUM': return { color: '#ff9800', label: 'בינוני' };
            case 'HARD': return { color: '#f44336', label: 'קשה' };
            default: return { color: ACCENT_PINK, label: diff || 'רגיל' };
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
                <CircularProgress size={60} thickness={4} sx={{ color: ACCENT_PINK }} />
                <Typography sx={{ color: PRIMARY_BLUE, fontWeight: 500 }}>טוען את המשימות שלך...</Typography>
            </Box>
        );
    }

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ direction: 'rtl' }}>
                <Paper sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${PRIMARY_BLUE} 0%, #283593 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: '0 4px 15px rgba(26, 35, 126, 0.2)'
                }}>
                    <AssignmentIcon sx={{ fontSize: 35, opacity: 0.8 }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>רשימת התרגולים שלך</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            יש לך {tasks.length} סימולציות ברשימה
                        </Typography>
                    </Box>
                </Paper>

                {tasks.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 8, p: 5, bgcolor: 'white', borderRadius: 4 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>אין לך משימות כרגע. המנהל ישייך לך בקרוב!</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {tasks.map((task) => {
                            const diffInfo = getDifficultyStyle(task.difficulty || task.scenario?.difficulty);
                            const isCompleted = task.status === 'COMPLETED';
                            
                            return (
                                <Grid item xs={12} md={6} lg={4} key={`task-${task.id}`}>
                                    <Card sx={{
                                        height: '100%',
                                        borderRadius: 5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: isCompleted ? '1px solid #4caf50' : '1px solid rgba(0,0,0,0.05)',
                                        backgroundColor: isCompleted ? '#fbfdfb' : '#fff',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                                            borderColor: isCompleted ? '#4caf50' : ACCENT_PINK
                                        }
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 20,
                                            left: 0,
                                            width: 4,
                                            height: 40,
                                            bgcolor: diffInfo.color,
                                            borderRadius: '0 4px 4px 0'
                                        }} />

                                        <CardContent sx={{ p: 4, flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <SignalCellularAltIcon sx={{ fontSize: 18, color: diffInfo.color }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: diffInfo.color, letterSpacing: 0.5 }}>
                                                        {diffInfo.label}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {isCompleted ? (
                                                        <>
                                                            <Chip
                                                                icon={<CheckCircleIcon />}
                                                                label="בוצע בעבר"
                                                                size="small"
                                                                color="success"
                                                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                                            />
                                                            <IconButton 
                                                                onClick={() => askDeleteTask(task.id)}
                                                                size="small"
                                                                sx={{ 
                                                                    color: '#f44336', 
                                                                    bgcolor: 'rgba(244, 67, 54, 0.08)',
                                                                    '&:hover': { bgcolor: '#f44336', color: 'white' }
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <Chip
                                                            label="ממתין לביצוע"
                                                            size="small"
                                                            sx={{ bgcolor: 'rgba(233, 30, 99, 0.08)', color: ACCENT_PINK, fontWeight: 700, fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>

                                            <Typography variant="h6" sx={{ fontWeight: 800, color: PRIMARY_BLUE, mb: 1, lineHeight: 1.3 }}>
                                                {task.scenario?.name || 'תרחיש ללא שם'}
                                            </Typography>

                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, minHeight: '3em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {task.scenario?.description || 'אין תיאור זמין לתרחיש זה.'}
                                            </Typography>

                                            <Divider sx={{ my: 2, opacity: 0.5 }} />

                                            <Box sx={{ mt: 'auto', pt: 2 }}>
                                                <Button
                                                    fullWidth
                                                    variant={isCompleted ? "outlined" : "contained"}
                                                    startIcon={isCompleted ? <ReplayIcon /> : <PlayArrowIcon />}
                                                    onClick={() => navigate(`/simulation/${task.id}`)}
                                                    sx={{
                                                        bgcolor: isCompleted ? 'transparent' : PRIMARY_BLUE,
                                                        color: isCompleted ? '#4caf50' : 'white',
                                                        borderColor: isCompleted ? '#4caf50' : 'none',
                                                        borderRadius: 3,
                                                        py: 1.5,
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        boxShadow: 'none',
                                                        '&:hover': {
                                                            bgcolor: isCompleted ? 'rgba(76, 175, 80, 0.08)' : ACCENT_PINK,
                                                            borderColor: isCompleted ? '#388e3c' : 'none',
                                                        }
                                                    }}
                                                >
                                                    {isCompleted ? 'תרגל שוב' : 'התחל תרגול'}
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}

                {/* --- חלון הפופאפ (Dialog) לאישור מחיקה/הסתרה --- */}
                <Dialog 
                    open={deleteDialogOpen} 
                    onClose={() => setDeleteDialogOpen(false)} 
                    maxWidth="sm" 
                    fullWidth 
                    sx={{ '& .MuiDialog-paper': { borderRadius: 4, p: 2, direction: 'rtl' } }}
                >
                    <DialogTitle sx={{ fontWeight: 900, color: PRIMARY_BLUE, fontSize: '1.5rem', textAlign: 'center' }}>
                        הסרת משימה
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 2, textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                            האם את/ה בטוח/ה שברצונך להסיר משימה זו מהרשימה?
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            אל דאגה, היסטוריית התרגול והדוחות שלך יישמרו במערכת.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                        <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: PRIMARY_BLUE, fontWeight: 700, px: 3 }}>
                            ביטול
                        </Button>
                        <Button 
                            onClick={confirmDeleteTask} 
                            variant="contained" 
                            sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 700, px: 6, py: 1.5, borderRadius: 10, boxShadow: '0 4px 14px 0 rgba(244, 67, 54, 0.39)', '&:hover': { bgcolor: '#d32f2f' } }}
                        >
                            מחק
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </Fade>
    );
};

export default MyTasks;