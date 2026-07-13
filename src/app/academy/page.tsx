"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Award, Search, PlayCircle, 
  CheckCircle2, Clock, Star, Scale, Shield, 
  Users, Briefcase, Monitor, FileSearch, 
  Car, HeartHandshake, BookMarked,
  BrainCircuit, FileText, Activity, AlertCircle,
  Calendar, Brain, Filter, ChevronRight, LayoutGrid, List
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  lessons: number;
  rating: number;
  progress: number;
  image: string;
  icon: React.ElementType;
  difficulty: Difficulty;
  keyPoints: string[];
  readingTime: string;
  examplesCount: number;
  quizzesCount: number;
}

const gradients = [
  "bg-gradient-to-br from-indigo-500 to-blue-600",
  "bg-gradient-to-br from-red-500 to-rose-600",
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-emerald-500 to-green-600",
  "bg-gradient-to-br from-teal-500 to-emerald-600",
  "bg-gradient-to-br from-pink-500 to-rose-500",
  "bg-gradient-to-br from-blue-500 to-cyan-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-sky-500 to-blue-500",
  "bg-gradient-to-br from-yellow-500 to-orange-500",
  "bg-gradient-to-br from-fuchsia-500 to-pink-600",
];

const icons = [BookMarked, Scale, Shield, FileSearch, HeartHandshake, BookOpen, Users, Briefcase, Monitor, FileText, Car, Shield];

export default function LearningAcademyPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [continueCourse, setContinueCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<{id: string, label: string}[]>([{ id: "all", label: "All Modules" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await apiClient.get("/academy/progress", { redirectOnAuthError: false });
        if (res.success && res.data) {
          localStorage.setItem("academy_progress", JSON.stringify(res.data));
          return res.data;
        }
        throw new Error("Invalid response");
      } catch (err) {
        try {
          const stored = localStorage.getItem("academy_progress");
          if (stored) return JSON.parse(stored);
        } catch (e) {
          // Ignore parse errors
        }
        return [];
      }
    };

    const fetchCourses = async () => {
      try {
        const res = await apiClient.get("/academy/courses");
        if (res.success && res.data) {
          return res.data;
        }
        return [];
      } catch (err) {
        return [];
      }
    };

    Promise.all([fetchCourses(), fetchProgress()])
      .then(([coursesList, progressData]) => {
        if (coursesList.length > 0) {
          const apiCourses = coursesList.map((c: any, index: number) => {
            const courseCompleted = progressData.filter((p: any) => p.courseId === c.id && p.completed).length;
            const progress = c.lessons > 0 ? Math.round((courseCompleted / c.lessons) * 100) : 0;
            
            return {
              id: c.id,
              title: c.title,
              category: c.category || "General", 
              duration: c.duration || "1 hour",
              lessons: c.lessons || 0,
              rating: c.rating || "5.0",
              progress: progress,
              image: c.thumbnail_url || gradients[index % gradients.length],
              icon: icons[index % icons.length] || BookOpen,
              difficulty: c.difficulty || "Beginner",
              keyPoints: c.keyPoints || [],
              readingTime: c.readingTime || "15 mins",
              examplesCount: c.examplesCount || 0,
              quizzesCount: c.quizzesCount || 0
            };
          });
          
          setCourses(apiCourses);
          
          const inProgressCourses = apiCourses.filter((c: Course) => c.progress > 0 && c.progress < 100);
          if (inProgressCourses.length > 0) {
            inProgressCourses.sort((a: Course, b: Course) => b.progress - a.progress);
            setContinueCourse(inProgressCourses[0]);
          }
          
          const uniqueCategories = Array.from(new Set(apiCourses.map((c: Course) => c.category)));
          const dynamicCategories = [
            { id: "all", label: "All Modules" },
            ...uniqueCategories.map(cat => ({
              id: cat as string,
              label: cat as string
            }))
          ];
          setCategories(dynamicCategories);
        } else {
          setError("No courses are currently available. Please check back later.");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err);
        setError("Unable to load the learning academy. Please check your connection and try again.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCourses = courses.filter(c => 
    (activeTab === "all" || c.category === activeTab) &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Award className="w-8 h-8 text-[#FF9933]" />
              Legal Learning Academy
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
              Master Indian law with interactive courses, structured modules, practical examples, and progress tracking.
            </p>
          </div>
          
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 lg:w-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white dark:focus:bg-slate-950"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center mb-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">We encountered an issue</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-[#FF9933] text-white font-medium rounded-lg hover:bg-[#e68a2e] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}

        {/* Continue Learning Widget */}
        {!error && !isLoading && continueCourse && (
          <div className="mb-10 premium-card p-6 flex flex-col md:flex-row items-center gap-6">
            <div className={`w-16 h-16 rounded-xl ${continueCourse.image} flex items-center justify-center shrink-0`}>
              <continueCourse.icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-grow w-full">
              <h2 className="text-sm font-semibold text-[#FF9933] uppercase tracking-wider mb-1">Continue Learning</h2>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{continueCourse.title}</h3>
              <div className="flex items-center gap-4">
                <div className="flex-grow h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF9933] rounded-full transition-all duration-500" 
                    style={{ width: `${continueCourse.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{continueCourse.progress}% Completed</span>
              </div>
            </div>
            <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <Link
                href={`/academy/course/${continueCourse.id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF9933] text-white font-medium hover:bg-[#e68a2e] transition-colors w-full md:w-auto"
              >
                <PlayCircle className="w-5 h-5" /> Resume Course
              </Link>
            </div>
          </div>
        )}

        {!error && !isLoading && categories.length > 1 && (
          <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${ activeTab === cat.id ? "bg-[#FF9933] text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800" }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !error && (
          <>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} className="premium-card premium-card-hover group flex flex-col h-full overflow-hidden">
                    <div className={`h-36 ${course.image} relative p-5 flex items-end shrink-0`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <course.icon className="absolute top-4 right-4 w-6 h-6 text-white/90" />
                      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md text-xs text-white font-medium border border-white/10">
                        {course.difficulty}
                      </div>
                      <h3 className="relative text-white font-bold text-lg leading-tight group-hover:text-[#FF9933] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-600 dark:text-slate-400 mb-5">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {course.duration}</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {course.lessons} lessons</span>
                        <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {course.readingTime}</span>
                        <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-current" /> {course.rating}</span>
                      </div>

                      <div className="mb-5">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">Key Points</h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                          {course.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span className="leading-tight">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6 mt-auto">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>{course.examplesCount} Examples</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <BrainCircuit className="w-4 h-4 text-purple-500" />
                          <span>{course.quizzesCount} Quizzes</span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {/* Progress Bar */}
                        <div className="mb-5">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Progress</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{course.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-[#FF9933]'}`} 
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          href={`/academy/course/${course.id}`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          {course.progress === 100 ? (
                            <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Review Module</>
                          ) : course.progress > 0 ? (
                            <><PlayCircle className="w-4 h-4 text-[#FF9933]" /> Continue Learning</>
                          ) : (
                            <><PlayCircle className="w-4 h-4" /> Start Module</>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="premium-card text-center py-16">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No courses found</h3>
                <p className="text-slate-500 dark:text-slate-400">We couldn&apos;t find any courses matching your search criteria.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-[#FF9933] hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
