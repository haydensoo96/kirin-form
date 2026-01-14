import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fontsource/merriweather/700.css"; // Bold weight
import "@fontsource/merriweather/900.css"; // Black weight

const Home = ({ onNavigateToForm }) => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace this with your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbx7XhpVc1_9jeNsg-sDi7wb5n_dw0Pah8Eu6fK1Zt8Pv0eZCWN5PneqZfBfbrO3r5uE/exec";

  const PDF_URL = "https://drive.google.com/file/d/1B44A6eVs434zoKVr5ACAJFVFdgDDbEF0/preview";

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getWinners`);
      const data = await response.json();

      if (data.result === "success") {
        setWinners(data.data);
      } else {
        toast.error("Failed to fetch winners");
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
      toast.error("Error fetching winners");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url(/Background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#F5F0E8",
      }}
    >
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
          style={{ display: "block" }}
        />
      </div>

      {/* Lorem Ipsum Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Receipt Submission Button */}
        <div className="mb-8">
          <button
            onClick={onNavigateToForm}
            className="px-8 sm:px-12 py-3 sm:py-4 font-bold text-base sm:text-xl lg:text-2xl text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)",
            }}
          >
            RECEIPT SUBMISSION
          </button>
        </div>

        <h2
          className="text-xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 lg:whitespace-nowrap"
          style={{
            fontFamily: "'Merriweather', serif",
            color: "#F68B1F",
            fontWeight: 900,
          }}
        >
          PROSPERITY BEGINS WITH <span className="whitespace-nowrap">KIRIN ICHIBAN</span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg mb-4 leading-tight" style={{ color: "#E5B746" }}>
          Celebrate meaningful moments with a chance to win our 
          Limited-Edition Kirin Ichiban Mah Jong Set.
        </p>
        <p className="text-xs sm:text-sm lg:text-base leading-relaxed" style={{ color: "#000" }}>
          Step into the festive season with a celebration made for togetherness.
          This Chinese New Year, let Kirin Ichiban be the taste that completes
          your reunions, your celebrations, and the moments that matter most.
          Stand to win our Limited-Edition Kirin Ichiban Mah Jong Sets — a
          festive symbol of tradition and togetherness.
        </p>
      </div>

      {/* Video Section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div
          className="relative overflow-hidden"
          style={{
            paddingBottom: "56.25%",
            position: "relative",
          }}
        >
          <iframe
            src="https://drive.google.com/file/d/1CxYdqSN2sNLmgCjXsaS4dh2XvohtQ4bJ/preview"
            className="absolute top-0 left-0 w-full h-full"
            allow="autoplay"
            title="Kirin Ichiban Promotion Video"
          />
        </div>
      </div>

      {/* Winner List Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2
          className="text-xl sm:text-3xl lg:text-5xl font-bold text-center mb-12"
          style={{
            fontFamily: "'Merriweather', serif",
            color: "#F68B1F",
          }}
        >
          CONGRATULATIONS TO OUR WINNERS!
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg
              className="animate-spin h-10 w-10"
              style={{ color: "#E5B746" }}
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
            <p className="text-base sm:text-lg lg:text-xl font-medium" style={{ color: "#000" }}>
              Winners will be released soon
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-2">
              Stay tuned for the announcement!
            </p>
          </div>
        ) : (
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)",
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white">
                WINNER LIST
              </h2>
            </div>

            {/* Content */}
            <div
              style={{
                backgroundColor: "#F5F0E8",
                padding: "24px 16px",
                minHeight: "400px",
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 max-w-[1200px] mx-auto">
                {winners.map((winner, idx) => (
                  <div
                    key={idx}
                    className="font-bold text-xs sm:text-sm lg:text-base text-center"
                    style={{
                      color: "#000",
                    }}
                  >
                    {winner.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center" style={{ backgroundColor: "#E5B746" }}>
        <p className="text-black font-bold text-[10px] sm:text-sm lg:text-base">
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            TERMS & CONDITION APPLIES
          </a>{" "}
          •{" "}
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            PRIVACY POLICY
          </a>
        </p>
      </div>
    </div>
  );
};

export default Home;
