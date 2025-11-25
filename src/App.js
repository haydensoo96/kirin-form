import React, { useState } from 'react';
import Home from './components/Home';
import FormComponent from './components/FormComponent';
import AgeVerification from './components/AgeVerification';
import UnderageNotice from './components/UnderageNotice';
import DateOfBirth from './components/DateOfBirth';

function App() {
  const [ageVerified, setAgeVerified] = useState(null);
  const [dobCompleted, setDobCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const handleAgeVerification = (isOver21) => {
    setAgeVerified(isOver21);
  };

  const handleDobContinue = () => {
    setDobCompleted(true);
  };

  if (ageVerified === null) {
    return <AgeVerification onVerify={handleAgeVerification} />;
  }

  if (ageVerified === false) {
    return <UnderageNotice />;
  }

  if (!dobCompleted) {
    return <DateOfBirth onContinue={handleDobContinue} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      {/* Navigation Bar */}
      <nav style={{ backgroundColor: '#E5B746' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/Logo.png" alt="Kirin Ichiban" className="h-16" />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-6 py-2 font-bold text-lg transition ${
                  currentPage === 'home'
                    ? 'text-black'
                    : 'text-white'
                }`}
              >
                HOMEPAGE
              </button>
              <button
                onClick={() => setCurrentPage('form')}
                className={`px-6 py-2 font-bold text-lg transition ${
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
