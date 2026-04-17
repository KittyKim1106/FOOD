import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './pages/Splash';
import Auth from './pages/Auth';

// Stand-ins for phase 4
import Home from './pages/Home';
import Swipe from './pages/Swipe';
import Result from './pages/Result';
import Failure from './pages/Failure';
import Settings from './pages/Settings';
import History from './pages/History';

import { AuthProvider, useAuth } from './hooks/useAuth';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Auth />} />
      
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/swipe" element={<PrivateRoute><Swipe /></PrivateRoute>} />
      <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
      <Route path="/failure" element={<PrivateRoute><Failure /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
