import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import StudyPage from '@/pages/StudyPage'
import BrowsePage from '@/pages/BrowsePage'
import ProgressPage from '@/pages/ProgressPage'
import SettingsPage from '@/pages/SettingsPage'
// Phase 2: import DigestPage from '@/pages/DigestPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/study" replace />} />
        <Route path="study" element={<StudyPage />} />
        <Route path="study/:deckId" element={<StudyPage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Phase 2 route — uncomment when ready */}
        {/* <Route path="digest" element={<DigestPage />} /> */}
      </Route>
    </Routes>
  )
}
