import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, TextField, IconButton, Paper, Divider, Zoom, Fab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';

const SIDEBAR_BG = '#1e1e2d';
const ACCENT_PINK = '#e91e63';
const API_BASE = "https://hackathon-java.onrender.com/api";

const MANAGER_ID = "ADMIN"; 

interface AgentChatProps {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const AgentChat: React.FC<AgentChatProps> = ({ isOpen, onClose, onOpen }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [user, setUser] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // טעינת היסטוריה וריענון כל 3 שניות
    useEffect(() => {
        const savedUserStr = localStorage.getItem('user');
        if (!savedUserStr) return;
        
        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser);
        
        const myId = savedUser.agentCode || savedUser.id.toString();
        
        // משיכה ראשונית מיד כשהקומפוננטה עולה
        fetchChatHistory(myId);

        // קסם הסנכרון (Polling) - דוגם את השרת כל 3 שניות, אבל רק אם הצ'אט פתוח
        const interval = setInterval(() => {
            if (isOpen) {
                fetchChatHistory(myId);
            }
        }, 3000);

        // מנקה את הטיימר כשהקומפוננטה נסגרת למנוע זליגת זיכרון
        return () => clearInterval(interval);

    }, [isOpen]);

    const fetchChatHistory = async (myId: string) => {
        try {
            const res = await axios.get(`${API_BASE}/chat/history/${myId}/${MANAGER_ID}`);
            
            if (res.data.length === 0) {
                setMessages([{
                    senderId: MANAGER_ID,
                    content: 'שלום! כאן תוכל להתכתב איתי בצ׳אט פנימי מכל מסך במערכת.',
                    timestamp: new Date().toISOString()
                }]);
            } else {
                setMessages(res.data);
            }
        } catch (err) {
            console.error("שגיאה במשיכת צ'אט:", err);
        }
    };

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const myId = user.agentCode || user.id.toString();

        const newMessage = {
            senderId: myId,
            recipientId: MANAGER_ID,
            content: input
        };

        const optimisticMsg = { ...newMessage, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');

        try {
            await axios.post(`${API_BASE}/chat/send`, newMessage);
        } catch (err) {
            console.error("שגיאה בשליחת הודעה:", err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <Zoom in={!isOpen}>
                <Fab color="primary" aria-label="chat" onClick={onOpen} sx={{ position: 'fixed', bottom: 30, left: 30, bgcolor: ACCENT_PINK, '&:hover': { bgcolor: '#c2185b' }, zIndex: 1000, boxShadow: '0 4px 15px rgba(233, 30, 99, 0.4)' }}>
                    <ChatIcon />
                </Fab>
            </Zoom>

            <Zoom in={isOpen}>
                <Box sx={{ position: 'fixed', bottom: 30, left: 30, zIndex: 1000, width: 340, height: 480, display: isOpen ? 'flex' : 'none' }}>
                    <Paper elevation={12} sx={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <Box sx={{ bgcolor: SIDEBAR_BG, p: 2, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: ACCENT_PINK, width: 40, height: 40 }}>מ</Avatar>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>מדריך / מנהל</Typography>
                                    <Typography variant="caption" sx={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 0.5 }}>● מחובר</Typography>
                                </Box>
                            </Box>
                            <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Box ref={scrollRef} sx={{ flex: 1, p: 2, bgcolor: '#f8f9fa', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {messages.map((msg, i) => {
                                const myId = user?.agentCode || user?.id?.toString();
                                const isMe = msg.senderId === myId;
                                
                                return (
                                    <Box key={i} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                        <Paper sx={{ 
                                            p: 1.5, px: 2, 
                                            borderRadius: isMe ? '20px 20px 0 20px' : '20px 20px 20px 0', 
                                            bgcolor: isMe ? ACCENT_PINK : 'white', 
                                            color: isMe ? 'white' : '#1b2045',
                                            border: isMe ? 'none' : '1px solid #e0e0e0',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
                                        }}>
                                            <Typography variant="body2" sx={{ direction: 'rtl', textAlign: 'right' }}>{msg.content}</Typography>
                                            <Typography variant="caption" sx={{ display: 'block', textAlign: isMe ? 'right' : 'left', mt: 0.5, opacity: 0.7 }}>
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                );
                            })}
                        </Box>

                        <Divider />
                        <Box sx={{ p: 1.5, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField fullWidth variant="standard" placeholder="הקלד הודעה..." InputProps={{ disableUnderline: true }} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} sx={{ px: 2, bgcolor: '#f1f3f4', borderRadius: '25px', py: 0.5, direction: 'rtl' }} />
                            <IconButton onClick={handleSend} size="small" sx={{ bgcolor: ACCENT_PINK, color: 'white', '&:hover': { bgcolor: '#c2185b' } }}>
                                <SendIcon sx={{ transform: 'rotate(180deg)', fontSize: 20 }} />
                            </IconButton>
                        </Box>
                    </Paper>
                </Box>
            </Zoom>
        </>
    );
};

export default AgentChat;