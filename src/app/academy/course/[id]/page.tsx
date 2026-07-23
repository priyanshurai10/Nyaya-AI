'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Award,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Scale,
} from 'lucide-react';

interface CourseDetail {
  id: string;
  title: string;
  statute: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    duration: string;
    content: string;
    keyTakeaways: string[];
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const coursesData: Record<string, CourseDetail> = {
  'bns-2023': {
    id: 'bns-2023',
    title: 'Bharatiya Nyaya Sanhita (BNS) 2023 Overview',
    statute: 'Bharatiya Nyaya Sanhita Act 2023 (Replaced IPC 1860)',
    description: 'A complete overview of India\'s newly enacted criminal code under BNS 2023.',
    lessons: [
      {
        id: 'l1',
        title: 'Lesson 1: Introduction to BNS & Key Differences from IPC',
        duration: '10 mins',
        content: 'BNS replaces the 163-year-old Indian Penal Code (IPC 1860). It contains 358 Sections compared to 511 in the IPC. Offences against women, children, and organized crime have been prioritized with stricter penalties.',
        keyTakeaways: [
          '358 total sections replacing 511 IPC sections',
          'Community service introduced as a official criminal punishment',
          'Snatching defined as a distinct offence under Section 304 BNS'
        ]
      },
      {
        id: 'l2',
        title: 'Lesson 2: Section 304 BNS - Offence of Snatching',
        duration: '15 mins',
        content: 'Unlike the old IPC where snatching was prosecuted under general theft or robbery, Section 304 BNS specifically penalizes snatching of gold chains, mobile phones, or purses with imprisonment up to 3 years and fine.',
        keyTakeaways: [
          'Snatching is now a specific non-bailable offence',
          'Covers chain snatching and mobile theft with force',
          'Maximum punishment up to 3 years rigorous imprisonment'
        ]
      },
      {
        id: 'l3',
        title: 'Lesson 3: Offences Against Women & Children (BNS Sec 63-99)',
        duration: '20 mins',
        content: 'Sections 63 to 99 govern sexual offences, domestic violence, and cruelty. Section 69 penalizes deceitful promises to marry or false identities used for sexual relationships.',
        keyTakeaways: [
          'Section 69: Sexual intercourse by deceitful means penalized with up to 10 years imprisonment',
          'Gangrape of minors penalised with life imprisonment or death penalty',
          'Identity concealment prior to marriage specifically recognized'
        ]
      }
    ],
    quiz: [
      {
        question: 'Which old act was replaced by the Bharatiya Nyaya Sanhita (BNS) 2023?',
        options: [
          'Indian Evidence Act 1872',
          'Indian Penal Code (IPC) 1860',
          'Code of Criminal Procedure (CrPC) 1973',
          'Consumer Protection Act 1986'
        ],
        correctIndex: 1,
        explanation: 'BNS 2023 replaced the Indian Penal Code (IPC 1860).'
      },
      {
        question: 'Under which Section of BNS is snatching explicitly defined as a distinct offence?',
        options: ['Section 304', 'Section 103', 'Section 69', 'Section 111'],
        correctIndex: 0,
        explanation: 'Section 304 BNS explicitly defines and penalizes chain/mobile snatching.'
      }
    ]
  },
  'bnss-2023': {
    id: 'bnss-2023',
    title: 'Bharatiya Nagarik Suraksha Sanhita (BNSS) & Bail Rights',
    statute: 'Bharatiya Nagarik Suraksha Sanhita Act 2023 (Replaced CrPC 1973)',
    description: 'Guide to criminal procedure, zero FIR, police custody, and bail rules under BNSS 2023.',
    lessons: [
      {
        id: 'l1',
        title: 'Lesson 1: Zero FIR & Electronic FIR Filing',
        duration: '15 mins',
        content: 'Under BNSS Section 173, any citizen can lodge an FIR at ANY police station regardless of jurisdiction (Zero FIR). The police station must register it and transfer it to the concerned station.',
        keyTakeaways: [
          'Zero FIR can be filed at any police station in India',
          'E-FIR is recognized for specified offences',
          'Preliminary inquiry mandated within 14 days for offences punishable by 3-7 years'
        ]
      },
      {
        id: 'l2',
        title: 'Lesson 2: Section 479 BNSS - Maximum Period of Custody & First-Time Offender Bail',
        duration: '20 mins',
        content: 'Under BNSS Section 479, a first-time undertrial prisoner who has served one-third of the maximum sentence prescribed for the offence MUST be released on bail by the court.',
        keyTakeaways: [
          'First-time offenders eligible for mandatory bail after 1/3rd sentence served',
          'Other undertrials eligible after serving 1/2 of maximum sentence',
          'Superintendent of Jail must apply for bail on behalf of undertrial'
        ]
      }
    ],
    quiz: [
      {
        question: 'Under Section 479 BNSS, after what fraction of the maximum sentence must a first-time undertrial prisoner be released on bail?',
        options: ['1/2 of maximum sentence', '1/3 of maximum sentence', '2/3 of maximum sentence', 'Full maximum sentence'],
        correctIndex: 1,
        explanation: 'BNSS Section 479 mandates bail for first-time undertrials after 1/3rd sentence served.'
      }
    ]
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = (params.id as string) || 'bns-2023';

  // Fallback if course id is not in pre-populated object
  const course = coursesData[courseId] || coursesData['bns-2023'];

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const currentLesson = course.lessons[activeLessonIndex] || course.lessons[0];

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    if (submittedQuiz) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    course.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)] font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <Link href="/academy" className="inline-flex items-center gap-2 text-xs font-bold text-[#FF9933] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Legal Academy
        </Link>

