import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MyTasks from './pages/MyTasks';
import { AgentLayout } from './layouts/AgentLayout';
import Login from './pages/Login';
import VoiceSimulator from './pages/VoiceSimulator';
import AgentHistory from './pages/AgentHistory';
import AgentReports from './pages/AgentReports';

function App() {
  // בדיקה מהירה: האם יש כבר משתמש מחובר שנשמר בזיכרון של הדפדפן?
  const isLoggedIn = !!localStorage.getItem('user');

  return (
    <Router>
      <Routes>
        {/* דף התחברות - ללא Layout */}
        <Route path="/login" element={<Login />} />
        
        {/* אזור הנציג המוגן על ידי AgentLayout */}
        <Route path="/" element={<AgentLayout />}>
          {/* התיקון שלנו: ניתוב חכם! אם מחובר ילך למשימות, אם לא - ילך להתחברות */}
          <Route index element={<Navigate to={isLoggedIn ? "/tasks" : "/login"} />} />
          <Route path="history" element={<AgentHistory />} />
          
          {/* הראוט של דוחות התקדמות */}
          <Route path="reports" element={<AgentReports />} />
          
          <Route path="tasks" element={<MyTasks />} />
          <Route path="simulation/:id" element={<VoiceSimulator />} />
        </Route>

        {/* ניתוב ברירת מחדל לכל כתובת לא מוכרת */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

