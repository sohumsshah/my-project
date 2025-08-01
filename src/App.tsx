import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from '@/pages/Index'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<div>Auth Page - To be implemented</div>} />
      </Routes>
    </Router>
  )
}

export default App
