import React, { useState } from 'react';
import Home from './components/Home';
import FormComponent from './components/FormComponent';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Kirin Ichiban</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  currentPage === 'home'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('form')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  currentPage === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Submit Entry
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'home' ? (
        <Home onNavigateToForm={() => setCurrentPage('form')} />
      ) : (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <FormComponent />
        </div>
      )}
    </div>
  );
}

export default App;
