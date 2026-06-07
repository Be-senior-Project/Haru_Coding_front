// 백엔드 problems 스키마와 1:1로 맞춘 프론트 공용 문제 모델

export type ProblemType = 'IMPLEMENTATION' | 'DEBUGGING' | 'FILL_IN_THE_BLANK';

export interface IOExample {
  input: string;
  output: string;
}

export interface Problem {
  id: number;
  setId?: string | null;          // seed의 "Set Id" (예: SET-BI-01)
  type: ProblemType;
  category: string;               // 예: Basic/Introductory
  subcategory?: string | null;    // 예: DFS/BFS (없을 수 있음)
  difficulty: number;             // 0 | 1 | 2
  language: string;               // Python | Java | C++
  title: string;
  description: string;
  constraints?: string[];
  ioExample?: IOExample | null;   // {input, output}
  codeSkeleton?: string | null;
  // 정답: 구현/디버깅은 코드 문자열, 빈칸은 문자열 배열
  answer: string | string[];
  explanation: string;
  conceptExplanation?: string | null;
}

// ── 표시용 라벨/색상 ────────────────────────────────────────────
export const TYPE_LABEL: Record<ProblemType, string> = {
  IMPLEMENTATION: '구현',
  DEBUGGING: '디버깅',
  FILL_IN_THE_BLANK: '빈칸 채우기',
};

export const DIFFICULTY_LABEL: Record<number, string> = {
  0: '기초',
  1: '중급',
  2: '고급',
};

export const DIFFICULTY_COLOR: Record<number, string> = {
  0: '#4CAF50',
  1: '#FF9800',
  2: '#F44336',
};

export function difficultyLabel(d: number): string {
  return DIFFICULTY_LABEL[d] ?? '기타';
}

export function difficultyColor(d: number): string {
  return DIFFICULTY_COLOR[d] ?? '#9E9E9E';
}

// CodeBlock이 지원하는 언어로 매핑 (Java/C++는 우선 javascript 토크나이저로 폴백)
export function toCodeLang(language?: string): 'python' | 'javascript' {
  return language?.toLowerCase().startsWith('py') ? 'python' : 'javascript';
}
