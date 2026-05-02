import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  useTheme, 
  useMediaQuery,
  styled
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// --- הגדרות עיצוב ---
const PRIMARY_BLUE = '#1a237e'; 
const ACCENT_PINK = '#e91e63';  
const BG_LIGHT = '#f4f6f8';

const BrandingTitle = styled(Typography)({
  fontWeight: 800,
  letterSpacing: '-1.5px',
  background: `linear-gradient(45deg, #ffffff 30%, ${ACCENT_PINK} 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // מעודכן לשרת הפרודקשן שלך
  const API_BASE = "https://hackathon-java.onrender.com";

  // ==========================================
  // כניסה אמיתית של משתמשים (דרך גוגל)
  // ==========================================
  const handleGoogleSuccess = async (response: any) => {
    try {
      const decodedToken: any = jwtDecode(response.credential);
      
      const loginPayload = {
        token: response.credential, 
        email: decodedToken.email,
        name: decodedToken.name,
        pictureUrl: decodedToken.picture
      };

      const res = await axios.post(`${API_BASE}/api/auth/google-login`, loginPayload);
      
      localStorage.setItem('user', JSON.stringify(res.data.user || res.data));
      localStorage.setItem('token', res.data.token || response.credential); 
      
      // בדיקה לאן לנווט לפי התפקיד של מי שהתחבר כרגע בגוגל
      const userRole = res.data.user?.role || res.data.role;
      if (userRole === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/tasks');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      alert('שגיאה בחיבור לשרת ה-Java. ודא שהשרת פועל.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: BG_LIGHT }}>
      <Grid container sx={{ flexGrow: 1 }}>
        
        {/* צד ימין - מיתוג וכחול */}
        {!isMobile && (
          <Grid item xs={false} md={7} lg={8} sx={{
            position: 'relative', bgcolor: PRIMARY_BLUE, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute', bottom: '-10%', left: '-5%',
              width: '40%', height: '40%', bgcolor: ACCENT_PINK, filter: 'blur(120px)',
              opacity: 0.2, borderRadius: '50%',
            }
          }}>
            <Box sx={{ textAlign: 'center', zIndex: 1 }}>
              <BrandingTitle variant="h1" sx={{ fontSize: '5rem', mb: 1 }}>SimuTech</BrandingTitle>
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300, letterSpacing: 1 }}>
                AGENT PERFORMANCE SYSTEM
              </Typography>
              <Box sx={{ width: 80, height: 4, bgcolor: ACCENT_PINK, mt: 4, borderRadius: 2, mx: 'auto' }} />
            </Box>
          </Grid>
        )}

        {/* צד שמאל - אזור ההתחברות */}
        <Grid item xs={12} md={5} lg={4} sx={{
          display: 'flex', flexDirection: 'column', bgcolor: 'white',
          justifyContent: 'center', px: isMobile ? 4 : 8, position: 'relative'
        }}>
          
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: PRIMARY_BLUE, mb: 1 }}>ברוכים הבאים</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>אנא התחבר/י למערכת כדי להתחיל.</Typography>

            {/* כפתור ההתחברות הרשמי של גוגל ללקוחות */}
            <Box sx={{ mb: 4, '& .nsm7Bb-HzV7m-LgbsSe': { width: '100% !important', height: '45px !important', borderRadius: '8px !important' } }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="outline"
                size="large"
                text="continue_with"
              />
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, bgcolor: ACCENT_PINK }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;