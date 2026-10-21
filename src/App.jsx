import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import ToastProvider from './components/toast/ToastProvider'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}
