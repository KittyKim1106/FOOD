import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import Splash from './pages/Splash';
import Auth from './pages/Auth';

import Home from './pages/Home';
import Swipe from './pages/Swipe';
import Result from './pages/Result';
import Failure from './pages/Failure';
import Settings from './pages/Settings';
import History from './pages/History';

import { AuthProvider } from './hooks/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { pageVariants } from './lib/motion';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Route order for determining navigation direction
const reducedPageVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const navType = useNavigationType();
  const shouldReduceMotion = useReducedMotion();
  const isBack = navType === 'POP';

  return (
    <AnimatePresence mode="wait" initial={false} custom={isBack}>
      <Motion.div
        key={location.pathname}
        custom={isBack}
        variants={shouldReduceMotion ? reducedPageVariants : pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        style={{ minHeight: '100dvh' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/swipe" element={<PrivateRoute><Swipe /></PrivateRoute>} />
          <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
          <Route path="/failure" element={<PrivateRoute><Failure /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        </Routes>
      </Motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  return <AnimatedRoutes />;
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
