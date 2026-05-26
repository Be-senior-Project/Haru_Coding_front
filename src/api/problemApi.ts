import {api} from './apiFetch';

export interface ProblemResponse {
  id: number;
  type: string;
  difficulty: string;
  topic: string;
  title: string;
  question: string;
  code?: string;
  options?: string[];
  blanks?: string[];
  matchLeft?: string[];
  matchRight?: string[];
  answer?: any;
  explanation?: string;
}

export interface ProblemSetResponse {
  id: number;
  title: string;
  targetDate: string;
  difficulty: string;
  isAiGenerated: boolean;
  problems: ProblemResponse[];
}

export interface SubmitAnswerItem {
  problemId: number;
  answer: any;
  timeSpentSec?: number;
}

export interface SubmitResultResponse {
  totalProblems: number;
  correctCount: number;
  xpEarned: number;
  streakUpdated: boolean;
  currentStreak: number;
  results: {
    problemId: number;
    isCorrect: boolean;
    correctAnswer: any;
    explanation: string;
  }[];
}

export const problemApi = {
  getTodaySet: () =>
    api.get<ProblemSetResponse>('/api/problem-sets/today'),

  submitSet: (setId: number, answers: SubmitAnswerItem[]) =>
    api.post<SubmitResultResponse>(`/api/problem-sets/${setId}/submit`, {answers}),
};
