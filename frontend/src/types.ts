export interface AuthResponse {
  token: string
  userId: number
  email: string
  displayName: string
  role: string
}

export interface CourseSummary {
  id: number
  slug: string
  title: string
  description: string
  category: string
  totalLessons: number
  completedLessons: number
  percentComplete: number
}

export interface CourseDetail {
  id: number
  slug: string
  title: string
  description: string
  modules: Module[]
}

export interface Module {
  id: number
  order: number
  title: string
  phase: string
  topicType: string   // "Regular" | "InterviewReady"
  lessons: LessonSummary[]
  quiz: QuizMeta | null
}

export interface LessonSummary {
  id: number
  order: number
  title: string
  estimatedMinutes: number
  completed: boolean
}

export interface QuizMeta {
  quizId: number
  title: string
  quizType: string   // "Exercise" | "Evaluation"
  questionCount: number
  passPercent: number
  bestScorePercent: number | null
  passed: boolean
}

export interface LessonAttachment {
  id: number
  fileName: string
  contentType: string
  fileSize: number
}

export interface LessonDetail {
  id: number
  title: string
  contentMarkdown: string
  estimatedMinutes: number
  completed: boolean
  moduleId: number
  moduleTitle: string
  courseSlug: string
  courseTitle: string
  prevLessonId: number | null
  nextLessonId: number | null
  attachments: LessonAttachment[]
}

export interface Quiz {
  id: number
  title: string
  passPercent: number
  moduleTitle: string
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: number
  order: number
  text: string
  options: string[]
}

export interface QuizResult {
  scorePercent: number
  passed: boolean
  correct: number
  total: number
  questions: QuestionResult[]
}

export interface QuestionResult {
  questionId: number
  correct: boolean
  correctIndex: number
  selectedIndex: number
  explanation: string
}

export interface JournalEntry {
  id: number
  entryDate: string
  niftyMove: string
  whyGuess: string
  fiiDii: string
  sectors: string
  surprise: string
  marketState: string
}

export interface ProgressSummary {
  courses: CourseSummary[]
  lessonsCompleted: number
  totalLessons: number
  quizzesPassed: number
  totalQuizzes: number
  journalEntries: number
  journalStreakDays: number
  moduleTracker: ModuleProgress[]
}

export interface ModuleProgress {
  courseTitle: string
  module: string
  phase: string
  lessonsDone: number
  lessonsTotal: number
  quizPassed: boolean
  hasQuiz: boolean
}

// ---- User Management ----
export interface AdminUser {
  id: number
  email: string
  displayName: string
  role: string
  createdAt: string
  enrollmentCount: number
}

export interface CourseEnrollment {
  courseId: number
  slug: string
  title: string
  category: string
  enrolled: boolean
}

// ---- Quiz Master ----
export interface QuizMasterSummary {
  id: number
  title: string
  quizType: string     // "Exercise" | "Evaluation"
  passPercent: number
  questionCount: number
  assignedTopicId: number | null
  assignedTopicTitle: string | null
  assignedCourseTitle: string | null
}

export interface QuizMasterDetail {
  id: number
  title: string
  quizType: string
  passPercent: number
  assignedTopicId: number | null
  assignedTopicTitle: string | null
  assignedCourseTitle: string | null
  questions: QuizQuestionDetail[]
}

export interface QuizQuestionDetail {
  id: number
  order: number
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface TopicPicker {
  id: number
  title: string
  topicType: string
  courseTitle: string
  courseId: number
}
