import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import StudyPage from '@/pages/StudyPage'
import BrowsePage from '@/pages/BrowsePage'
import ProgressPage from '@/pages/ProgressPage'
import SettingsPage from '@/pages/SettingsPage'
import CreateDeckPage from '@/pages/CreateDeckPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/study" replace />} />
        <Route path="study" element={<StudyPage />} />
        <Route path="study/:deckId" element={<StudyPage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="browse/create" element={<CreateDeckPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