        {/* Course Header */}
        <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-3 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 text-xs font-bold border border-sky-500/20">
            <GraduationCap className="w-3.5 h-3.5" /> Interactive Course
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {course.title}
          </h1>
          <p className="text-xs font-bold text-[#FF9933]">
            {course.statute}
          </p>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson Navigation Sidebar */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-muted)] px-1">
              Course Modules ({course.lessons.length})
            </h3>
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonIndex(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    activeLessonIndex === idx
                      ? 'bg-[#FF9933]/15 border-[#FF9933] text-[var(--text-primary)] font-bold shadow-sm'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--card-elevated)]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${ activeLessonIndex === idx ? 'bg-[#FF9933] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }`}>
                      {idx + 1}
                    </div>
                    <span className="text-xs truncate">{lesson.title}</span>
                  </div>
                  <span className="text-[10px] opacity-70 shrink-0">{lesson.duration}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Viewer & Quiz */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Lesson Content */}
            <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
              <div className="border-b border-[var(--border)] pb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                  {currentLesson.title}
                </h2>
                <span className="text-xs text-sky-500 font-semibold">{currentLesson.duration}</span>
              </div>

              <div className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed space-y-4">
                <p>{currentLesson.content}</p>
              </div>

              {/* Key Takeaways */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] space-y-2">
                <h4 className="text-xs font-bold text-[#FF9933] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Key Takeaways
                </h4>
                <ul className="space-y-1 text-xs text-[var(--text-muted)]">
                  {currentLesson.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quiz Section */}
            {course.quiz.length > 0 && (
              <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#FF9933]" /> Module Knowledge Quiz
                  </h3>
                  {submittedQuiz && (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Score: {calculateScore()} / {course.quiz.length}
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {course.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--border)]">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[qIdx] === oIdx;
                          const isCorrect = q.correctIndex === oIdx;
                          let btnClass = 'bg-[var(--card)] border-[var(--border)] text-[var(--text-primary)]';

                          if (submittedQuiz) {
                            if (isCorrect) btnClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold';
                            else if (isSelected && !isCorrect) btnClass = 'bg-rose-500/15 border-rose-500 text-rose-500';
                          } else if (isSelected) {
                            btnClass = 'bg-[#FF9933]/15 border-[#FF9933] text-[#FF9933] font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(qIdx, oIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {submittedQuiz && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          💡 <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {!submittedQuiz ? (
                    <button
                      onClick={() => setSubmittedQuiz(true)}
                      disabled={Object.keys(quizAnswers).length !== course.quiz.length}
                      className="px-6 py-2.5 bg-[#FF9933] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSubmittedQuiz(false); setQuizAnswers({}); }}
                      className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
