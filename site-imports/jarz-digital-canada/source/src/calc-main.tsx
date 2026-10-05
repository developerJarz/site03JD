import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdsCalculatorPage from './AdsCalculatorPage'

createRoot(document.getElementById('root')!).render(<StrictMode><AdsCalculatorPage /></StrictMode>)
