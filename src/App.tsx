import './assets/css/App.css'
import { ThemeProvider } from "./components/theme-provider"
import Page from './Dashboard/página'
import ReportPage from './Dashboard/ReportPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Page />} />
          <Route path="/reportes" element={<ReportPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
 
export default App