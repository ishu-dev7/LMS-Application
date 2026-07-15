import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import QuizPage from './pages/QuizPage'
import JournalPage from './pages/JournalPage'
import ProgressPage from './pages/ProgressPage'
import AdminPage from './pages/AdminPage'
import QuizMasterPage from './pages/QuizMasterPage'
import UserManagementPage from './pages/UserManagementPage'
import TrainingPage from './pages/TrainingPage'
import type { ReactElement } from 'react'

function Protected({ children }: { children: ReactElement }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/courses/:slug" element={<Protected><CoursePage /></Protected>} />
      <Route path="/lessons/:id" element={<Protected><LessonPage /></Protected>} />
      <Route path="/quiz/:quizId" element={<Protected><QuizPage /></Protected>} />
      <Route path="/journal" element={<Protected><JournalPage /></Protected>} />
      <Route path="/progress" element={<Protected><ProgressPage /></Protected>} />
      <Route path="/admin" element={<Protected><AdminPage /></Protected>} />
      <Route path="/admin/quiz-master" element={<Protected><QuizMasterPage /></Protected>} />
      <Route path="/admin/users" element={<Protected><UserManagementPage /></Protected>} />
      <Route path="/training" element={<Protected><TrainingPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
