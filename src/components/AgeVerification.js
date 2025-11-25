import React from 'react';

const AgeVerification = ({ onVerify }) => {
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
            TELL US US YOUR AGE TO CONTINUE
          </h2>
        </div>

        {/* Row 3: Terms and Conditions */}
        <div className="text-center mb-8 px-4">
          <p className="text-sm md:text-base leading-relaxed mb-2" style={{ color: '#000' }}>
            Kirin Ichiban is committed to responsible drinking.
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-2" style={{ color: '#000' }}>
            Which is why we need to ensure that you are above the legal drinking age
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-2" style={{ color: '#000' }}>
            and that you are legally permitted to view this site in the country you are in.
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-2" style={{ color: '#000' }}>
            This content is intended for those of legal drinking age,
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-2" style={{ color: '#000' }}>
            please do not share or forward to anyone underage.
          </p>
          <p className="text-sm md:text-base leading-relaxed font-semibold" style={{ color: '#000' }}>
            Please verify your age to continue.
          </p>
        </div>

        {/* Row 4: Age Verification Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
          <button
            onClick={() => onVerify(true)}
            className="px-8 py-3 font-bold text-lg rounded-full border-3 transition duration-200 hover:bg-black hover:text-white"
            style={{
              backgroundColor: 'transparent',
              border: '3px solid #000',
              color: '#000'
            }}
          >
            YES I AM OVER 21
          </button>
          <button
            onClick={() => onVerify(false)}
            className="px-8 py-3 font-bold text-lg rounded-full border-3 transition duration-200 hover:bg-black hover:text-white"
            style={{
              backgroundColor: 'transparent',
              border: '3px solid #000',
              color: '#000'
            }}
          >
            NO I AM OVER 21
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
