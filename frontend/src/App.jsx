import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import { JourneyProvider } from './context/JourneyContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <JourneyProvider>
        <AppRoutes />
      </JourneyProvider>
    </ThemeProvider>
  )
}

export default App
