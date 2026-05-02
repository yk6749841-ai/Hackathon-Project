import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Avatar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, TextField,
    Paper, Chip, Fade, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { managerApi } from '../services/api';
import type { User } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE = "https://hackathon-java.onrender.com/api";
const MANAGER_ID = "ADMIN"; 

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const [agents, setAgents] = useState<User[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatTarget, setChatTarget] = useState<User | null>(null);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newAgent, setNewAgent] = useState({ fullName: '', email: '', idNumber: '', agentCode: '' });

    const [chatMessage, setChatMessage] = useState('');
    const [chatHistories, setChatHistories] = useState<Record<number, any[]>>({});

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<{ id: number; name: string } | null>(null);

    const fetchAgents = () => {
        managerApi.searchAgent('').then(res => setAgents(res.data));
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        let interval: any;
        if (isChatOpen && chatTarget) {
            interval = setInterval(() => {
                fetchChatHistoryForAgent(chatTarget);
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isChatOpen, chatTarget]);

    const handleAddAgent = async () => {
        try {
            await managerApi.addAgent({ ...newAgent, role: 'AGENT' });
            setOpenAddDialog(false);
            setNewAgent({ fullName: '', email: '', idNumber: '', agentCode: '' });
            fetchAgents();
        } catch (err) {
            alert("שגיאה בהוספת נציג. ודא שהשרת פועל.");
        }
    };

    const fetchChatHistoryForAgent = async (agent: User) => {
        try {
            const agentIdStr = agent.agentCode || agent.id.toString();
            const res = await axios.get(`${API_BASE}/chat/history/${MANAGER_ID}/${agentIdStr}`);
            setChatHistories(prev => ({
                ...prev,
                [agent.id]: res.data
            }));
        } catch (error) {
            console.error("שגיאה במשיכת היסטוריית צ'אט למנהל:", error);
        }
    };

    const openChat = (agent: User) => {
        setChatTarget(agent);
        setIsChatOpen(true);
        fetchChatHistoryForAgent(agent);
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatTarget) return;
        const agentIdStr = chatTarget.agentCode || chatTarget.id.toString();
        const newMessage = {
            senderId: MANAGER_ID,
            recipientId: agentIdStr,
            content: chatMessage
        };
        const optimisticMsg = { ...newMessage, timestamp: new Date().toISOString() };
        setChatHistories(prev => ({
            ...prev,
            [chatTarget.id]: [...(prev[chatTarget.id] || []), optimisticMsg]
        }));
        setChatMessage('');
        try {
            await axios.post(`${API_BASE}/chat/send`, newMessage);
        } catch (err) {
            console.error("שגיאה בשליחת הודעה לשרת:", err);
        }
    };

    const askDeleteAgent = (agentId: number, agentName: string) => {
        setAgentToDelete({ id: agentId, name: agentName });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteAgent = async () => {
        if (!agentToDelete) return;
        try {
            await managerApi.deleteAgent(agentToDelete.id);
            setAgents(agents.filter(a => a.id !== agentToDelete.id));
        } catch (err) {
            alert("שגיאה במחיקת הנציג.");
        } finally {
            setDeleteDialogOpen(false);
            setAgentToDelete(null);
        }
    };

    return (
        <Box sx={{ width: '100%', direction: 'rtl' }}>
            <Paper elevation={0} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                mb: 4, p: 3, bgcolor: 'white', borderRadius: '20px', width: '100%',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1b2045' }}>
                        מגדל פיקוח: <span style={{ color: '#ea145a' }}>ניהול מערך הדרכה</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">צפייה בנתוני ביצועים ושיוך תסריטים בזמן אמת</Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => setOpenAddDialog(true)}
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    sx={{ bgcolor: '#ea145a', borderRadius: '12px', px: 4, py: 1.5, fontWeight: 800, '&:hover': { bgcolor: '#c90e4a' } }}
                >
                    הוספת נציג
                </Button>
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', width: '100%' }}>
                <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead sx={{ bgcolor: '#f8f9fc' }}>
                        <TableRow>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#1b2045', width: '25%' }}>נציג</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#1b2045' }}>קוד אישי</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#1b2045' }}>אימייל</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#1b2045', width: '20%' }}>רמת ביצוע</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, color: '#1b2045' }}>סטטוס</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, color: '#1b2045', width: '180px' }}>צ'אט דינאמי</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {agents.map((agent) => (
                            <TableRow 
                                key={agent.id} 
                                hover 
                                onClick={() => navigate(`/manager/agent-history/${agent.id}`)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(234, 20, 90, 0.04)' } }}
                            >
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 45, height: 45, bgcolor: '#1b2045', overflow: 'hidden' }}>
                                            {agent.pictureUrl ? (
                                                <img src={agent.pictureUrl} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (agent.fullName ? agent.fullName[0] : 'N')}
                                        </Avatar>
                                        <Typography sx={{ fontWeight: 700, color: '#1b2045' }}>{agent.fullName}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 500 }}>{agent.agentCode}</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 500 }}>{agent.email}</TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', minWidth: '35px' }}>
                                            {(agent.rank || 1) * 20}%
                                        </Typography>
                                        <Box sx={{ height: 8, flexGrow: 1, bgcolor: '#f0f2f5', borderRadius: 4, position: 'relative' }}>
                                            <Box sx={{ position: 'absolute', height: '100%', borderRadius: 4, width: `${(agent.rank || 1) * 20}%`, bgcolor: '#ea145a' }} />
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label="פעיל" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 800 }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); askDeleteAgent(agent.id, agent.fullName); }}
                                            sx={{ color: '#c62828', bgcolor: '#ffebee', position: 'absolute', left: 0 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); openChat(agent); }}
                                            sx={{ color: '#1b2045', bgcolor: '#f4f6f9', '&:hover': { bgcolor: '#ea145a', color: 'white' } }}
                                        >
                                            <ChatIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: 4, p: 2, direction: 'rtl' } }}
            >
                <DialogTitle sx={{ fontWeight: 900, color: '#1b2045', fontSize: '1.5rem', textAlign: 'center' }}>
                    אישור מחיקת נציג
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        האם את/ה בטוח/ה שברצונך למחוק את הנציג <strong>{agentToDelete?.name}</strong> לצמיתות?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                        שים/י לב: פעולה זו תמחק גם את כל היסטוריית הסימולציות והפתקיות שלו!
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#1b2045', fontWeight: 700, px: 3 }}>
                        ביטול
                    </Button>
                    <Button
                        onClick={confirmDeleteAgent}
                        variant="contained"
                        sx={{ bgcolor: '#c62828', color: 'white', fontWeight: 700, px: 6, py: 1.5, borderRadius: 10, boxShadow: '0 4px 14px 0 rgba(198, 40, 40, 0.39)', '&:hover': { bgcolor: '#b71c1c' } }}
                    >
                        מחק לצמיתות
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 4, p: 2, direction: 'rtl' } }}>
                <DialogTitle sx={{ fontWeight: 900, color: '#1b2045', fontSize: '1.8rem', textAlign: 'center' }}>הוספת נציג חדש</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    <TextField label="שם מלא" fullWidth variant="filled" value={newAgent.fullName} onChange={(e) => setNewAgent({ ...newAgent, fullName: e.target.value })} sx={{ '& .MuiFilledInput-root': { bgcolor: '#f3f5f9', borderRadius: 2 } }} />
                    <TextField label="אימייל" fullWidth variant="filled" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} sx={{ '& .MuiFilledInput-root': { bgcolor: '#f3f5f9', borderRadius: 2 } }} />
                    <TextField label="תעודת זהות" fullWidth variant="filled" value={newAgent.idNumber} onChange={(e) => setNewAgent({ ...newAgent, idNumber: e.target.value })} sx={{ '& .MuiFilledInput-root': { bgcolor: '#f3f5f9', borderRadius: 2 } }} />
                    <TextField label="קוד נציג" fullWidth variant="filled" value={newAgent.agentCode} onChange={(e) => setNewAgent({ ...newAgent, agentCode: e.target.value })} sx={{ '& .MuiFilledInput-root': { bgcolor: '#f3f5f9', borderRadius: 2 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setOpenAddDialog(false)} sx={{ color: '#1b2045', fontWeight: 700, px: 3 }}>ביטול</Button>
                    <Button onClick={handleAddAgent} variant="contained" sx={{ bgcolor: '#ea145a', color: 'white', fontWeight: 700, px: 6, py: 1.5, borderRadius: 10, boxShadow: '0 4px 14px 0 rgba(230, 30, 84, 0.39)' }}>שמור בשרת</Button>
                </DialogActions>
            </Dialog>

            <Fade in={isChatOpen}>
                <Paper sx={{
                    position: 'fixed', bottom: 24, left: 24, width: 340, height: 480,
                    borderRadius: '20px', boxShadow: '0 15px 50px rgba(27, 32, 69, 0.2)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000,
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <Box sx={{ bgcolor: '#1b2045', p: 2.5, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={chatTarget?.pictureUrl} sx={{ width: 36, height: 36, bgcolor: '#ea145a' }}>
                                {chatTarget?.fullName ? chatTarget.fullName[0] : 'N'}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>{chatTarget?.fullName}</Typography>
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700 }}>• מחובר</Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setIsChatOpen(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box sx={{ flexGrow: 1, p: 2.5, bgcolor: '#f4f6f9', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', fontWeight: 600 }}>היסטוריית שיחה</Typography>
                        {(chatHistories[chatTarget?.id || 0] || []).map((msg, idx) => {
                            const isManager = msg.senderId === MANAGER_ID;
                            return (
                                <Box key={idx} sx={{
                                    bgcolor: isManager ? '#ea145a' : 'white',
                                    color: isManager ? 'white' : '#1b2045',
                                    p: 2,
                                    borderRadius: isManager ? '15px 15px 15px 0' : '15px 15px 0 15px',
                                    maxWidth: '85%',
                                    alignSelf: isManager ? 'flex-end' : 'flex-start',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{msg.content}</Typography>
                                    <Typography variant="caption" sx={{ display: 'block', textAlign: isManager ? 'right' : 'left', mt: 1, opacity: 0.7 }}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="הקלד הודעה..."
                            variant="outlined"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f4f6f9' } }}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            sx={{ color: 'white', bgcolor: '#ea145a', borderRadius: '12px', width: 40, height: 40, '&:hover': { bgcolor: '#c90e4a' } }}
                        >
                            <SendIcon fontSize="small" sx={{ transform: 'rotate(-45deg)', ml: 0.5 }} />
                        </IconButton>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};