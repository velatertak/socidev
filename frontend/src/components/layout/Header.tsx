import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Home, Info, Phone, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('menu-button');
      
      if (mobileMenu && menuButton && 
          !mobileMenu.contains(event.target as Node) && 
          !menuButton.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  if (!isAuthenticated) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('appName')}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="menu-button"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                {t('home')}
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                {t('about')}
              </a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                {t('contact')}
              </a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/login')}>
                {t('signIn')}
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              >
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:hidden`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">{t('menu')}</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-4">
              <a
                href="/"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('home')}
              </a>
              <a
                href="/about"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('about')}
              </a>
              <a
                href="/contact"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('contact')}
              </a>
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  {t('signIn')}
                </Button>
                <Button
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                >
                  {t('getStarted')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            id="menu-button"
            className="p-2 rounded-lg hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
          <h1 className="text-xl font-bold text-white">
            {t('appName')}
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <span className="text-white/90">{user?.email}</span>
              <Button
                variant="outline"
                onClick={logout}
                className="text-white border-white/20 hover:bg-white/10 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </>
          ) : (
            <>
              <a href="/login" className="text-white/90 hover:text-white transition-colors duration-200">
                {t('login')}
              </a>
              <a href="/register" className="text-white/90 hover:text-white transition-colors duration-200">
                {t('register')}
              </a>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
      >
        <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
      </div>
    </header>
  );
};
