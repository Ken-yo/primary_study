export type Grade = 3 | 4 | 5 | 6;

export type Subject =
  | "kokugo"
  | "sansu"
  | "rika"
  | "shakai"
  | "eigo"
  | "doutoku";

export interface SubjectInfo {
  id: Subject;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  availableGrades: Grade[];
}

export interface Question {
  id: string;
  subject: Subject;
  grade: Grade;
  theme: string;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSession {
  id: string;
  subject: Subject;
  grade: Grade;
  theme: string;
  questions: Question[];
  answers: (number | null)[];
  startedAt: number;
  finishedAt?: number;
  timePerQuestion: number;
}

export interface SessionResult {
  sessionId: string;
  subject: Subject;
  grade: Grade;
  theme: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  date: string;
  duration: number;
}

export type Screen =
  | "home"
  | "subject"
  | "theme"
  | "quiz"
  | "result"
  | "history";
