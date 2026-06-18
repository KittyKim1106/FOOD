import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import Splash from './pages/Splash';
import Auth from './pages/Auth';

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

// Route order for determining navigation direction
const ROUTE_ORDER = ['/', '/login', '/home', '/swipe', '/result', '/failure', '/settings', '/history'];

function PageTransition({ children }) {
  const location = useLocation();
  const navType = useNavigationType();
  const prevPath = useRef(location.pathname);
  const [animClass, setAnimClass] = useState('');
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (prevPath.current === location.pathname) {
      setDisplayChildren(children);
      return;
    }

    const prevIndex = ROUTE_ORDER.indexOf(prevPath.current);
    const currIndex = ROUTE_ORDER.indexOf(location.pathname);
    const isBack = navType === 'POP' || (prevIndex !== -1 && currIndex !== -1 && currIndex < prevIndex);

    const exitClass = isBack ? 'page-back-exit page-back-exit-active' : 'page-exit page-exit-active';
    const enterClassStart = isBack ? 'page-back-enter' : 'page-enter';
    const enterClassActive = isBack ? 'page-back-enter-active' : 'page-enter-active';

    // Start exit animation on old content
    setAnimClass(exitClass);
    setAnimating(true);

    // After exit, swap content and enter
    timeoutRef.current = setTimeout(() => {
      setDisplayChildren(children);
      setAnimClass(enterClassStart);
      // Force reflow then activate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimClass(`${enterClassStart} ${enterClassActive}`);
        });
      });
      timeoutRef.current = setTimeout(() => {
        setAnimClass('');
        setAnimating(false);
      }, 300);
    }, 250);

    prevPath.current = location.pathname;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location.pathname, children, navType]);

  // Initial render - no animation
  useEffect(() => {
    setDisplayChildren(children);
  }, []);

  return (
    <div className={animClass} style={{ minHeight: '100dvh' }}>
      {displayChildren}
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <PageTransition key={location.pathname}>
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
    </PageTransition>
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
