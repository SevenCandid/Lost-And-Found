import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MainLayout } from './layouts/MainLayout'

// Pages
import { SplashPage } from './pages/SplashPage'
import { WelcomePage } from './pages/WelcomePage'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { ReportPage } from './pages/ReportPage'
import { ItemDetailsPage } from './pages/ItemDetailsPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminPage } from './pages/AdminPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ChatListPage } from './pages/ChatListPage'
import { ChatRoomPage } from './pages/ChatRoomPage'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { PendingVerificationPage } from './pages/auth/PendingVerificationPage'
import { AdminAuthPage } from './pages/auth/AdminAuthPage'

import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'rounded-full font-medium shadow-float',
          style: {
            background: '#ffffff',
            color: '#0f172a',
          }
        }}
      />
      <Routes>
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending" element={<PendingVerificationPage />} />
        <Route path="/admin/auth" element={<AdminAuthPage />} />
        
        {/* Main app layout with bottom navigation */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute requireVerified>
                <ReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <ChatListPage />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Detail pages without bottom navigation */}
        <Route path="/item/:id" element={<ItemDetailsPage />} />
        <Route 
          path="/chat/:id" 
          element={
            <ProtectedRoute>
              <ChatRoomPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
