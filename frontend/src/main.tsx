import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './store/theme'
import App from './App'
import Docs from './pages/Docs'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/docs' element={<Docs />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
