import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Search,
  Clock,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface CoursesPageProps {
  onSelectCourse: (courseId: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onSelectCourse, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  useEffect(() => {
    loadCourses();
  }, [category, difficulty]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getAll({
        category: category !== 'all' ? category : undefined,
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        search: search || undefined,
      });
      setCourses(res.courses);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
  };

  const categories = [
    'all',
    'Software Engineering',
    'Cloud & DevOps',
    'Product Design',
    'Artificial Intelligence',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <Badge variant="cyan" size="md" className="mb-2">
          Academic Catalogue
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Professional Course Pathways
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Comprehensive curriculum built for production capability. Complete modules, submit capstone
          code to assigned mentors, and qualify for guaranteed internship application reviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, instructor, or topic..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
          </form>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Disciplines' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading course catalogue...</div>
      ) : courses.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No courses found matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the filters to see all available tracks.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('all');
              setDifficulty('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-cyan-800 bg-cyan-50 rounded-lg hover:bg-cyan-100"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="cyan" size="sm">
                    {course.category}
                  </Badge>
                  <Badge variant="slate" size="sm">
                    {course.difficulty}
                  </Badge>
                </div>
                {course.isEnrolled && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3
                    onClick={() => onSelectCourse(course.id)}
                    className="text-base font-bold text-slate-900 leading-snug hover:text-cyan-800 transition-colors cursor-pointer"
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {course.shortDescription}
                  </p>
                </div>

                {course.isEnrolled && (
                  <div className="space-y-1.5 p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-900 font-semibold">Your Progress</span>
                      <span className="text-blue-800 font-bold">{course.progressPercent ?? 0}%</span>
                    </div>
                    <div className="w-full bg-blue-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${course.progressPercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.durationHours} Hours</span>
                  </div>

                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      course.isEnrolled
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{course.isEnrolled ? 'Resume Study' : 'View Syllabus'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
