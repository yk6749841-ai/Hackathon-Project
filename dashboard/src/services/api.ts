import axios from 'axios';
import type { Scenario, SimulationResult, User } from '../types';

// 1. הגדרת שרת הניהול וה-DB (Java ב-Render)
const API = axios.create({
  baseURL: 'https://hackathon-java.onrender.com/api',
});

// 2. הגדרת שרת ה-AI (Python ב-Localhost)
// שרת זה מטפל ביצירת הפרומפטים ובסימולציה הקולית
const AI_API = axios.create({
  baseURL: 'http://localhost:8001',
});

export const managerApi = {
  // --- ניהול תרחישים (Scenarios) ---

  // שליפת כל התרחישים מה-Java
  getScenarios: () =>
    API.get<Scenario[]>('/manager/scenarios'),

  // יצירת תרחיש חדש - קריאה לפייתון (כי הוא בונה את ה-Meta-Prompt)
  initializeSimulation: (data: any) =>
    AI_API.post('/initialize-simulation', data),

  // מחיקת תרחיש מה-Java
  deleteScenario: (id: number) =>
    API.delete(`/manager/delete-scenario/${id}`),

  getResultById: (resultId: number) =>
    API.get<SimulationResult>(`/manager/result/${resultId}`),
  // --- ניהול נציגים (Agents) ---

  // שליפת כל הנציגים מה-Java
  getAllAgents: () =>
    API.get<User[]>('/manager/all-agents'),

  // הוספת נציג חדש ל-Java
  addAgent: (agentData: Partial<User>) =>
    API.post<User>('/manager/add-agent', agentData),

  // חיפוש נציג ב-Java
  searchAgent: (name: string = '') =>
    API.get<User[]>(`/manager/search-agent?name=${name}`),


  // --- תוצאות ודוחות (Results) ---

  // שליפת כל התוצאות מה-Java
  getAllResults: () =>
    API.get<SimulationResult[]>('/manager/all-results'),

  // שליפת היסטוריית נציג מה-Java
  getResultsByAgent: (agentId: number) =>
    API.get<SimulationResult[]>(`/agent/${agentId}/history`),

  // --- שיוך משימות (Assignments) ---

  // שיוך תרחיש לנציג ב-Java
  assignToAgent: (agentId: number, scenarioId: number, difficulty: string) =>
    API.post(`/manager/assign-to-agent?agentId=${agentId}&scenarioId=${scenarioId}&difficulty=${difficulty}`),

  assignToAll: (scenarioId: number, difficulty: string) =>
    API.post('/manager/assign-all', { scenarioId, difficulty }),

  deleteAgent: (id: number) => API.delete(`/manager/agent/${id}`),
};

export const agentApi = {
  // היסטוריית סימולציות של נציג מה-Java
  getHistory: (id: number) =>
    API.get<SimulationResult[]>(`/agent/${id}/history`),

  // שליפת משימות פתוחות מה-Java
  getTasks: (id: number) =>
    API.get(`/agent/${id}/tasks`),

  deleteResult: (id: number) => API.delete(`/agent/result/${id}`),

};