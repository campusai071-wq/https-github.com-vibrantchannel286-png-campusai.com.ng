import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Award, Info, Brain, TrendingUp, Sparkles, 
  CheckCircle2, Target, BookOpen, Clock, 
  GraduationCap, FileText, Plus, Trash2, RefreshCw, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { analyzeCGPA } from '../services/premiumToolsService';

interface Course {
  id: string;
  code: string;
  units: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

interface CGPACalculatorProps {
  user?: any;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export const CGPACalculator: React.FC<CGPACalculatorProps> = ({ user }) => {
  const [scale, setScale] = useState<5 | 4>(5);
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: 'sem-1',
      name: 'Year 1 - First Semester',
      courses: [
        { id: 'c-1', code: 'GST111', units: 2, grade: 'A' },
        { id: 'c-2', code: 'MTH101', units: 3, grade: 'B' },
        { id: 'c-3', code: 'CHM101', units: 3, grade: 'A' },
        { id: 'c-4', code: 'PHY101', units: 3, grade: 'C' }
      ]
    }
  ]);

  const [activeSemesterId, setActiveSemesterId] = useState<string>('sem-1');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newSemName, setNewSemName] = useState('');

  // Grade point mapping
  const getGradePoint = (grade: string, currentScale: 5 | 4) => {
    const g = grade.toUpperCase();
    if (currentScale === 5) {
      if (g === 'A') return 5;
      if (g === 'B') return 4;
      if (g === 'C') return 3;
      if (g === 'D') return 2;
      if (g === 'E') return 1;
      return 0;
    } else {
      if (g === 'A') return 4;
      if (g === 'B') return 3;
      if (g === 'C') return 2;
      if (g === 'D') return 1;
      return 0;
    }
  };

  // Add semester
  const addSemester = () => {
    if (!newSemName.trim()) return;
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      name: newSemName.trim(),
      courses: []
    };
    setSemesters([...semesters, newSem]);
    setActiveSemesterId(newSem.id);
    setNewSemName('');
  };

  // Delete semester
  const deleteSemester = (semId: string) => {
    if (semesters.length <= 1) return;
    const updated = semesters.filter(s => s.id !== semId);
    setSemesters(updated);
    setActiveSemesterId(updated[0].id);
  };

  // Add course to active semester
  const addCourse = (semId: string) => {
    const updated = semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          courses: [
            ...sem.courses,
            { id: `c-${Date.now()}`, code: `CSC${100 + sem.courses.length + 1}`, units: 3, grade: 'A' as const }
          ]
        };
      }
      return sem;
    });
    setSemesters(updated);
  };

  // Update course
  const updateCourse = (semId: string, courseId: string, field: keyof Course, value: any) => {
    const updated = semesters.map(sem => {
      if (sem.id === semId) {
        const courses = sem.courses.map(c => {
          if (c.id === courseId) {
            return { ...c, [field]: value };
          }
          return c;
        });
        return { ...sem, courses };
      }
      return sem;
    });
    setSemesters(updated);
  };

  // Delete course
  const deleteCourse = (semId: string, courseId: string) => {
    const updated = semesters.map(sem => {
      if (sem.id === semId) {
        return { ...sem, courses: sem.courses.filter(c => c.id !== courseId) };
      }
      return sem;
    });
    setSemesters(updated);
  };

  // Calculations
  const calculateSemesterStats = (courses: Course[]) => {
    let totalUnits = 0;
    let totalPoints = 0;
    courses.forEach(c => {
      const units = Number(c.units) || 0;
      const gp = getGradePoint(c.grade, scale);
      totalUnits += units;
      totalPoints += units * gp;
    });
    const gpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
    return { totalUnits, totalPoints, gpa: Number(gpa) };
  };

  // Cumulative calculation
  const totalCumulativeUnits = semesters.reduce((acc, sem) => acc + calculateSemesterStats(sem.courses).totalUnits, 0);
  const totalCumulativePoints = semesters.reduce((acc, sem) => acc + calculateSemesterStats(sem.courses).totalPoints, 0);
  const cumulativeCGPA = totalCumulativeUnits > 0 ? (totalCumulativePoints / totalCumulativeUnits).toFixed(2) : '0.00';

  // Degree classification
  const getDegreeClass = (cgpaNum: number, currentScale: 5 | 4) => {
    if (currentScale === 5) {
      if (cgpaNum >= 4.50) return { title: 'First Class Honours', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' };
      if (cgpaNum >= 3.50) return { title: 'Second Class Upper (2.1)', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200' };
      if (cgpaNum >= 2.40) return { title: 'Second Class Lower (2.2)', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200' };
      if (cgpaNum >= 1.50) return { title: 'Third Class Honours', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200' };
      if (cgpaNum >= 1.00) return { title: 'Pass Degree', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200' };
      return { title: 'Academic Probation / Fail', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200' };
    } else {
      if (cgpaNum >= 3.50) return { title: 'First Class Honours', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' };
      if (cgpaNum >= 3.00) return { title: 'Second Class Upper (2.1)', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200' };
      if (cgpaNum >= 2.00) return { title: 'Second Class Lower (2.2)', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200' };
      if (cgpaNum >= 1.50) return { title: 'Third Class Honours', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200' };
      if (cgpaNum >= 1.00) return { title: 'Pass Degree', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200' };
      return { title: 'Academic Probation / Fail', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200' };
    }
  };

  const currentHonours = getDegreeClass(Number(cumulativeCGPA), scale);

  // Trigger AI Trajectory Analysis
  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const summaryText = semesters.map(s => {
        const stats = calculateSemesterStats(s.courses);
        const courseList = s.courses.map(c => `${c.code}(Units:${c.units}, Grade:${c.grade})`).join(', ');
        return `${s.name}: GPA ${stats.gpa}, Units: ${stats.totalUnits}. Courses: [${courseList}]`;
      }).join('\n');

      const advice = await analyzeCGPA(
        Number(cumulativeCGPA),
        summaryText,
        user?.role || 'University Student',
        user?.institution || 'Nigerian University',
        user?.course || 'Tertiary Programme'
      );
      setAiAnalysis(advice);
    } catch (e: any) {
      setAiAnalysis("Keep up consistent effort in core departmental courses and aim for straight A's in high-unit practicals.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeSemester = semesters.find(s => s.id === activeSemesterId) || semesters[0];
  const activeStats = calculateSemesterStats(activeSemester?.courses || []);

  return (
    <section id="cgpa" className="py-16 bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden min-h-[85vh]">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-800">
                <Calculator size={12} />
                Live Academic Studio Active
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                CGPA <span className="text-purple-600 dark:text-purple-400">Analytics</span> Studio
              </h2>
              <p className="text-gray-500 dark:text-slate-300 font-medium text-base max-w-xl">
                Official Multi-Semester Academic Grade Diagnostic & Degree Honours Forecaster for Nigerian Tertiary Institutions.
              </p>
            </div>

            {/* Scale toggle */}
            <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
              <button 
                onClick={() => setScale(5)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scale === 5 ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                NUC 5.0 Scale
              </button>
              <button 
                onClick={() => setScale(4)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scale === 4 ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                NUC 4.0 Scale
              </button>
            </div>
          </div>

          {/* MAIN DASHBOARD STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cumulative CGPA Card */}
            <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-purple-200">Cumulative CGPA</span>
                  <GraduationCap size={24} className="text-purple-300" />
                </div>
                <div className="text-6xl font-black tracking-tight mb-2">
                  {cumulativeCGPA} <span className="text-2xl font-bold opacity-60">/ {scale}.0</span>
                </div>
                <div className="text-xs text-purple-200 font-medium">
                  Across {semesters.length} recorded semester(s) • {totalCumulativeUnits} total units
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Honours Standing</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white`}>
                  {currentHonours.title}
                </span>
              </div>
            </div>

            {/* Active Semester Stats Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Active Semester ({activeSemester?.name})</span>
                  <Clock size={20} className="text-purple-600" />
                </div>
                <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                  {activeStats.gpa} <span className="text-xl font-bold text-gray-400">/ {scale}.0</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-300 font-medium">
                  {activeStats.totalUnits} Units Registered • {activeSemester?.courses.length || 0} Courses
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Semester Points</span>
                <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                  {activeStats.totalPoints} Grade Points
                </span>
              </div>
            </div>

            {/* AI Advisor Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> AI Trajectory Advisor
                  </span>
                  <Brain size={20} className="text-purple-600" />
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-3">
                  {aiAnalysis || "Click below to run an instant AI diagnostic on your course grades and get actionable study strategies."}
                </p>
              </div>

              <button
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Brain size={16} />}
                <span>{isAnalyzing ? 'Analyzing Grades...' : 'Run AI Academic Diagnostic'}</span>
              </button>
            </div>

          </div>

          {/* SEMESTER TAB SELECTOR & MANAGER */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                {semesters.map(sem => (
                  <button
                    key={sem.id}
                    onClick={() => setActiveSemesterId(sem.id)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeSemesterId === sem.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'}`}
                  >
                    <span>{sem.name}</span>
                    <span className="px-2 py-0.5 bg-black/20 rounded-full text-[10px]">
                      {calculateSemesterStats(sem.courses).gpa}
                    </span>
                  </button>
                ))}
              </div>

              {/* Add semester input */}
              <div className="flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="e.g. Year 2 - 1st Sem"
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 font-medium outline-none focus:border-purple-500"
                />
                <button
                  onClick={addSemester}
                  className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-gray-800"
                >
                  <Plus size={16} /> Add Sem
                </button>
              </div>
            </div>

            {/* ACTIVE SEMESTER COURSE TABLE */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {activeSemester?.name} Courses
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-300 font-medium">
                    Enter your course code, credit units (1-6), and letter grade for each course.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {semesters.length > 1 && (
                    <button
                      onClick={() => deleteSemester(activeSemester.id)}
                      className="px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete Semester
                    </button>
                  )}
                  <button
                    onClick={() => addCourse(activeSemester.id)}
                    className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1.5 border border-purple-200 dark:border-purple-800"
                  >
                    <Plus size={16} /> Add Course
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase text-[10px] font-black tracking-wider">
                      <th className="pb-3 pl-2">Course Code</th>
                      <th className="pb-3">Credit Units</th>
                      <th className="pb-3">Letter Grade</th>
                      <th className="pb-3">Grade Point</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-medium text-gray-800 dark:text-gray-200">
                    {activeSemester?.courses.map((course) => {
                      const gp = getGradePoint(course.grade, scale);
                      return (
                        <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition-colors">
                          <td className="py-3 pl-2">
                            <input
                              type="text"
                              value={course.code}
                              onChange={(e) => updateCourse(activeSemester.id, course.id, 'code', e.target.value.toUpperCase())}
                              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs uppercase w-32 outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                              placeholder="e.g. GNS101"
                            />
                          </td>
                          <td className="py-3">
                            <select
                              value={course.units}
                              onChange={(e) => updateCourse(activeSemester.id, course.id, 'units', Number(e.target.value))}
                              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                            >
                              {[1, 2, 3, 4, 5, 6].map(u => (
                                <option key={u} value={u}>{u} Unit{u > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3">
                            <select
                              value={course.grade}
                              onChange={(e) => updateCourse(activeSemester.id, course.id, 'grade', e.target.value)}
                              className="px-4 py-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl font-black text-xs text-purple-600 dark:text-purple-400 outline-none"
                            >
                              <option value="A">A ( {scale === 5 ? '5' : '4'} pts )</option>
                              <option value="B">B ( {scale === 5 ? '4' : '3'} pts )</option>
                              <option value="C">C ( {scale === 5 ? '3' : '2'} pts )</option>
                              <option value="D">D ( {scale === 5 ? '2' : '1'} pts )</option>
                              {scale === 5 && <option value="E">E ( 1 pt )</option>}
                              <option value="F">F ( 0 pts )</option>
                            </select>
                          </td>
                          <td className="py-3 font-bold text-gray-600 dark:text-gray-400">
                            {gp * Number(course.units)} pts ({gp}.0)
                          </td>
                          <td className="py-3 text-right pr-2">
                            <button
                              onClick={() => deleteCourse(activeSemester.id, course.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {activeSemester?.courses.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No courses added to this semester yet. Click "Add Course" above to begin.
                </div>
              )}
            </div>

          </div>

          {/* OFFICIAL NUC GRADING SCALE REFERENCE TABLES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="text-purple-600" size={22} />
                  Official NUC Grading Scale & Class Reference
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-300 font-medium mt-0.5">
                  Standard grade point equivalents for Nigerian university transcripts ({scale === 5 ? '5.0 System' : '4.0 System'}).
                </p>
              </div>

              <span className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                NUC Standardized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Grade Point Table */}
              <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-purple-600" /> Letter Grade & Score Percentages
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-wider">
                        <th className="pb-3">Mark (%)</th>
                        <th className="pb-3">Grade</th>
                        <th className="pb-3">Point Value ({scale}.0 Scale)</th>
                        <th className="pb-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-bold text-gray-700 dark:text-gray-200">
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">70% - 100%</td>
                        <td className="py-3 font-black text-sm text-green-600 dark:text-green-400">A</td>
                        <td className="py-3">{scale === 5 ? 5.0 : 4.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Excellent</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">60% - 69%</td>
                        <td className="py-3 font-black text-sm text-blue-600 dark:text-blue-400">B</td>
                        <td className="py-3">{scale === 5 ? 4.0 : 3.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Very Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">50% - 59%</td>
                        <td className="py-3 font-black text-sm text-amber-600 dark:text-amber-400">C</td>
                        <td className="py-3">{scale === 5 ? 3.0 : 2.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">45% - 49%</td>
                        <td className="py-3 font-black text-sm text-orange-600 dark:text-orange-400">D</td>
                        <td className="py-3">{scale === 5 ? 2.0 : 1.0}</td>
                        <td className="py-3 font-semibold text-gray-500">Fair / Pass</td>
                      </tr>
                      {scale === 5 && (
                        <tr>
                          <td className="py-3 text-purple-600 dark:text-purple-400">40% - 44%</td>
                          <td className="py-3 font-black text-sm text-gray-600 dark:text-slate-300">E</td>
                          <td className="py-3">1.0</td>
                          <td className="py-3 font-semibold text-gray-500">Pass</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400">0% - {scale === 5 ? '39%' : '44%'}</td>
                        <td className="py-3 font-black text-sm text-red-600 dark:text-red-400">F</td>
                        <td className="py-3">0.0</td>
                        <td className="py-3 font-semibold text-gray-500">Fail</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Class of Degree Table */}
              <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" /> Honours Class Distinction Bounds
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-wider">
                        <th className="pb-3">Class Distinction</th>
                        <th className="pb-3">CGPA Range ({scale}.0)</th>
                        <th className="pb-3">Academic Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-bold text-gray-700 dark:text-gray-200">
                      <tr>
                        <td className="py-3 text-amber-600 dark:text-amber-400 font-black">First Class Honours</td>
                        <td className="py-3">{scale === 5 ? '4.50 – 5.00' : '3.50 – 4.00'}</td>
                        <td className="py-3 font-semibold text-green-600 dark:text-green-400">Distinction</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-blue-600 dark:text-blue-400 font-black">Second Class Upper (2.1)</td>
                        <td className="py-3">{scale === 5 ? '3.50 – 4.49' : '3.00 – 3.49'}</td>
                        <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">Very Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-purple-600 dark:text-purple-400 font-black">Second Class Lower (2.2)</td>
                        <td className="py-3">{scale === 5 ? '2.40 – 3.49' : '2.00 – 2.99'}</td>
                        <td className="py-3 font-semibold text-purple-600 dark:text-purple-400">Good</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-600 dark:text-slate-300 font-black">Third Class Honours</td>
                        <td className="py-3">{scale === 5 ? '1.50 – 2.39' : '1.50 – 1.99'}</td>
                        <td className="py-3 font-semibold text-gray-500">Satisfactory</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 font-black">Pass Degree</td>
                        <td className="py-3">{scale === 5 ? '1.00 – 1.49' : '1.00 – 1.49'}</td>
                        <td className="py-3 font-semibold text-gray-400">Minimum Pass</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CGPACalculator;
