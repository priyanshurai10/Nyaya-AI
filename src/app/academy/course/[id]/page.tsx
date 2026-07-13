"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, BookOpen, CheckCircle2, Circle,
  PlayCircle, Award, Clock, Brain, Bookmark, BookmarkCheck,
  ChevronDown, ChevronUp, AlertCircle, Loader2, X,
  FileText, List, BarChart2, RotateCcw, Menu, Home
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────────────
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonContent {
  introduction: string;
  keyPoints: string[];
  practicalExample: { scenario: string; explanation: string };
  importantSections: { section: string; description: string }[];
  faqs: { question: string; answer: string }[];
  relatedLaws: string[];
  summary: string;
}

interface Lesson {
  id: string;
  title: string;
  readingTime: string;
  content: LessonContent;
  quiz: { questions: QuizQuestion[] };
}

interface Module { id: string; title: string; lessons: Lesson[] }

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  totalLessons: number;
  estimatedHours: number;
  modules: Module[];
}

const FALLBACK_COURSE: Course = {
  id: "const-law-101",
  title: "Indian Constitutional Law: Rights and Structure",
  description: "A comprehensive journey through the Constitution of India, covering Fundamental Rights, Directive Principles, and the basic structure doctrine.",
  category: "Constitutional Law",
  difficulty: "Intermediate",
  totalLessons: 3,
  estimatedHours: 5,
  modules: [
    {
      id: "MOD-1",
      title: "Module 1: Fundamental Rights and Basic Structure",
      lessons: [
        {
          id: "LES-1",
          title: "Introduction to Fundamental Rights (Part III)",
          readingTime: "15 min",
          content: {
            introduction: "Part III of the Indian Constitution guarantees Fundamental Rights to citizens and in some cases, to all persons. These rights act as limitations on the power of the State and ensure the protection of individual liberties.",
            keyPoints: [
              "Fundamental Rights are justiciable, meaning they can be enforced in courts.",
              "Article 12 defines 'the State' for the purpose of Part III.",
              "Article 13 declares laws inconsistent with or in derogation of Fundamental Rights to be void.",
              "They are not absolute and are subject to reasonable restrictions."
            ],
            practicalExample: {
              scenario: "The government passes a law banning citizens from speaking against a specific public policy in peaceful gatherings.",
              explanation: "This would likely violate Article 19(1)(a) which guarantees freedom of speech and expression. Unless the restriction falls under the specific reasonable restrictions mentioned in Article 19(2) (like public order, security of the State), the court can strike down the law as unconstitutional under Article 13."
            },
            importantSections: [
              { section: "Article 12", description: "Definition of State including Government, Parliament, and local authorities." },
              { section: "Article 13", description: "Laws inconsistent with Fundamental Rights are void." },
              { section: "Article 14", description: "Equality before the law and equal protection of the laws." }
            ],
            faqs: [
              { question: "Can Fundamental Rights be amended?", answer: "Yes, under Article 368, but they cannot be amended if it violates the 'Basic Structure' of the Constitution." },
              { question: "Are these rights available to foreigners?", answer: "Some rights, like Article 14 and 21, are available to foreigners, while others like Article 15, 16, 19, 29, and 30 are exclusive to citizens." }
            ],
            relatedLaws: ["Constitution of India, 1950", "Protection of Human Rights Act, 1993"],
            summary: "Fundamental Rights form the cornerstone of Indian democracy, guaranteeing essential liberties while balancing them with state security and public order through reasonable restrictions."
          },
          quiz: {
            questions: [
              {
                id: 1,
                question: "Which Article defines the term 'State' in the context of Fundamental Rights?",
                options: ["Article 12", "Article 14", "Article 19", "Article 21"],
                correctAnswer: 0,
                explanation: "Article 12 defines the 'State' for Part III, which includes the Government and Parliament of India, state governments, and all local or other authorities within the territory of India."
              },
              {
                id: 2,
                question: "Are all Fundamental Rights available to non-citizens?",
                options: ["Yes", "No", "Only in emergencies", "Only if they are taxpayers"],
                correctAnswer: 1,
                explanation: "No. Rights under Articles 15, 16, 19, 29, and 30 are available only to citizens. Rights like Article 14 and 21 are available to all persons."
              }
            ]
          }
        },
        {
          id: "LES-2",
          title: "The Basic Structure Doctrine",
          readingTime: "20 min",
          content: {
            introduction: "The Basic Structure Doctrine is a judicial principle established by the Supreme Court of India holding that certain fundamental features of the Constitution cannot be altered or destroyed by amendments by the Parliament.",
            keyPoints: [
              "Established in the landmark Kesavananda Bharati v. State of Kerala (1973) case.",
              "Limits Parliament's amending power under Article 368.",
              "Features like democracy, secularism, judicial review, and rule of law form the basic structure.",
              "The Court decides what constitutes the basic structure on a case-by-case basis."
            ],
            practicalExample: {
              scenario: "Parliament passes an amendment removing the power of the Supreme Court to review constitutional amendments.",
              explanation: "This amendment would be struck down because 'Judicial Review' is considered a part of the Basic Structure of the Constitution as established in the Minerva Mills case (1980). Parliament cannot use Article 368 to destroy the basic structure."
            },
            importantSections: [
              { section: "Article 368", description: "Power of Parliament to amend the Constitution and procedure therefor." },
              { section: "Article 32", description: "Remedies for enforcement of rights conferred by Part III (Right to Constitutional Remedies)." }
            ],
            faqs: [
              { question: "Is the term 'Basic Structure' mentioned in the Constitution?", answer: "No, it is a judicial invention introduced by the Supreme Court in 1973." },
              { question: "Can the Parliament override the basic structure doctrine?", answer: "No, any amendment that alters the basic structure will be deemed unconstitutional by the Supreme Court." }
            ],
            relatedLaws: ["Constitution (Twenty-fourth Amendment) Act, 1971", "Constitution (Forty-second Amendment) Act, 1976"],
            summary: "The Basic Structure Doctrine serves as a constitutional safeguard, ensuring that the foundational principles and identity of the Indian Constitution remain intact regardless of parliamentary majorities."
          },
          quiz: {
            questions: [
              {
                id: 1,
                question: "In which landmark case was the Basic Structure Doctrine established?",
                options: ["Golaknath v. State of Punjab", "Kesavananda Bharati v. State of Kerala", "Minerva Mills v. Union of India", "Maneka Gandhi v. Union of India"],
                correctAnswer: 1,
                explanation: "The doctrine was established by a 13-judge bench in the Kesavananda Bharati case in 1973."
              },
              {
                id: 2,
                question: "Which of the following is considered a part of the Basic Structure?",
                options: ["Right to Property", "Secularism", "Universal Basic Income", "Right to Strike"],
                correctAnswer: 1,
                explanation: "Secularism, along with democracy, rule of law, and judicial review, is widely recognized as part of the Basic Structure. The Right to Property is a constitutional right (Article 300A), not a basic feature."
              }
            ]
          }
        },
        {
          id: "LES-3",
          title: "Right to Life and Personal Liberty (Article 21)",
          readingTime: "18 min",
          content: {
            introduction: "Article 21 states that 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' It has been interpreted as the heart of the Constitution.",
            keyPoints: [
              "Applies to all persons, citizens and non-citizens alike.",
              "Expanded by the Supreme Court in Maneka Gandhi (1978) to include 'due process'.",
              "Encompasses the right to live with human dignity, right to privacy, right to clean environment, and more.",
              "Cannot be suspended even during a national emergency (along with Article 20)."
            ],
            practicalExample: {
              scenario: "A government authority detains an individual indefinitely without informing them of the grounds of arrest and denying them a lawyer.",
              explanation: "This violates Article 21 (as well as Article 22). The 'procedure established by law' must be fair, just, and reasonable. Arbitrary detention without due process directly infringes upon personal liberty."
            },
            importantSections: [
              { section: "Article 21", description: "Protection of life and personal liberty." },
              { section: "Article 21A", description: "Right to education (inserted by 86th Amendment)." },
              { section: "Article 20", description: "Protection in respect of conviction for offences." }
            ],
            faqs: [
              { question: "Is the Right to Privacy a fundamental right?", answer: "Yes, it was declared a fundamental right intrinsic to life and liberty under Article 21 by the Supreme Court in the KS Puttaswamy case (2017)." },
              { question: "Can Article 21 be suspended during an Emergency?", answer: "No. The 44th Amendment ensured that Articles 20 and 21 cannot be suspended during a national emergency." }
            ],
            relatedLaws: ["Right to Information Act, 2005", "Right of Children to Free and Compulsory Education Act, 2009"],
            summary: "Article 21 has evolved from a simple protection against arbitrary executive action to a comprehensive umbrella right encompassing various dimensions of a dignified human life."
          },
          quiz: {
            questions: [
              {
                id: 1,
                question: "Which case expanded Article 21 to ensure the 'procedure established by law' must be fair, just, and reasonable?",
                options: ["A.K. Gopalan case", "Maneka Gandhi case", "K.S. Puttaswamy case", "Vishaka case"],
                correctAnswer: 1,
                explanation: "The Maneka Gandhi v. Union of India (1978) case greatly expanded the scope of Article 21, interpreting 'procedure established by law' to practically include substantive 'due process'."
              },
              {
                id: 2,
                question: "Which right was recognized as an intrinsic part of Article 21 in 2017?",
                options: ["Right to Education", "Right to Property", "Right to Privacy", "Right to Information"],
                correctAnswer: 2,
                explanation: "In Justice K.S. Puttaswamy (Retd.) v. Union of India (2017), a 9-judge bench unanimously held that the Right to Privacy is a fundamental right under Article 21."
              }
            ]
          }
        }
      ]
    }
  ]
};

