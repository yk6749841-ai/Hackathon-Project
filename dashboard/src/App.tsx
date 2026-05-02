import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';

// הייבוא הנכון של העמודים שלנו!
import { Scenarios } from './pages/Scenarios';
import { AgentDetails } from './pages/AgentDetails';
import { Dashboard } from './pages/Dashboard';
import ResultsDashboard from './pages/ResultsDashboard'; // ודאי שהנתיב לקובץ נכון
import AgentHistory from './pages/AgentHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* ניתוב ברירת מחדל */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* העמודים שלנו */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scenarios" element={<Scenarios />} />
            <Route path="agent/:id" element={<AgentDetails />} />
            <Route path="/reports" element={<ResultsDashboard />} />
            <Route path="/manager/agent-history/:id" element={<AgentHistory />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
