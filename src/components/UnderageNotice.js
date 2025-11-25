import React from 'react';

const UnderageNotice = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-600 mb-2">
            Kirin Ichiban
          </h1>
          <div className="h-1 w-32 bg-blue-600 mx-auto rounded"></div>
        </div>

        {/* Notice Icon */}
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Sorry
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          You must be 21 years or older to access this website.
        </p>
        <p className="text-gray-500 mb-8">
          This website contains information about alcoholic beverages.
          We take alcohol responsibility seriously and cannot grant access to underage visitors.
        </p>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600">
            For more information about responsible drinking, please visit:
          </p>
          <p className="text-sm text-blue-600 font-medium mt-2">
            www.responsibility.org
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderageNotice;
