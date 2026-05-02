import React, { useState, useEffect } from 'react';
import {
    Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography,
    Avatar, Divider, IconButton, AppBar, Toolbar, styled
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import LogoutIcon from '@mui/icons-material/Logout';
import AgentChat from '../pages/AgentChat';
import AgentNotes from '../pages/AgentNotes'; // <-- הוספנו את הפתקים

const DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 70;
const SIDEBAR_BG = '#1e1e2d';
const ACTIVE_COLOR = '#e91e63';
const PRIMARY_BLUE = '#1a237e';

const BrandingText = styled(Typography)({
    fontWeight: 800,
    letterSpacing: '-1px',
    background: `linear-gradient(45deg, ${PRIMARY_BLUE} 30%, ${ACTIVE_COLOR} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
});

export const AgentLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isNotesActive, setIsNotesActive] = useState(false); // סטייט להדלקת הפתקים

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(savedUser.id ? savedUser : { fullName: "נציג בפיתוח", role: "AGENT" });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // התפריט הצדדי
    const menuItems = [
        { text: 'המטלות שלי', icon: <AssignmentIcon />, path: '/tasks' },
        // כשהמשתמש לוחץ כאן, זה מנווט ל- /history ומציג את AgentHistory בתוך ה-Outlet
        { text: 'היסטוריית סימולציות', icon: <HistoryIcon />, path: '/history' },
        // כשהמשתמש לוחץ כאן, זה מנווט ל- /reports ומציג את AgentReports
        { text: 'דוחות התקדמות', icon: <AssessmentIcon />, path: '/reports' },
        { text: 'פתקים נדבקים', icon: <StickyNote2Icon />, action: () => setIsNotesActive(!isNotesActive) },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', direction: 'rtl', bgcolor: '#f5f7fb' }}>

            <AppBar position="fixed" sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, mr: `${DRAWER_WIDTH}px`, bgcolor: 'white', boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', height: HEADER_HEIGHT, justifyContent: 'center' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="img" src="/logo.png" sx={{ width: 35, height: 35 }} onError={(e: any) => e.target.style.display = 'none'} />
                    </Box>
                    <BrandingText variant="h5">SimuTech</BrandingText>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ color: PRIMARY_BLUE, fontWeight: 600 }}>
                            {user?.fullName || user?.name || 'נציג מערכת'}
                        </Typography>
                        <Avatar src={user?.pictureUrl} sx={{ width: 40, height: 40, border: `2px solid ${ACTIVE_COLOR}`, bgcolor: PRIMARY_BLUE }}>
                            {(user?.fullName || user?.name || 'A').charAt(0)}
                        </Avatar>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" anchor="right" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: SIDEBAR_BG, color: 'white', border: 'none' } }}>
                <Box sx={{ p: 3, textAlign: 'center', height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, color: 'white' }}>AGENT PANEL</Typography>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                <List sx={{ px: 2, mt: 2 }}>
                    {menuItems.map((item) => {
                        // הסטטוס של הכפתור
                        const isActive = item.path ? location.pathname === item.path : (isNotesActive && item.text === 'פתקים צפים');

                        return (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => {
                                    if (item.action) item.action();
                                    else if (item.path) navigate(item.path);
                                }}
                                sx={{
                                    mb: 1, borderRadius: '12px', bgcolor: isActive ? 'rgba(233, 30, 99, 0.15)' : 'transparent',
                                    color: isActive ? ACTIVE_COLOR : 'rgba(255,255,255,0.7)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, transition: '0.3s', textAlign: 'right'
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 400, fontSize: '0.95rem' }} />
                            </ListItem>
                        );
                    })}
                </List>

                <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <ListItem button onClick={handleLogout} sx={{ borderRadius: '12px', color: 'rgba(255,255,255,0.5)', '&:hover': { color: ACTIVE_COLOR, bgcolor: 'rgba(233, 30, 99, 0.05)' } }}>
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="התנתקות" />
                    </ListItem>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 4, width: `calc(100% - ${DRAWER_WIDTH}px)`, mt: `${HEADER_HEIGHT}px` }}>
                <Outlet />
            </Box>

            {/* מרכיבי הריחוף הגלובליים */}
            <AgentNotes isOpen={isNotesActive} />

            <AgentChat
                isOpen={isChatOpen}
                onOpen={() => setIsChatOpen(true)}
                onClose={() => setIsChatOpen(false)}
            />

        </Box>
    );
};