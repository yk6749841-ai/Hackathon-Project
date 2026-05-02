import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
    ListItemIcon, ListItemText, ThemeProvider, createTheme, CssBaseline,
    Avatar, styled, Divider, ListItemButton
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

// --- הגדרות עיצוב תואמות לנציג ---
const DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 70;
const SIDEBAR_BG = '#1e1e2d';
const ACTIVE_COLOR = '#ea145a'; // הצבע הוורוד/אדום של המנהל
const PRIMARY_BLUE = '#1b2045'; // הכחול הכהה של המנהל

const BrandingText = styled(Typography)({
    fontWeight: 900,
    letterSpacing: '-1px',
    background: `linear-gradient(45deg, ${PRIMARY_BLUE} 30%, ${ACTIVE_COLOR} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
});

const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: "'Heebo', sans-serif",
    },
});

export const MainLayout: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // חסימת גישה למי שאינו מנהל
    if (!isAdmin) {
        return <Box sx={{ p: 4, direction: 'rtl', textAlign: 'center' }}><Typography variant="h6">אין לך הרשאת גישה לדף זה.</Typography></Box>;
    }

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const menuItems = [
        { text: 'נציגים', path: '/dashboard', icon: <DashboardIcon /> },
        { text: 'ניהול תרחישים', path: '/scenarios', icon: <AssignmentIcon /> },
        { text: 'דוחות', path: '/reports', icon: <BarChartIcon /> }
    ];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh', direction: 'rtl', bgcolor: '#f5f7fb' }}>

                {/* --- הדר (Header) --- */}
                <AppBar position="fixed" sx={{
                    width: `calc(100% - ${DRAWER_WIDTH}px)`,
                    mr: `${DRAWER_WIDTH}px`,
                    bgcolor: 'white',
                    boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
                    height: HEADER_HEIGHT,
                    justifyContent: 'center'
                }}>
                    <Toolbar sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', px: 3, height: '100%' }}>

                        {/* 1. צד ימין - משאירים תיבה ריקה כדי לאזן את הרשת (Grid) */}
                        <Box />

                        {/* 2. אמצע - הלוגו מרוכז בצורה מושלמת */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <BrandingText variant="h5">SimuTech</BrandingText>
                        </Box>

                        {/* 3. צד שמאל - פרופיל מנהל */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                            <Typography variant="body1" sx={{ color: PRIMARY_BLUE, fontWeight: 700 }}>
                                {user?.fullName || 'מנהל מערכת'}
                            </Typography>
                            <Avatar sx={{
                                width: 42,
                                height: 42,
                                border: `2px solid ${ACTIVE_COLOR}`,
                                bgcolor: PRIMARY_BLUE,
                                fontWeight: 800
                            }}>
                                {(user?.fullName || 'M').charAt(0)}
                            </Avatar>
                        </Box>

                    </Toolbar>
                </AppBar>

                {/* --- תפריט צדדי (Sidebar) --- */}
                <Drawer
                    variant="permanent"
                    anchor="right"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: SIDEBAR_BG,
                            color: 'white',
                            border: 'none'
                        },
                    }}
                >
                    <Box sx={{ p: 3, textAlign: 'center', height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, color: 'white' }}>MANAGER PANEL</Typography>
                    </Box>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                    <List sx={{ px: 2, mt: 2 }}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <ListItem disablePadding key={item.text} sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: '12px',
                                            bgcolor: isActive ? 'rgba(234, 20, 90, 0.15)' : 'transparent',
                                            color: isActive ? ACTIVE_COLOR : 'rgba(255,255,255,0.7)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                            transition: '0.3s',
                                            textAlign: 'right'
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                        {/* כאן בוצע התיקון הקריטי! */}
                                        <ListItemText
                                            disableTypography
                                            primary={<Typography sx={{ fontWeight: isActive ? 800 : 500, fontSize: '0.95rem' }}>{item.text}</Typography>}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>

                    {/* כפתור התנתקות בתחתית */}
                    <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout} sx={{ borderRadius: '12px', color: 'rgba(255,255,255,0.5)', '&:hover': { color: ACTIVE_COLOR, bgcolor: 'rgba(234, 20, 90, 0.05)' } }}>
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
                                <ListItemText
                                    disableTypography
                                    primary={<Typography sx={{ fontWeight: 600 }}>התנתקות</Typography>}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                </Drawer>

                {/* --- אזור התוכן המרכזי --- */}
                <Box component="main" sx={{ flexGrow: 1, p: 4, width: `calc(100% - ${DRAWER_WIDTH}px)`, mt: `${HEADER_HEIGHT}px` }}>
                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    );
};