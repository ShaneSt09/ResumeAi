import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useStore } from '../store';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Navigation items - Commenting out unused sections for now to focus on resume builder
  const navItems = [
    { name: 'My Documents', path: '/my-documents', protected: true },
    { name: 'Resume Builder', path: '/resume-builder', protected: true },
    // { name: 'Cover Letter', path: '/cover-letter', protected: true },
    // { name: 'Portfolio', path: '/portfolio', protected: true },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              ResumeAI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              // Skip protected routes if not authenticated
              if (item.protected && !isAuthenticated) return null;
              
              return (
                <Link
                  key={ item.path }
                  to={ item.path }
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={ () => setIsMenuOpen(false) }
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Hello, {user?.name || 'User'}
                </span>
                <Button
                  onClick={ handleLogout }
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={ () => navigate('/login') }
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Login
                </Button>
                <Button
                  onClick={ () => navigate('/login?register=true') }
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={ toggleMenu }
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => {
              // Skip protected routes if not authenticated
              if (item.protected && !isAuthenticated) return null;
              
              return (
                <Link
                  key={ item.path }
                  to={ item.path }
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={ () => setIsMenuOpen(false) }
                >
                  {item.name}
                </Link>
              );
            })}
            
            <div className="pt-4 pb-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center px-3 py-2">
                    <div className="text-sm font-medium text-gray-700">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={ handleLogout }
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={ () => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    } }
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={ () => {
                      navigate('/login?register=true');
                      setIsMenuOpen(false);
                    } }
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Export default for backward compatibility
export default Navbar;