// ── Helper ───────────────────────────────────────────────────────────────────
function flatLessons(modules: Module[]): { lesson: Lesson; moduleId: string; moduleTitle: string }[] {
  return modules.flatMap(m => m.lessons.map(l => ({ lesson: l, moduleId: m.id, moduleTitle: m.title })));
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CourseViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"content" | "quiz">("content");

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const contentRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = useRef(false);

  // ── Fetch course ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const normalizeCourse = (raw: any): Course => {
      if (!raw) return raw;
      
      const modules = (raw.modules || []).map((mod: any) => {
        const lessons = (mod.lessons || []).map((les: any, lesIdx: number) => {
          let questions: QuizQuestion[] = [];
          if (Array.isArray(les.quiz)) {
            questions = les.quiz.map((q: any, qIdx: number) => ({
              id: q.id !== undefined ? q.id : qIdx + 1,
              question: q.question || "",
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: q.correct !== undefined ? q.correct : (q.correctAnswer !== undefined ? q.correctAnswer : 0),
              explanation: q.explanation || ""
            }));
          } else if (les.quiz && Array.isArray(les.quiz.questions)) {
            questions = les.quiz.questions.map((q: any, qIdx: number) => ({
              id: q.id !== undefined ? q.id : qIdx + 1,
              question: q.question || "",
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: q.correct !== undefined ? q.correct : (q.correctAnswer !== undefined ? q.correctAnswer : 0),
              explanation: q.explanation || ""
            }));
          }

          return {
            ...les,
            readingTime: typeof les.readingTime === 'number' ? `${les.readingTime} min` : (les.readingTime || "10 min"),
            quiz: {
              questions
            }
          };
        });

        return {
          ...mod,
          lessons
        };
      });

      return {
        ...raw,
        totalLessons: raw.totalLessons || modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0),
        modules
      };
    };

    const applyCourse = (c: Course) => {
      const normalized = normalizeCourse(c || FALLBACK_COURSE);
      setCourse(normalized);
      setExpandedModules(new Set(normalized.modules.map(m => m.id)));
      const lastLesson = localStorage.getItem(`nyaya_last_lesson_${id}`);
      const firstLesson = normalized.modules[0]?.lessons[0]?.id;
      setCurrentLessonId(lastLesson || firstLesson || null);
    };

    apiClient.get(`/academy/courses/${id}`)
      .then(data => {
        if (data && data.success && data.data) {
          applyCourse(data.data);
        } else {
          applyCourse(FALLBACK_COURSE);
        }
      })
      .catch(() => applyCourse(FALLBACK_COURSE))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Fetch DB progress ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    apiClient.get(`/academy/progress?courseId=${id}`, { redirectOnAuthError: false })
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const newCompleted = new Set<string>();
          const newProgress: Record<string, number> = {};
          const newScores: Record<string, number> = {};
          data.data.forEach((p: any) => {
            newProgress[p.lessonId] = p.progressPct;
            if (p.status === "COMPLETED") newCompleted.add(p.lessonId);
            if (p.quizScore != null) newScores[p.lessonId] = p.quizScore;
          });
          setCompletedLessons(newCompleted);
          setProgress(newProgress);
          setQuizScores(newScores);
          isLoggedIn.current = true;
        }
      })
      .catch(() => {/* unauthenticated — use localStorage fallback */});

    // Also load localStorage fallback
    try {
      const lsCompleted = JSON.parse(localStorage.getItem(`nyaya_completed_${id}`) || "[]");
      setCompletedLessons(prev => new Set(Array.from(prev).concat(lsCompleted)));
    } catch { /* ignore */ }
  }, [id]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const currentLesson = course ? flatLessons(course.modules).find(f => f.lesson.id === currentLessonId) : null;
  const allLessons = course ? flatLessons(course.modules) : [];
  const currentIdx = allLessons.findIndex(f => f.lesson.id === currentLessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const overallProgress = course
    ? Math.round((completedLessons.size / Math.max(course.totalLessons, 1)) * 100)
    : 0;
  const isCertificateEligible = overallProgress === 100;

  const saveProgress = useCallback(async (lessonId: string, pct: number, completed: boolean, score?: number) => {
    setSavingProgress(true);
    const lesson = allLessons.find(f => f.lesson.id === lessonId);

    try {
      await apiClient.post("/academy/progress", {
        lessonId,
        courseId: id,
        moduleId: lesson?.moduleId || "MOD-1",
        progressPct: pct,
        status: completed ? "COMPLETED" : "IN_PROGRESS",
        ...(score !== undefined && { quizScore: score })
      });
    } catch { 
      // Gracefully catch errors (e.g., offline or server down) and continue with localStorage fallback.
    }

    // Always save to localStorage to ensure progress is never lost
    if (completed) {
      const newSet = new Set(Array.from(completedLessons).concat([lessonId]));
      setCompletedLessons(newSet);
      localStorage.setItem(`nyaya_completed_${id}`, JSON.stringify(Array.from(newSet)));
    }
    setProgress(prev => ({ ...prev, [lessonId]: pct }));
    setSavingProgress(false);
  }, [id, allLessons, completedLessons]);

  const markComplete = async () => {
    if (!currentLessonId) return;
    await saveProgress(currentLessonId, 100, true);
    if (nextLesson) navigateTo(nextLesson.lesson.id);
  };

  const navigateTo = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    localStorage.setItem(`nyaya_last_lesson_${id}`, lessonId);
    setActiveTab("content");
    setQuizAnswers({});
    setQuizSubmitted(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuizSubmit = async () => {
    if (!currentLessonId || !currentLesson) return;
    const questions = currentLesson.lesson.quiz.questions;
    const correct = questions.filter(q => quizAnswers[q.id] === q.correctAnswer).length;
    const score = Math.round((correct / questions.length) * 100);
    setQuizScores(prev => ({ ...prev, [currentLessonId]: score }));
    setQuizSubmitted(true);
    await saveProgress(currentLessonId, 100, true, score);
  };

  const toggleBookmark = (lessonId: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading course...</p>
      </div>
    </div>
  );

  if (!course) return null;

  const lesson = currentLesson?.lesson;
  const moduleProgress = (moduleId: string) => {
    const mod = course.modules.find(m => m.id === moduleId);
    if (!mod) return 0;
    const completed = mod.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / mod.lessons.length) * 100);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 flex-shrink-0 overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-200 dark:border-white/5`}>
        <div className="p-4 border-b border-slate-200 dark:border-white/5">
          <Link href="/academy" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-950 dark:hover:text-white text-sm mb-4 transition">
            <ChevronLeft className="w-4 h-4" /> Back to Academy
          </Link>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Overall Progress</span>
              <span className="font-bold text-slate-800 dark:text-white">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-white dark:bg-slate-900/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${overallProgress === 100 ? "bg-emerald-500" : "bg-[#FF9933]"}`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{completedLessons.size}/{course.totalLessons} lessons</p>
          </div>
          {isCertificateEligible && (
            <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-300 font-semibold">Certificate Eligible!</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10">
          {course.modules.map(mod => (
            <div key={mod.id} className="mb-1">
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/50 transition border-b border-slate-100 dark:border-slate-200 dark:border-white/5"
              >
                <div className="flex items-center gap-2 text-left">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900/10 flex items-center justify-center shrink-0">
                    {moduleProgress(mod.id) === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">{moduleProgress(mod.id)}%</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white/80">{mod.title}</span>
                </div>
                {expandedModules.has(mod.id) ? (
                  <ChevronUp className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                )}
              </button>

              {expandedModules.has(mod.id) && (
                <div className="ml-2 border-l border-slate-200 dark:border-white/5 pl-2">
                  {mod.lessons.map(les => {
                    const isActive = les.id === currentLessonId;
                    const isDone = completedLessons.has(les.id);
                    return (
                      <button
                        key={les.id}
                        onClick={() => navigateTo(les.id)}
                        className={`w-full text-left px-3 py-2.5 flex items-center gap-2 rounded-lg mx-1 mb-0.5 transition-all ${ isActive ? "bg-orange-500/10 text-orange-650 dark:text-orange-400 border border-[#FF9933]/30" : "hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900/50" }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isActive ? (
                          <PlayCircle className="w-4 h-4 text-[#FF9933] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/20 shrink-0" />
                        )}
                        <span className={`text-xs leading-tight ${isActive ? "text-[#FF9933] font-semibold" : "text-slate-600 dark:text-slate-300"}`}>
                          {les.title}
                        </span>
                        {quizScores[les.id] !== undefined && (
                          <span className="ml-auto text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-md shrink-0">
                            {quizScores[les.id]}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900/10 text-slate-600 dark:text-slate-300 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {lesson && (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 truncate">
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{currentLesson?.moduleTitle}</span>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-white truncate">{lesson.title}</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {lesson && (
              <>
                <button
                  onClick={() => toggleBookmark(lesson.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900/10 text-slate-600 dark:text-slate-300 transition"
                  title="Bookmark"
                >
                  {bookmarked.has(lesson.id)
                    ? <BookmarkCheck className="w-4 h-4 text-[#FF9933]" />
                    : <Bookmark className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{lesson.readingTime}</span>
                </div>
              </>
            )}
            {savingProgress && (
              <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        {lesson && (
          <div className="flex border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0 px-4">
            {(["content", "quiz"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-semibold capitalize transition border-b-2 ${ activeTab === tab ? "border-[#FF9933] text-[#FF9933]" : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300" }`}
              >
                {tab === "content" ? <><FileText className="inline w-3 h-3 mr-1" />Reading</> : <><Brain className="inline w-3 h-3 mr-1" />Quiz ({lesson.quiz.questions.length} Q)</>}
              </button>
            ))}
            <div className="ml-auto py-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">{currentIdx + 1} / {allLessons.length} lessons</span>
            </div>
          </div>
        )}

        {/* Content area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {!lesson ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-slate-400 dark:text-slate-500">Select a lesson from the sidebar to begin</p>
              </div>
            </div>
          ) : activeTab === "content" ? (
            <ContentTab lesson={lesson} completedLessons={completedLessons} />
          ) : (
            <QuizTab
              lesson={lesson}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizSubmitted={quizSubmitted}
              onSubmit={handleQuizSubmit}
              onReset={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
              score={quizScores[lesson.id]}
            />
          )}
        </div>

        {/* Navigation footer */}
        {lesson && (
          <div className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 px-4 py-3 flex items-center gap-3 shrink-0">
            <button
              disabled={!prevLesson}
              onClick={() => prevLesson && navigateTo(prevLesson.lesson.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-slate-200 dark:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <button
              onClick={markComplete}
              disabled={completedLessons.has(lesson.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${ completedLessons.has(lesson.id) ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default" : "bg-[#FF9933] hover:bg-orange-600 text-white" }`}
            >
              {completedLessons.has(lesson.id) ? (
                <><CheckCircle2 className="w-4 h-4" /> Completed</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Mark Complete & Next</>
              )}
            </button>

            <button
              disabled={!nextLesson}
              onClick={() => nextLesson && navigateTo(nextLesson.lesson.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-slate-200 dark:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Content Tab ──────────────────────────────────────────────────────────────
function ContentTab({ lesson, completedLessons }: { lesson: Lesson; completedLessons: Set<string> }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-3">{lesson.title}</h1>
        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{lesson.content.introduction}</p>
      </div>

      {/* Key Points */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <List className="w-4 h-4" /> Key Points
        </h2>
        <ul className="space-y-3">
          {lesson.content.keyPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-650 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[#FF9933] text-xs font-bold">{i + 1}</span>
              </div>
              <span className="text-slate-800 dark:text-white/80 text-sm leading-relaxed">{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Practical Example */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">📋 Practical Example</h2>
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-2">Scenario</p>
            <p className="text-slate-800 dark:text-white/80 text-sm leading-relaxed">{lesson.content.practicalExample.scenario}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-xs font-semibold text-emerald-400 uppercase mb-2">Legal Explanation</p>
            <p className="text-slate-800 dark:text-white/80 text-sm leading-relaxed">{lesson.content.practicalExample.explanation}</p>
          </div>
        </div>
      </div>

      {/* Important Sections */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">⚖️ Important Sections</h2>
        <div className="space-y-2">
          {lesson.content.importantSections.map((sec, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/50">
              <span className="text-[#FF9933] text-xs font-bold bg-orange-500/10 text-orange-650 dark:text-orange-400 px-2 py-1 rounded-lg whitespace-nowrap">{sec.section}</span>
              <span className="text-slate-700 dark:text-slate-200 text-sm">{sec.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">❓ FAQs</h2>
        <div className="space-y-2">
          {lesson.content.faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900/50 transition"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-white/80">{faq.question}</span>
                {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />}
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-white/5 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Related Laws */}
      {lesson.content.relatedLaws.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">🔗 Related Laws</h2>
          <div className="flex flex-wrap gap-2">
            {lesson.content.relatedLaws.map((law, i) => (
              <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full text-xs text-slate-600 dark:text-slate-300">
                {law}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-amber-300 uppercase tracking-widest mb-3">📝 Lesson Summary</h2>
        <p className="text-slate-800 dark:text-white/80 text-sm leading-relaxed">{lesson.content.summary}</p>
      </div>
    </div>
  );
}

// ── Quiz Tab ─────────────────────────────────────────────────────────────────
function QuizTab({
  lesson, quizAnswers, setQuizAnswers, quizSubmitted, onSubmit, onReset, score
}: {
  lesson: Lesson;
  quizAnswers: Record<number, number>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  quizSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
  score?: number;
}) {
  const questions = lesson.quiz.questions;
  const answered = Object.keys(quizAnswers).length;
  const correct = quizSubmitted ? questions.filter(q => quizAnswers[q.id] === q.correctAnswer).length : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Knowledge Check</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">{lesson.title}</p>
        </div>
        {quizSubmitted && (
          <div className={`px-4 py-2 rounded-xl text-sm font-bold ${score !== undefined && score >= 70 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
            {score ?? 0}% — {correct}/{questions.length} correct
          </div>
        )}
      </div>

      {questions.map((q, idx) => {
        const answered2 = quizAnswers[q.id] !== undefined;
        const isCorrect = quizAnswers[q.id] === q.correctAnswer;

        return (
          <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-4">
              <span className="text-[#FF9933] mr-2">Q{idx + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                let cls = "border-slate-200 dark:border-white/10 bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-200";
                if (quizSubmitted) {
                  if (optIdx === q.correctAnswer) cls = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                  else if (optIdx === quizAnswers[q.id] && optIdx !== q.correctAnswer) cls = "border-red-500/50 bg-red-500/10 text-red-300";
                  else cls = "border-slate-200 dark:border-white/5 bg-white/3 text-slate-400 dark:text-slate-500";
                } else if (quizAnswers[q.id] === optIdx) {
                  cls = "border-[#FF9933]/50 bg-orange-500/10 text-orange-650 dark:text-orange-400 text-[#FF9933]";
                }

                return (
                  <button
                    key={optIdx}
                    disabled={quizSubmitted}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${cls} disabled:cursor-default`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${isCorrect ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                <span className="font-bold">Explanation: </span>{q.explanation}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex gap-3">
        {!quizSubmitted ? (
          <button
            disabled={answered < questions.length}
            onClick={onSubmit}
            className="flex-1 py-3 bg-[#FF9933] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition"
          >
            {answered < questions.length ? `Answer all questions (${answered}/${questions.length})` : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={onReset}
            className="flex-1 py-3 border border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </button>
        )}
      </div>
    </div>
  );
}
