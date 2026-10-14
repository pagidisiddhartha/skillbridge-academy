import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { authenticate, optionalAuthenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { Course, CourseModule, Lesson, QuizAttempt } from '../types.js';

const router = Router();

// GET /api/courses - List courses with filters
router.get('/', optionalAuthenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { category, difficulty, search } = req.query;
  const isAdmin = req.user?.role === 'admin';

  const courses = db.getCourses({
    category: category ? String(category) : undefined,
    difficulty: difficulty ? String(difficulty) : undefined,
    search: search ? String(search) : undefined,
    publishedOnly: !isAdmin,
  });

  // Attach enrollment status if user is authenticated student
  if (req.user && req.user.role === 'student') {
    const enrollments = db.getEnrollments(req.user.id);
    const enriched = courses.map((c) => {
      const enr = enrollments.find((e) => e.courseId === c.id);
      return {
        ...c,
        isEnrolled: !!enr,
        progressPercent: enr ? enr.progressPercent : 0,
      };
    });
    res.json({ courses: enriched });
    return;
  }

  res.json({ courses });
});

// GET /api/courses/:id - Course details with curriculum
router.get('/:id', optionalAuthenticate, (req: AuthenticatedRequest, res: Response): void => {
  const course = db.getCourseById(req.params.id, true);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  // If course is draft and user is not admin, deny
  if (!course.published && req.user?.role !== 'admin') {
    res.status(403).json({ error: 'This course is currently in draft mode.' });
    return;
  }

  let userEnrollment = null;
  let lessonProgressList: any[] = [];

  if (req.user && req.user.role === 'student') {
    userEnrollment = db.getEnrollment(req.user.id, course.id);
    if (userEnrollment) {
      lessonProgressList = db.getLessonProgress(req.user.id, course.id);
    }
  }

  res.json({
    course,
    enrollment: userEnrollment,
    lessonProgress: lessonProgressList,
  });
});

// POST /api/courses - Admin create course
router.post('/', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      difficulty,
      instructor,
      thumbnail,
      durationHours,
      learningOutcomes,
      prerequisites,
      published,
      featured,
    } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ error: 'Title, description, and category are required.' });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      description,
      shortDescription: shortDescription || description.slice(0, 140) + '...',
      category,
      difficulty: difficulty || 'Intermediate',
      instructor: instructor || req.user!.name,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      durationHours: Number(durationHours) || 30,
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      published: published ?? true,
      featured: featured ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createCourse(newCourse);
    db.addAuditLog(req.user!.id, req.user!.email, 'COURSE_CREATED', 'Course', newCourse.id, `Created course "${newCourse.title}"`, req.ip);

    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create course' });
  }
});

// PUT /api/courses/:id - Admin update course
router.put('/:id', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  db.addAuditLog(req.user!.id, req.user!.email, 'COURSE_UPDATED', 'Course', updated.id, `Updated course "${updated.title}"`, req.ip);
  res.json({ message: 'Course updated successfully', course: updated });
});

// DELETE /api/courses/:id - Admin delete course
router.delete('/:id', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const success = db.deleteCourse(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  db.addAuditLog(req.user!.id, req.user!.email, 'COURSE_DELETED', 'Course', req.params.id, `Deleted course ${req.params.id}`, req.ip);
  res.json({ message: 'Course deleted successfully' });
});

// POST /api/courses/:id/enroll - Student enroll in course
router.post('/:id', authenticate, requireRole('student'), (req: AuthenticatedRequest, res: Response): void => {
  const course = db.getCourseById(req.params.id, false);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const enrollment = db.enrollUser(req.user!.id, course.id);
  db.addAuditLog(req.user!.id, req.user!.email, 'COURSE_ENROLLED', 'Enrollment', enrollment.id, `Enrolled in "${course.title}"`, req.ip);

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: req.user!.id,
    title: 'Enrolled Successfully!',
    message: `You are now enrolled in "${course.title}". Start with Module 1 lessons!`,
    read: false,
    link: `/courses/${course.id}`,
    createdAt: new Date().toISOString(),
  });

  res.json({ message: 'Successfully enrolled in course', enrollment });
});

