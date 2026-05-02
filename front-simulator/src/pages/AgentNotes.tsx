import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, IconButton, InputBase, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import Draggable from 'react-draggable';
import axios from 'axios';

const NOTE_COLORS = ['#fff9c4'];
const API_BASE = "https://hackathon-java.onrender.com/api";

// --- קומפוננטה לכל פתק ---
const SingleNote = ({ note, onTextChange, onSave, onDelete, onAdd, onDragStop, index }: any) => {
    const nodeRef = useRef<HTMLDivElement>(null); 
    
    return (
        <Draggable 
            nodeRef={nodeRef}
            // התיקון: שימוש ב ?? כדי לשמור על המיקום גם אם הוא 0, ושימוש באינדקס לפיזור פתקים חדשים
            defaultPosition={{ 
                x: note.xPosition ?? (150 + (index % 5) * 20), 
                y: note.yPosition ?? (150 + (index % 5) * 20) 
            }} 
            onStop={(e, data) => onDragStop(note.id, data)}
            handle=".drag-handle"
        >
            <div ref={nodeRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
                <Paper elevation={8} sx={{ width: 220, minHeight: 200, bgcolor: note.color || '#fff9c4', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                    <Box className="drag-handle" sx={{ height: 32, bgcolor: 'rgba(0,0,0,0.06)', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                        <Box sx={{ display: 'flex' }}>
                            <IconButton size="small" onClick={() => onDelete(note.id)} sx={{ color: 'rgba(0,0,0,0.5)', width: 24, height: 24 }}>
                                <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton size="small" onClick={onAdd} sx={{ color: 'rgba(0,0,0,0.5)', width: 24, height: 24, ml: 0.5 }}>
                                <AddIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Box>
                        {note.isDraft && (
                            <IconButton size="small" onClick={() => onSave(note.id)} sx={{ color: 'green', width: 24, height: 24 }}>
                                <CheckIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        )}
                    </Box>
                    <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {note.isDraft ? (
                            <InputBase
                                multiline 
                                fullWidth 
                                value={note.content || ''} 
                                onChange={(e) => onTextChange(note.id, e.target.value)}
                                placeholder="הקלידי (ולחצי V לשמירה)"
                                sx={{ direction: 'rtl', fontSize: '0.95rem', lineHeight: 1.5, p: 0, flex: 1, alignItems: 'flex-start' }}
                            />
                        ) : (
                            <Typography variant="body1" sx={{ direction: 'rtl', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {note.content}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </div>
        </Draggable>
    );
};

// --- הקומפוננטה הראשית שמנהלת את הפתקים מול השרת ---
const AgentNotes = ({ isOpen }: { isOpen: boolean }) => {
    const [notes, setNotes] = useState<any[]>([]);
    const [agentId, setAgentId] = useState<number | null>(null);

    // משיכת הפתקיות מהשרת כשהקומפוננטה עולה
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setAgentId(user.id);
            fetchNotes(user.id);
        }
    }, []);

    const fetchNotes = async (id: number) => {
        try {
            const res = await axios.get(`${API_BASE}/notes/agent/${id}`);
            setNotes(res.data);
        } catch (err) {
            console.error("שגיאה במשיכת פתקיות", err);
        }
    };

    // פונקציית עזר לעדכון פתק קיים בשרת
    const syncNoteWithServer = async (note: any) => {
        if (!agentId) return;
        try {
            await axios.post(`${API_BASE}/notes/agent/${agentId}`, note);
        } catch (err) {
            console.error("שגיאה בשמירת הפתק בשרת", err);
        }
    };

    // פותח פתק אוטומטי אם לוחצים על התפריט ואין פתקים פתוחים
    useEffect(() => {
        if (isOpen && notes.length === 0 && agentId) {
            handleAddDraft();
        }
    }, [isOpen, agentId]);

    // יצירת פתק חדש ושמירתו בשרת
    const handleAddDraft = async () => {
        if (!agentId) return;
        const draft = {
            content: '',
            isDraft: true,
            // נותנים מיקום ראשוני בשרת (למרות שהפרונט יידע לפזר אותם)
            xPosition: 150 + (notes.length * 20),
            yPosition: 150 + (notes.length * 20),
            color: NOTE_COLORS[0]
        };
        try {
            const res = await axios.post(`${API_BASE}/notes/agent/${agentId}`, draft);
            setNotes(prev => [...prev, res.data]); 
        } catch (err) {
            console.error("שגיאה ביצירת פתק חדש", err);
        }
    };

    // עדכון טקסט מקומי בזמן הקלדה
    const handleTextChange = (id: number, text: string) => {
        setNotes(notes.map(n => n.id === id ? { ...n, content: text } : n));
    };

    // שמירת טקסט הפתק לשרת
    const handleSaveNote = (id: number) => {
        const noteToSave = notes.find(n => n.id === id);
        if (noteToSave) {
            const updatedNote = { ...noteToSave, isDraft: false };
            setNotes(notes.map(n => n.id === id ? updatedNote : n));
            syncNoteWithServer(updatedNote); 
        }
    };

    // מחיקת פתק מהשרת
    const handleDeleteNote = async (id: number) => {
        try {
            await axios.delete(`${API_BASE}/notes/${id}`);
            setNotes(notes.filter(n => n.id !== id));
        } catch (err) {
            console.error("שגיאה במחיקת פתק", err);
        }
    };

    // שמירת מיקום הפתק בשרת לאחר גרירה
    const handleDragStop = (id: number, data: { x: number, y: number }) => {
        const noteToUpdate = notes.find(n => n.id === id);
        if (noteToUpdate) {
            const updatedNote = { ...noteToUpdate, xPosition: data.x, yPosition: data.y };
            setNotes(notes.map(n => n.id === id ? updatedNote : n));
            syncNoteWithServer(updatedNote); 
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {notes.map((note, index) => (
                <SingleNote 
                    key={note.id}
                    note={note}
                    index={index} // העברת האינדקס כדי שפתקים חדשים יסתדרו יפה
                    onTextChange={handleTextChange}
                    onSave={handleSaveNote}
                    onDelete={handleDeleteNote}
                    onAdd={handleAddDraft}
                    onDragStop={handleDragStop}
                />
            ))}
        </>
    );
};

export default AgentNotes;