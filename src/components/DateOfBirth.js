import React, { useState, useRef } from 'react';

const DateOfBirth = ({ onContinue }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const handleDayChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setDay(value);
      setError('');
      // Auto-advance to month when 2 digits entered
      if (value.length === 2) {
        monthRef.current?.focus();
      }
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setMonth(value);
      setError('');
      // Auto-advance to year when 2 digits entered
      if (value.length === 2) {
        yearRef.current?.focus();
      }
    }
  };

  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setYear(value);
      setError('');
    }
  };

  const handleContinue = () => {
    // Validate inputs
    if (!day || !month || !year) {
      setError('Please enter your complete date of birth');
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Basic validation
    if (dayNum < 1 || dayNum > 31) {
      setError('Please enter a valid day (1-31)');
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      setError('Please enter a valid month (1-12)');
      return;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Please enter a valid year');
      return;
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 21) {
      setError('You must be 21 years or older to continue');
      return;
    }

    onContinue();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      backgroundColor: '#F5F0E8',
      backgroundImage: 'url(/Background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="max-w-3xl w-full relative z-10">
        {/* Row 1: Logo */}
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="Kirin Ichiban" className="h-32 md:h-40 mx-auto" />
        </div>

        {/* Row 2: Age Verification Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#000' }}>
            TELL US YOUR AGE TO CONTINUE
          </h2>
        </div>

        {/* Row 3: Terms and Conditions */}
        <div className="text-center mb-8 px-4">
          <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#000' }}>
            Kirin Ichiban is committed to<br />responsible drinking.
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#000' }}>
            Which is why we need to ensure that you are<br />above the legal drinking age
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#000' }}>
            and that you are legally permitted to view this<br />site in the country you are in.
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#000' }}>
            This content is intended for those of<br />legal drinking age,
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: '#000' }}>
            please do not share or forward to<br />anyone underage.
          </p>
          <p className="text-sm md:text-base leading-relaxed font-semibold" style={{ color: '#000' }}>
            Please verify your age to continue.
          </p>
        </div>

        {/* Row 4: Date Input Fields */}
        <div className="flex justify-center items-center gap-4 mb-6 px-4">
          <div className="w-24">
            <input
              ref={dayRef}
              type="text"
              inputMode="numeric"
              placeholder="DD"
              value={day}
              onChange={handleDayChange}
              maxLength="2"
              className="w-full h-24 text-center text-3xl font-bold rounded-lg focus:outline-none focus:border-black transition"
              style={{
                backgroundColor: '#FFF',
                border: '3px solid #000',
                color: '#000'
              }}
            />
          </div>
          <div className="w-24">
            <input
              ref={monthRef}
              type="text"
              inputMode="numeric"
              placeholder="MM"
              value={month}
              onChange={handleMonthChange}
              maxLength="2"
              className="w-full h-24 text-center text-3xl font-bold rounded-lg focus:outline-none focus:border-black transition"
              style={{
                backgroundColor: '#FFF',
                border: '3px solid #000',
                color: '#000'
              }}
            />
          </div>
          <div className="w-32">
            <input
              ref={yearRef}
              type="text"
              inputMode="numeric"
              placeholder="YYYY"
              value={year}
              onChange={handleYearChange}
              maxLength="4"
              className="w-full h-24 text-center text-3xl font-bold rounded-lg focus:outline-none focus:border-black transition"
              style={{
                backgroundColor: '#FFF',
                border: '3px solid #000',
                color: '#000'
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-center text-sm font-medium mb-4">
            {error}
          </p>
        )}

        {/* Row 5: Continue Button */}
        <div className="flex justify-center px-4">
          <button
            onClick={handleContinue}
            className="px-12 py-3 font-bold text-lg rounded-full transition duration-200 hover:bg-black hover:text-white"
            style={{
              backgroundColor: 'transparent',
              border: '3px solid #000',
              color: '#000'
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateOfBirth;
