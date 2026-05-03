import { useState, useEffect, useCallback, useRef } from "react";
import { Subject, Screen, Question, SessionResult } from "./types";
import { SUBJECTS, THEMES, getQuestionsByTheme } from "./data/questions";
import { saveResult, loadHistory } from "./utils/storage";

const TIME_PER_QUESTION = 20; // seconds
const QUESTIONS_PER_QUIZ = 10;

// ── tiny reusable components ─────────────────────────────────────
function Badge({
  color,
  bg,
  children,
}: {
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: 999,
        border: `1px solid ${color}33`,
      }}
    >
      {children}
    </span>
  );
}

function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      style={{
        height: 8,
        background: "#E5E7EB",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

// ── HomeScreen ───────────────────────────────────────────────────
function HomeScreen({
  onSubject,
  onHistory,
}: {
  onSubject: (s: Subject) => void;
  onHistory: () => void;
}) {
  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌟</div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#1E293B",
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          まなびの星
        </h1>
        <p style={{ color: "#64748B", margin: "8px 0 0", fontSize: 14 }}>
          小学3年生 ・ 4択クイズ
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 13,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          かもく
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSubject(s.id as Subject)}
              style={{
                background: "#fff",
                border: `2px solid ${s.color}33`,
                borderRadius: 16,
                padding: "18px 16px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  `0 4px 16px ${s.color}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 1px 4px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.emoji}</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: s.color,
                }}
              >
                {s.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onHistory}
        style={{
          width: "100%",
          marginTop: 8,
          padding: "14px",
          background: "#F8FAFC",
          border: "1.5px solid #E2E8F0",
          borderRadius: 12,
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 600,
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#F1F5F9")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC")
        }
      >
        📊 これまでのきろく
      </button>
    </div>
  );
}

// ── ThemeScreen ──────────────────────────────────────────────────
function ThemeScreen({
  subject,
  onTheme,
  onBack,
}: {
  subject: Subject;
  onTheme: (t: string) => void;
  onBack: () => void;
}) {
  const info = SUBJECTS.find((s) => s.id === subject)!;
  const themes = THEMES[subject] ?? [];

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748B",
          fontSize: 14,
          padding: 0,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← もどる
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 36 }}>{info.emoji}</span>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: info.color,
            }}
          >
            {info.name}
          </h2>
          <p style={{ margin: 0, color: "#94A3B8", fontSize: 13 }}>
            テーマをえらんでね
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {themes.map((theme, i) => (
          <button
            key={theme}
            onClick={() => onTheme(theme)}
            style={{
              background: "#fff",
              border: `1.5px solid ${info.color}33`,
              borderRadius: 14,
              padding: "16px 20px",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "all 0.15s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                info.bgColor;
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                info.color;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#fff";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                `${info.color}33`;
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: info.bgColor,
                color: info.color,
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}
            >
              {theme}
            </span>
            <span style={{ marginLeft: "auto", color: "#CBD5E1", fontSize: 18 }}>
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── QuizScreen ───────────────────────────────────────────────────
function QuizScreen({
  questions,
  subject,
  theme,
  onFinish,
}: {
  questions: Question[];
  subject: Subject;
  theme: string;
  onFinish: (answers: (number | null)[]) => void;
}) {
  const info = SUBJECTS.find((s) => s.id === subject)!;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = questions[current];

  const advance = useCallback(
    (chosenIndex: number | null) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const newAnswers = [...answers];
      newAnswers[current] = chosenIndex;
      setAnswers(newAnswers);

      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        if (current + 1 >= questions.length) {
          onFinish(newAnswers);
        } else {
          setCurrent((c) => c + 1);
          setTimeLeft(TIME_PER_QUESTION);
        }
      }, 1200);
    },
    [answers, current, questions.length, onFinish]
  );

  useEffect(() => {
    if (showFeedback) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          advance(null);
          return TIME_PER_QUESTION;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, showFeedback, advance]);

  const handleChoice = (i: number) => {
    if (showFeedback || selected !== null) return;
    setSelected(i);
    advance(i);
  };

  const correct = q.correctIndex;
  const choiceLabels = ["A", "B", "C", "D"];

  const timerPct = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor =
    timeLeft <= 5 ? "#EF4444" : timeLeft <= 10 ? "#F59E0B" : info.color;

  return (
    <div style={{ padding: "20px 20px 32px", maxWidth: 560, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Badge color={info.color} bg={info.bgColor}>
          {info.emoji} {info.name} ・ {theme}
        </Badge>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>
          {current + 1} / {questions.length}
        </span>
      </div>

      <ProgressBar value={current} max={questions.length} color={info.color} />

      {/* Timer */}
      <div style={{ marginTop: 12, marginBottom: 4 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: timerColor,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          <span>⏱ のこり時間</span>
          <span>{timeLeft}秒</span>
        </div>
        <div
          style={{
            height: 6,
            background: "#E5E7EB",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${timerPct}%`,
              background: timerColor,
              borderRadius: 999,
              transition: "width 1s linear, background 0.3s",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "24px 20px",
          margin: "20px 0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          minHeight: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#1E293B",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          {q.text}
        </p>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.choices.map((choice, i) => {
          let bg = "#fff";
          let border = "1.5px solid #E2E8F0";
          let color = "#1E293B";

          if (showFeedback) {
            if (i === correct) {
              bg = "#D1FAE5";
              border = "1.5px solid #10B981";
              color = "#065F46";
            } else if (i === selected && selected !== correct) {
              bg = "#FEE2E2";
              border = "1.5px solid #EF4444";
              color = "#991B1B";
            }
          } else if (i === selected) {
            bg = info.bgColor;
            border = `1.5px solid ${info.color}`;
          }

          return (
            <button
              key={i}
              onClick={() => handleChoice(i)}
              disabled={showFeedback}
              style={{
                background: bg,
                border,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: showFeedback ? "default" : "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background:
                    showFeedback && i === correct
                      ? "#10B981"
                      : showFeedback && i === selected && selected !== correct
                      ? "#EF4444"
                      : info.color,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {choiceLabels[i]}
              </span>
              <span style={{ fontSize: 15, fontWeight: 500, color, flex: 1 }}>
                {choice}
              </span>
              {showFeedback && i === correct && (
                <span style={{ fontSize: 18 }}>✅</span>
              )}
              {showFeedback && i === selected && selected !== correct && (
                <span style={{ fontSize: 18 }}>❌</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback explanation */}
      {showFeedback && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 12,
            background: selected === correct ? "#D1FAE5" : selected === null ? "#FEF3C7" : "#FEE2E2",
            color: selected === correct ? "#065F46" : selected === null ? "#78350F" : "#991B1B",
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          {selected === null
            ? "⌛ 時間切れ！" 
            : selected === correct
            ? "🎉 せいかい！"
            : "😅 ざんねん！"}{" "}
          {q.explanation}
        </div>
      )}
    </div>
  );
}

// ── ResultScreen ─────────────────────────────────────────────────
function ResultScreen({
  questions,
  answers,
  subject,
  theme,
  onHome,
  onRetry,
}: {
  questions: Question[];
  answers: (number | null)[];
  subject: Subject;
  theme: string;
  onHome: () => void;
  onRetry: () => void;
}) {
  const info = SUBJECTS.find((s) => s.id === subject)!;
  const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);
  const stars =
    pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  const starMsg =
    stars === 3
      ? "すばらしい！満点に近いよ！"
      : stars === 2
      ? "よくできました！"
      : stars === 1
      ? "もう少しがんばろう！"
      : "次はできるよ！";

  return (
    <div style={{ padding: "24px 20px 32px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Badge color={info.color} bg={info.bgColor}>
          {info.emoji} {info.name} ・ {theme}
        </Badge>
      </div>
      {/* Star panel */}
      <div
        style={{
          background: `linear-gradient(135deg, ${info.bgColor} 0%, #fff 100%)`,
          border: `2px solid ${info.color}33`,
          borderRadius: 24,
          padding: "32px 24px",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>
          {"⭐".repeat(stars)}
          {"☆".repeat(3 - stars)}
        </div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: info.color }}>
          {starMsg}
        </p>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: info.color,
            lineHeight: 1.1,
            marginTop: 12,
          }}
        >
          {correct}
          <span style={{ fontSize: 24, fontWeight: 400, color: "#94A3B8" }}>
            /{total}
          </span>
        </div>
        <p style={{ color: "#64748B", margin: "4px 0 0", fontSize: 14 }}>
          正解率 {pct}%
        </p>
        <div style={{ marginTop: 16 }}>
          <ProgressBar value={correct} max={total} color={info.color} />
        </div>
      </div>

      {/* Per-question review */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontSize: 13,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          もんだいのこたえ
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {questions.map((q, i) => {
            const ans = answers[i];
            const ok = ans === q.correctIndex;
            return (
              <div
                key={q.id}
                style={{
                  background: ok ? "#D1FAE5" : "#FEE2E2",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>
                  {ok ? "✅" : "❌"}
                </span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: ok ? "#065F46" : "#991B1B",
                    }}
                  >
                    Q{i + 1}. {q.text}
                  </p>
                  {!ok && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>
                      せいかい: {q.choices[q.correctIndex]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onRetry}
          style={{
            flex: 1,
            padding: "14px",
            background: info.color,
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          もう一度
        </button>
        <button
          onClick={onHome}
          style={{
            flex: 1,
            padding: "14px",
            background: "#F1F5F9",
            color: "#475569",
            border: "none",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          ホームへ
        </button>
      </div>
    </div>
  );
}

// ── HistoryScreen ────────────────────────────────────────────────
function HistoryScreen({ onBack }: { onBack: () => void }) {
  const history: SessionResult[] = loadHistory();

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748B",
          fontSize: 14,
          padding: 0,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← もどる
      </button>

      <h2
        style={{
          margin: "0 0 20px",
          fontSize: 22,
          fontWeight: 800,
          color: "#1E293B",
        }}
      >
        📊 これまでのきろく
      </h2>

      {history.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#94A3B8",
          }}
        >
          <div style={{ fontSize: 48 }}>📝</div>
          <p style={{ marginTop: 12 }}>まだきろくがありません</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map((r) => {
            const info = SUBJECTS.find((s) => s.id === r.subject);
            const pct = Math.round((r.correctCount / r.totalQuestions) * 100);
            return (
              <div
                key={r.sessionId}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "14px 16px",
                  border: "1.5px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{info?.emoji}</span>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 14,
                          color: info?.color ?? "#1E293B",
                        }}
                      >
                        {info?.name} ・ {r.theme}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                        {r.date}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color:
                          pct >= 80
                            ? "#10B981"
                            : pct >= 60
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {r.correctCount}/{r.totalQuestions}
                    </span>
                    <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                      {pct}%
                    </p>
                  </div>
                </div>
                <ProgressBar
                  value={r.correctCount}
                  max={r.totalQuestions}
                  color={
                    pct >= 80
                      ? "#10B981"
                      : pct >= 60
                      ? "#F59E0B"
                      : "#EF4444"
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [subject, setSubject] = useState<Subject | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const startQuiz = useCallback(
    (s: Subject, t: string) => {
      const qs = getQuestionsByTheme(s, t, QUESTIONS_PER_QUIZ);
      setQuestions(qs);
      setAnswers([]);
      setSubject(s);
      setTheme(t);
      setScreen("quiz");
    },
    []
  );

  const handleFinish = useCallback(
    (finalAnswers: (number | null)[]) => {
      setAnswers(finalAnswers);
      const correct = finalAnswers.filter(
        (a, i) => a === questions[i].correctIndex
      ).length;
      const result: SessionResult = {
        sessionId: `${Date.now()}`,
        subject: subject!,
        grade: 3,
        theme: theme!,
        totalQuestions: questions.length,
        correctCount: correct,
        score: Math.round((correct / questions.length) * 100),
        date: new Date().toLocaleString("ja-JP"),
        duration: 0,
      };
      saveResult(result);
      setScreen("result");
    },
    [questions, subject, theme]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily:
          "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif",
      }}
    >
      {screen === "home" && (
        <HomeScreen
          onSubject={(s) => {
            setSubject(s);
            setScreen("theme");
          }}
          onHistory={() => setScreen("history")}
        />
      )}
      {screen === "theme" && subject && (
        <ThemeScreen
          subject={subject}
          onTheme={(t) => startQuiz(subject, t)}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "quiz" && subject && theme && (
        <QuizScreen
          questions={questions}
          subject={subject}
          theme={theme}
          onFinish={handleFinish}
        />
      )}
      {screen === "result" && subject && theme && (
        <ResultScreen
          questions={questions}
          answers={answers}
          subject={subject}
          theme={theme}
          onHome={() => setScreen("home")}
          onRetry={() => startQuiz(subject, theme)}
        />
      )}
      {screen === "history" && (
        <HistoryScreen onBack={() => setScreen("home")} />
      )}
    </div>
  );
}
