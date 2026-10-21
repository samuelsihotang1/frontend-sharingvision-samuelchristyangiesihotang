import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import AddArticlePage from './pages/AddArticlePage'
import AllPostsPage from './pages/AllPostsPage'
import EditArticlePage from './pages/EditArticlePage'
import NotFoundPage from './pages/NotFoundPage'
import PreviewArticlePage from './pages/PreviewArticlePage'
import PreviewPage from './pages/PreviewPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<AllPostsPage />} />
        <Route path="add" element={<AddArticlePage />} />
        <Route path="edit/:id" element={<EditArticlePage />} />
        <Route path="preview" element={<PreviewPage />} />
        <Route path="preview/:id" element={<PreviewArticlePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
