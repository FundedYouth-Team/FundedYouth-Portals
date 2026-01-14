import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PublicLayout } from 'layouts/PublicLayout'
import { HomePage } from 'pages/HomePage'
import { DocsPage } from 'pages/DocsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
