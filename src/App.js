import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import FormComponent from './components/FormComponent';
import DateOfBirth from './components/DateOfBirth';

function App() {
  const [dobCompleted, setDobCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // Check localStorage on mount for age verification
  useEffect(() => {
    const ageVerified = localStorage.getItem('kirinAgeVerified');
    if (ageVerified === 'true') {
      setDobCompleted(true);
    }
  }, []);

  const handleDobContinue = () => {
    // Save age verification to localStorage
    localStorage.setItem('kirinAgeVerified', 'true');
    setDobCompleted(true);
  };

  if (!dobCompleted) {
    return <DateOfBirth onContinue={handleDobContinue} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      {/* Navigation Bar */}
      <nav style={{ backgroundColor: '#E5B746' }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <img src="/Logo.png" alt="Kirin Ichiban" className="h-10 sm:h-12 lg:h-16" />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 sm:space-x-4 lg:space-x-8">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-1 py-1 sm:px-4 sm:py-2 lg:px-6 font-bold text-[10px] sm:text-sm lg:text-lg transition whitespace-nowrap ${
                  currentPage === 'home'
                    ? 'text-black'
                    : 'text-white'
                }`}
              >
                HOMEPAGE
              </button>
              <button
                onClick={() => setCurrentPage('form')}
                className={`px-1 py-1 sm:px-4 sm:py-2 lg:px-6 font-bold text-[10px] sm:text-sm lg:text-lg transition whitespace-nowrap ${
                  currentPage === 'form'
                    ? 'text-black'
                    : 'text-white'
                }`}
              >
                RECEIPT SUBMISSION
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'home' ? (
        <Home onNavigateToForm={() => setCurrentPage('form')} />
      ) : (
        <FormComponent />
      )}
    </div>
  );
}

export default App;
