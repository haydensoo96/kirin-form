import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = ({ onNavigateToForm }) => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace this with your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuGP2d-UqG6pxqrScREnvfhF4d-s7QAzl-96itpFRfCbPLopyNxc3ojgA-DuA6GmAJ/exec';

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getWinners`);
      const data = await response.json();

      if (data.result === 'success') {
        setWinners(data.data);
      } else {
        toast.error('Failed to fetch winners');
      }
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast.error('Error fetching winners');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundImage: 'url(/Background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#F5F0E8'
    }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Hero Section */}
      <div className="relative w-full">
        <img
          src="/HomepagePoster.png"
          alt="Kirin Ichiban Promotion"
          className="w-full h-auto"
          style={{ display: 'block' }}
        />
      </div>

      {/* Lorem Ipsum Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-6" style={{
          fontFamily: 'cursive',
          color: '#000'
        }}>
          LOREM IPSUM
        </h2>
        <p className="text-lg mb-4" style={{ color: '#E5B746' }}>
          LOREM IPSUM
        </p>
        <p className="text-base leading-relaxed" style={{ color: '#000' }}>
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip
        </p>
      </div>

      {/* Video Section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{
          backgroundColor: '#9B3D3D',
          padding: '15px'
        }}>
          <div className="bg-black rounded-lg" style={{
            paddingBottom: '56.25%',
            position: 'relative'
          }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition">
                <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Winner List Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-5xl font-bold text-center mb-12" style={{
          fontFamily: 'cursive',
          color: '#000'
        }}>
          WINNER LIST
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg
              className="animate-spin h-10 w-10"
              style={{ color: '#E5B746' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-medium" style={{ color: '#000' }}>
              Winners will be released soon
            </p>
            <p className="text-gray-600 mt-2">
              Stay tuned for the announcement!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {winners.slice(0, 6).map((winner, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white border-4 flex items-center justify-center mr-4 shadow-lg" style={{ borderColor: '#E5B746' }}>
                  <span className="text-3xl font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 py-4 px-6 rounded-lg shadow-md" style={{
                  background: 'linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)'
                }}>
                  <p className="text-white font-semibold text-lg">{winner.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center" style={{ backgroundColor: '#E5B746' }}>
        <p className="text-black font-bold">
          TERMS & CONDITION APPLIES  •  PRIVACY POLICY
        </p>
      </div>
    </div>
  );
};

export default Home;
