import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import MyDocuments from './pages/MyDocuments';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import { useStore } from './store';
import './styles/global.css';
import './styles/App.css';

// A component to handle auth state initialization
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkAuth, isSubmitting: isLoading, isAuthenticated } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [initialAuthCheck, setInitialAuthCheck] = React.useState(true);
  const hasCheckedAuth = React.useRef(false);

  // Initialize auth state
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } finally {
        setInitialAuthCheck(false);
        hasCheckedAuth.current = true;
      }
    };
    
    initializeAuth();
  }, [checkAuth]);

  // Handle redirects after auth check
  useEffect(() => {
    // Skip if still checking auth
    if (initialAuthCheck) return;
    
    const publicPaths = ['/', '/login', '/unauthorized'];
    const isPublicPath = publicPaths.includes(location.pathname);
    
    if (isAuthenticated) {
      // If on login page but authenticated, redirect to home
      if (location.pathname === '/login') {
        navigate('/', { replace: true });
      }
    } else if (!isPublicPath) {
      // If not authenticated and not on a public path, redirect to login
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, location.pathname, initialAuthCheck, navigate]);

  // Show loading state only during initial auth check
  if (initialAuthCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

// A wrapper component to handle the app layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 w-full overflow-x-hidden">
    <Navbar />
    <main className="flex-grow w-full">
      <div className="w-full">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <AuthInitializer>
        <AppLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={ <Home /> } />
            <Route path="/login" element={ <Login /> } />
            <Route path="/unauthorized" element={ <div>Unauthorized</div> } />
            
            {/* Protected routes */}
            <Route element={ <ProtectedRoute /> }>
              <Route path="/resume-builder" element={ <ResumeBuilder /> } />
              <Route 
                path="/cover-letter" 
                element={
                  (<div className="text-center py-12 w-full">
                    Coming Soon: Cover Letter Builder
                  </div>)
                } 
              />
              <Route 
                path="/portfolio" 
                element={
                  (<div className="text-center py-12 w-full">
                    Coming Soon: Portfolio Builder
                  </div>)
                } 
              />
              <Route 
                path="/my-documents" 
                element={<MyDocuments />} 
              />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={ <Navigate to="/" replace /> } />
          </Routes>
        </AppLayout>
      </AuthInitializer>
    </Router>
  );
}

export default App;
