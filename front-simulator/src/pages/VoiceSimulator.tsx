import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Avatar, IconButton, Fade } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import axios from 'axios';

// --- Interfaces ---
interface Message {
    role: 'user' | 'assistant';
    text: string;
    time: string;
}

interface Scores {
    REVIEW?: number;
}

interface Feedback {
    verbal: string;
    scores: Scores | null;
}

const DIRECT_BLUE = '#1b2045';
const DIRECT_PINK = '#ea145a';
const API_BASE = "https://hackathon-java.onrender.com/api";

const VoiceSimulator: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'idle' | 'listening' | 'playing' | 'processing'>('idle');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isSpeakingRef = useRef<boolean>(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const audioQueue = useRef<Blob[]>([]);
    const isPlayingRef = useRef<boolean>(false);
    const messagesRef = useRef<Message[]>([]); // Ref שיחזיק תמיד את התמליל המעודכן
    const hasSavedRef = useRef<boolean>(false); // מניעת שמירה כפולה

    const SILENCE_THRESHOLD_MS = 1500;
    const VOLUME_THRESHOLD = 25;

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        return () => {
            stopAllProcesses();
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const playNextInQueue = () => {
        if (audioQueue.current.length === 0) {
            isPlayingRef.current = false;
            setStatus('listening');
            startListeningLoop();
            return;
        }
        isPlayingRef.current = true;
        setStatus('playing');
        const audioBlob = audioQueue.current.shift();
        if (!audioBlob) return;
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            playNextInQueue();
        };
        audio.play().catch(() => playNextInQueue());
    };

    const initWebSocket = (assignmentId: number) => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            const wsUrl = `ws://localhost:8001/ws/voice/${assignmentId}`;
            wsRef.current = new WebSocket(wsUrl);
            wsRef.current.binaryType = 'arraybuffer';
            wsRef.current.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    // זיהוי ברור של משוב מהשרת
                    if (event.data.includes("משוב סופי") || event.data.includes("JSON:") || event.data.includes("REVIEW")) {
                        handleFeedbackMessage(event.data);
                    } else {
                        handleTextMessage(event.data);
                    }
                } else {
                    const audioBlob = new Blob([event.data], { type: 'audio/mpeg' });
                    audioQueue.current.push(audioBlob);
                    if (!isPlayingRef.current) playNextInQueue();
                }
            };
        }
    };

    const handleTextMessage = (dataStr: string) => {
        try {
            const data = JSON.parse(dataStr);
            let textToAppend = data.text || '';

            if (data.status === 'finished' || textToAppend.includes("[END_CALL]")) {
                if (status !== 'processing') setStatus('processing');
                stopAllProcesses();
            }

            textToAppend = textToAppend.replace(/\[END_CALL\]/g, '');

            if (data.user_text) {
                const newUserMsg: Message = {
                    role: 'user',
                    text: data.user_text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                // עדכון Ref בצורה ישירה וסינכרונית
                messagesRef.current = [...messagesRef.current, newUserMsg];
                setMessages([...messagesRef.current]);
            } else if (textToAppend.length > 0) {
                appendAssistantText(textToAppend);
            }
        } catch (e) {
            let cleanStr = dataStr.replace(/\[END_CALL\]/g, '');
            if (cleanStr.length > 0) appendAssistantText(cleanStr);
        }
    };

    const appendAssistantText = (text: string) => {
        const currentMsgs = messagesRef.current;
        const lastMsg = currentMsgs[currentMsgs.length - 1];
        let updated: Message[];

        if (lastMsg && lastMsg.role === 'assistant') {
            updated = [...currentMsgs];
            updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + text
            };
        } else {
            updated = [...currentMsgs, {
                role: 'assistant',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
        }

        messagesRef.current = updated;
        setMessages(updated);
    };

    const handleFeedbackMessage = async (rawText: string) => {
        // מנעול כפול: גם בודקים את ה-Ref וגם מוודאים שיש בכלל הודעות לשמור
        if (hasSavedRef.current || messagesRef.current.length === 0) return;
        hasSavedRef.current = true;

        let verbalFeedback = rawText;
        let scoresData: Scores | null = null;

        try {
            const startIdx = rawText.indexOf('{');
            const endIdx = rawText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                const jsonPart = rawText.substring(startIdx, endIdx + 1);
                scoresData = JSON.parse(jsonPart);
                verbalFeedback = rawText.substring(0, startIdx).replace(/משוב סופי:|JSON:/gi, "").trim();
            }
        } catch (e) { console.error("Parsing error"); }

        if (!scoresData) scoresData = { REVIEW: 8 };

        setFeedback({ verbal: verbalFeedback, scores: scoresData });
        setStatus('idle');
        stopAllProcesses();

        if (id) {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                // שליחת הנתונים ל-SimulationController.java שלך
                await axios.post(`${API_BASE}/simulation/save?assignmentId=${id}`, {
                    // השרת שלך לוקח את ה-traineeId מה-Assignment, אז אנחנו שולחים את זה רק כגיבוי
                    traineeId: user.agentCode || "111",
                    finalScore: scoresData.REVIEW,
                    feedback: verbalFeedback,
                    // שימוש ב-messagesRef.current מבטיח תמליל מלא בשלב זה!
                    transcript: JSON.stringify(messagesRef.current)
                });
                console.log("✅ נשמר בהצלחה ב-Java!");
            } catch (err) {
                console.error("❌ שגיאת שמירה בשרת:", err);
                hasSavedRef.current = false; // שחרור נעילה במקרה של תקלה אמיתית
            }
        }
    };
    const startCall = async () => {
        setFeedback(null);
        setMessages([]);
        audioQueue.current = [];
        isPlayingRef.current = false;
        if (id) initWebSocket(Number(id));
        await startListeningLoop();
    };

    const startListeningLoop = async () => {
        setStatus('listening');
        audioChunksRef.current = [];
        isSpeakingRef.current = false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
            audioContextRef.current = new AudioCtx();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            source.connect(analyserRef.current);
            monitorVolume();
        } catch (err) { setStatus('idle'); }
    };

    const monitorVolume = () => {
        if (!analyserRef.current || (status !== 'listening' && status !== 'idle')) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (avg > VOLUME_THRESHOLD) {
            isSpeakingRef.current = true;
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        } else if (isSpeakingRef.current && !silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
                setStatus('processing');
            }, SILENCE_THRESHOLD_MS);
        }
        animationFrameRef.current = requestAnimationFrame(monitorVolume);
    };

    const stopAllProcesses = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();

        // תיקון השגיאה: בודקים שהקונטקסט קיים ופתוח לפני שמנסים לסגור
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(err => console.error("Error closing context:", err));
        }

        audioQueue.current = [];
        isPlayingRef.current = false;
        if (status !== 'processing') setStatus('idle');
    };

    const isAudioActive = status === 'listening' || status === 'playing';

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 4, direction: 'rtl', p: 1 }}>
            {/* פאנל ימין - נציג וגרף */}
            <Paper elevation={0} sx={{ flex: 2, borderRadius: '24px', bgcolor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <Avatar sx={{ bgcolor: isAudioActive ? DIRECT_PINK : DIRECT_BLUE, width: 120, height: 120, mb: 3, boxShadow: isAudioActive ? `0 0 30px ${DIRECT_PINK}80` : 'none', transition: 'all 0.3s ease' }}>
                    <SupportAgentIcon sx={{ fontSize: 60 }} />
                </Avatar>

                <Typography variant="h5" sx={{ fontWeight: 800, color: DIRECT_BLUE, mb: 1 }}>מערכת אימון קולי</Typography>
                <Typography variant="subtitle1" sx={{ color: status === 'playing' ? DIRECT_PINK : 'text.secondary', fontWeight: 600, mb: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {status === 'listening' ? 'אני מקשיב לך...' : status === 'playing' ? 'הלקוח מדבר...' : status === 'processing' ? 'מעבד נתונים...' : 'מוכן לתחילת שיחה'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '60px', mb: 8 }}>
                    {[...Array(9)].map((_, i) => (
                        <Box key={i} sx={{
                            width: '8px', borderRadius: '4px',
                            bgcolor: isAudioActive ? (status === 'playing' ? DIRECT_BLUE : DIRECT_PINK) : '#e0e0e0',
                            height: isAudioActive ? '100%' : '10px',
                            animation: isAudioActive ? `soundWave 1.2s infinite ease-in-out` : 'none',
                            animationDelay: `${i * 0.1}s`,
                            '@keyframes soundWave': { '0%, 100%': { height: '20%' }, '50%': { height: '100%' } }
                        }} />
                    ))}
                </Box>

                <Box sx={{ mt: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {status === 'idle' ? (
                        <Button variant="contained" startIcon={<RecordVoiceOverIcon />} onClick={startCall} sx={{ bgcolor: DIRECT_BLUE, borderRadius: '50px', px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 700, '&:hover': { bgcolor: '#121530' } }}>התחל סימולציה</Button>
                    ) : (
                        <Button variant="contained" startIcon={<CallEndIcon />} onClick={stopAllProcesses} sx={{ bgcolor: DIRECT_PINK, borderRadius: '50px', px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 700, '&:hover': { bgcolor: '#c2104a' } }}>סיום שיחה</Button>
                    )}
                </Box>
            </Paper>

            {/* פאנל שמאל - צ'אט */}
            <Paper elevation={0} sx={{ flex: 3, borderRadius: '24px', bgcolor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <Box sx={{ p: 3, bgcolor: '#f8f9fc', borderBottom: '1px solid #edf2f7' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DIRECT_BLUE }}>תמליל שיחה</Typography>
                </Box>
                <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#fafafa' }}>
                    {messages.length === 0 && (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            <Typography>התמליל יופיע כאן ברגע שהשיחה תתחיל...</Typography>
                        </Box>
                    )}
                    {messages.map((msg, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end' }}>
                            <Box sx={{ maxWidth: '75%' }}>
                                <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block', px: 1, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    {msg.role === 'user' ? 'נציג (את/ה)' : 'לקוח (AI)'}
                                </Typography>
                                <Paper sx={{
                                    p: 2,
                                    borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                    bgcolor: msg.role === 'user' ? DIRECT_PINK : '#e9ecef',
                                    color: msg.role === 'user' ? 'white' : DIRECT_BLUE,
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                }}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{msg.text}</Typography>
                                </Paper>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Paper>

            {/* הפופ-אפ של המשוב */}
            {/* הפופ-אפ החדש והמעוצב של המשוב */}
            {feedback && (
                <Fade in={!!feedback}>
                    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(15, 23, 42, 0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, backdropFilter: 'blur(8px)' }}>
                        <Paper sx={{ width: '100%', maxWidth: '650px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>

                            {/* חלק עליון - כותרת */}
                            <Box sx={{ bgcolor: DIRECT_BLUE, p: 4, pb: 6, textAlign: 'center', color: 'white', position: 'relative' }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>סיכום סימולציה</Typography>
                                <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>השיחה נותחה ונשמרה במערכת בהצלחה</Typography>
                            </Box>

                            {/* עיגול הציון (צף בין הכותרת לתוכן) */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5, mb: 2, position: 'relative', zIndex: 2 }}>
                                {(() => {
                                    const score = feedback.scores?.REVIEW || 0;
                                    const scoreColor = score >= 90 ? '#4caf50' : score >= 75 ? '#ff9800' : '#f44336';
                                    return (
                                        <Box sx={{
                                            width: 100, height: 100, borderRadius: '50%', bgcolor: 'white',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: `4px solid ${scoreColor}`
                                        }}>
                                            <Typography variant="h3" sx={{ fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#888' }}>מתוך 10</Typography>
                                        </Box>
                                    );
                                })()}
                            </Box>

                            {/* אזור התוכן והטקסט */}
                            <Box sx={{ p: 4, pt: 1, textAlign: 'right', direction: 'rtl' }}>
                                {(() => {
                                    const score = feedback.scores?.REVIEW || 0;
                                    const scoreColor = score >= 90 ? '#4caf50' : score >= 75 ? '#ff9800' : '#f44336';
                                    const message = score >= 90 ? 'עבודה מעולה! כל הכבוד 🎉' : score >= 75 ? 'עבודה טובה, אבל יש מקום לשיפור 👍' : 'יש לעבור שוב על נהלי השיחה ⚠️';
                                    return (
                                        <Typography variant="h6" sx={{ color: scoreColor, textAlign: 'center', fontWeight: 800, mb: 3 }}>
                                            {message}
                                        </Typography>
                                    );
                                })()}

                                {/* תיבת הטקסט של המשוב */}
                                <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', p: 3, mb: 4, maxHeight: '250px', overflowY: 'auto' }}>
                                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1.5, fontWeight: 800 }}>פירוט המשוב המערכתי:</Typography>
                                    <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
                                        {feedback.verbal}
                                    </Typography>
                                </Box>

                                {/* כפתור סיום */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => { setFeedback(null); navigate('/history'); }}
                                    sx={{ py: 1.8, fontSize: '1.1rem', fontWeight: 800, bgcolor: DIRECT_PINK, borderRadius: '12px', '&:hover': { bgcolor: '#c2104a' }, boxShadow: '0 4px 14px rgba(234, 20, 90, 0.4)' }}
                                >
                                    סגירה ומעבר לדוחות
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Fade>
            )}
        </Box>
    );
};

export default VoiceSimulator;