// POST /api/courses/:id/lessons/:lessonId/complete - Toggle lesson completion
router.post('/:id/lessons/:lessonId/complete', authenticate, requireRole('student'), (req: AuthenticatedRequest, res: Response): void => {
  const { completed } = req.body;
  const isCompleted = typeof completed === 'boolean' ? completed : true;

  const result = db.toggleLessonProgress(req.user!.id, req.params.id, req.params.lessonId, isCompleted);
  res.json({
    message: isCompleted ? 'Lesson marked complete' : 'Lesson marked incomplete',
    ...result,
  });
});

// POST /api/lessons/:id/quiz - Submit quiz answers
router.post('/lessons/:id/quiz', authenticate, requireRole('student'), (req: AuthenticatedRequest, res: Response): void => {
  const lesson = db.getLessonById(req.params.id);
  if (!lesson || !lesson.quiz) {
    res.status(404).json({ error: 'Quiz not found for this lesson' });
    return;
  }

  const { answers } = req.body; // array of chosen option indices
  if (!Array.isArray(answers)) {
    res.status(400).json({ error: 'Answers array is required' });
    return;
  }

  const questions = lesson.quiz.questions;
  let correctCount = 0;
  const feedback = questions.map((q, idx) => {
    const chosen = answers[idx];
    const isCorrect = chosen === q.correctAnswerIndex;
    if (isCorrect) correctCount += 1;
    return {
      questionId: q.id,
      question: q.question,
      chosen,
      correctIndex: q.correctAnswerIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= lesson.quiz.passingScorePercent;

  const attempt: QuizAttempt = {
    id: `attempt-${Date.now()}`,
    userId: req.user!.id,
    lessonId: lesson.id,
    courseId: lesson.courseId,
    scorePercent,
    passed,
    answers,
    attemptedAt: new Date().toISOString(),
  };

  db.recordQuizAttempt(attempt);

  // If passed, automatically mark lesson complete!
  if (passed) {
    db.toggleLessonProgress(req.user!.id, lesson.courseId, lesson.id, true);
  }

  res.json({
    scorePercent,
    passed,
    passingScorePercent: lesson.quiz.passingScorePercent,
    feedback,
    attempt,
  });
});

// POST /api/courses/:id/modules - Admin create module
router.post('/:id/modules', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { title, description, orderIndex } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Module title is required' });
    return;
  }

  const newModule: CourseModule = {
    id: `mod-${Date.now()}`,
    courseId: req.params.id,
    title,
    description: description || '',
    orderIndex: Number(orderIndex) || 1,
  };

  db.createModule(newModule);
  res.status(201).json({ message: 'Module created successfully', module: newModule });
});

// POST /api/courses/:id/lessons - Admin create lesson
router.post('/:id/lessons', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { moduleId, title, type, durationMinutes, content, videoUrl, orderIndex, quiz } = req.body;
  if (!moduleId || !title || !content) {
    res.status(400).json({ error: 'Module ID, title, and content are required' });
    return;
  }

  const newLesson: Lesson = {
    id: `lesson-${Date.now()}`,
    moduleId,
    courseId: req.params.id,
    title,
    type: type || 'text',
    durationMinutes: Number(durationMinutes) || 15,
    orderIndex: Number(orderIndex) || 1,
    content,
    videoUrl,
    quiz,
  };

  db.createLesson(newLesson);
  res.status(201).json({ message: 'Lesson created successfully', lesson: newLesson });
});

// DELETE /api/courses/lessons/:id - Admin delete lesson
router.delete('/lessons/:id', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const success = db.deleteLesson(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }
  res.json({ message: 'Lesson deleted successfully' });
});

export default router;
