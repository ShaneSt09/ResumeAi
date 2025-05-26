import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import Hero from '../components/Hero';
import { useStore } from '../store';

const ScrollToTop: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollPosition = window.scrollY;
        
        if (scrollPosition > 300) {
          scrollRef.current.style.opacity = '1';
          scrollRef.current.style.transform = 'translateY(0)';
        } else {
          scrollRef.current.style.opacity = '0';
          scrollRef.current.style.transform = 'translateY(20px)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={ scrollRef }
      className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer opacity-0 transition-all duration-300 transform translate-y-5 hover:bg-blue-700"
      onClick={ () => window.scrollTo({ top: 0, behavior: 'smooth' }) }
      aria-label="Scroll to top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon 
}) => (
  <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 mx-auto">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export const Home: React.FC = () => {
  const { isAuthenticated, isSubmitting } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialized, setInitialized] = React.useState(false);
  const lastPath = React.useRef(location.pathname);

  // Handle redirection based on auth status
  React.useEffect(() => {
    // Skip if we've already initialized or if we're in the middle of a navigation
    if (initialized || location.pathname !== lastPath.current) {
      lastPath.current = location.pathname;
      return;
    }
    
    const handleNavigation = () => {
      try {
        // Only redirect from login page if authenticated
        if (isAuthenticated && location.pathname === '/login') {
          console.log('User is authenticated, redirecting to /resume-builder');
          navigate('/resume-builder', { replace: true });
        } else if (!isAuthenticated) {
          // If not authenticated and trying to access protected routes, redirect to login
          const isPublicRoute = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname);
          if (!isPublicRoute) {
            console.log('Not authenticated, redirecting to login');
            navigate('/login', { 
              replace: true,
              state: { from: location.pathname }
            });
          }
        }
      } catch (error) {
        console.error('Error during navigation:', error);
      } finally {
        setInitialized(true);
      }
    };

    // Small delay to ensure auth state is stable
    const timer = setTimeout(handleNavigation, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, location.pathname, initialized]);

  // Hide React's error overlay in development
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const errorOverlay = document.querySelector('iframe');
        if (errorOverlay) {
          errorOverlay.style.display = 'none';
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading state is now handled by the initialized state
  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const features = [
    {
      title: 'AI-Powered',
      description: 'Create professional documents in minutes with our advanced AI technology.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Professional Templates',
      description: 'Choose from a variety of professionally designed templates for any industry.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: 'Easy to Use',
      description: 'Simple and intuitive interface that makes document creation a breeze.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Hero />
      
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Create Professional Documents in Minutes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={ index }
                title={ feature.title }
                description={ feature.description }
                icon={ feature.icon }
              />
            ))}
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-6">
              Start Building Your Professional Resume
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have improved their job prospects with our AI-powered resume builder.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => navigate('/register')}
                className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started for Free
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-lg border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Already have an account? Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
};

// Export default for backward compatibility
export default Home;
