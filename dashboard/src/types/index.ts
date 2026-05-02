export interface User {
  id: number;
  email: string;
  agentCode: string;
  idNumber: string;
  fullName: string;
  role: string;
  googleId?: string;
  pictureUrl?: string;
  rank: number;
}
export interface Scenario {
    id: number;
    name: string;
    description: string;
    difficulty: string; // 'Easy', 'Medium', 'Hard'
    promptInstructions?: string; // ההוראות שיישלחו ל-Python
}

export interface SimulationResult {
  id: number;
  traineeId: string;
  scenario: Scenario;
  finalScore: number;
  fullTranscript: string;
  feedback: string;
  empathyScore: number;
  stressLevel: number;
  interruptions: number;
  averageResponseTime: number;
  createdAt: string;
}