import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fontsource/merriweather/700.css"; // Bold weight

const FormComponent = () => {
  const [activeTab, setActiveTab] = useState("submit");
  const [formData, setFormData] = useState({
    segment: "",
    fullName: "",
    nric: "",
    mobileNumber: "+60",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    receiptNumber: "",
    receiptDate: "",
    qnaAnswer: "",
    termsAccepted: false,
    ageConfirmed: false,
    marketingConsent: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [trackingMobileNumber, setTrackingMobileNumber] = useState("+60");
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [receiptExists, setReceiptExists] = useState(false);

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycby6jE0I_3230OxSnx5BtMezrWR3Sz1kPGYYvuJzhGLyQRJL9q90etN-pl9wkWwgsasP/exec";

  const PDF_URL = "https://drive.google.com/file/d/1B44A6eVs434zoKVr5ACAJFVFdgDDbEF0/preview";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value;

    // Remove all non-digits
    let digits = input.replace(/\D/g, '');

    // If digits start with 60, keep them; otherwise prepend 60
    if (digits.startsWith('60')) {
      digits = digits.slice(2); // Remove the 60 prefix to get user's number
    }

    // Limit to 10 digits after +60 (total 12 digits)
    if (digits.length <= 10) {
      setFormData((prev) => ({ ...prev, mobileNumber: '+60' + digits }));
    }
  };

  const handleTrackingPhoneChange = (e) => {
    let input = e.target.value;

    // Remove all non-digits
    let digits = input.replace(/\D/g, '');

    // If digits start with 60, keep them; otherwise prepend 60
    if (digits.startsWith('60')) {
      digits = digits.slice(2); // Remove the 60 prefix to get user's number
    }

    // Limit to 10 digits after +60 (total 12 digits)
    if (digits.length <= 10) {
      setTrackingMobileNumber('+60' + digits);
    }
  };

  const handleReceiptDateChange = (e) => {
    // Date input returns yyyy-mm-dd format
    setFormData((prev) => ({ ...prev, receiptDate: e.target.value }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const checkReceiptNumberExists = useCallback(
    async (receiptNumber) => {
      if (!receiptNumber || receiptNumber.trim() === "") {
        setReceiptExists(false);
        return;
      }
      try {
        const response = await fetch(
          `${GOOGLE_SCRIPT_URL}?action=checkReceiptNumber&receiptNumber=${encodeURIComponent(
            receiptNumber
          )}`
        );
        const data = await response.json();
        if (data.result === "success") {
          setReceiptExists(data.exists);
        }
      } catch (error) {
        console.error("Error checking receipt number:", error);
      }
    },
    [GOOGLE_SCRIPT_URL]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkReceiptNumberExists(formData.receiptNumber);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.receiptNumber, checkReceiptNumberExists]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.segment ||
      !formData.fullName ||
      !formData.nric ||
      formData.mobileNumber === "+60" ||
      !formData.email ||
      !formData.address1 ||
      !formData.city ||
      !formData.state ||
      !formData.postalCode ||
      !formData.receiptNumber ||
      !formData.receiptDate ||
      !formData.qnaAnswer
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (receiptExists) {
      toast.error("This receipt number has already been submitted");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a receipt image");
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    const nricRegex = /^\d{12}$/;
    if (!nricRegex.test(formData.nric)) {
      toast.error("NRIC must be 12 digits");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number format +60XXXXXXXXX (9-10 digits after +60)
    const phoneRegex = /^\+60\d{9,10}$/;
    if (!phoneRegex.test(formData.mobileNumber)) {
      toast.error("Phone number must be +60 followed by 9-10 digits");
      return;
    }

    // Validate receipt date format yyyy-mm-dd (from date input)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.receiptDate)) {
      toast.error("Please select a valid receipt date");
      return;
    }

    // Validate receipt date is a valid date
    const dateParts = formData.receiptDate.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);

    // Check year range
    if (year < 2024 || year > 2026) {
      toast.error("Receipt date must be within the promotion period");
      return;
    }

    const dateObj = new Date(year, month - 1, day);

    if (dateObj.getDate() !== day || dateObj.getMonth() !== month - 1 || dateObj.getFullYear() !== year) {
      toast.error("Please enter a valid receipt date");
      return;
    }

    // Convert to dd/mm/yyyy format for backend
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

    setLoading(true);
    try {
      const imageBase64 = await convertImageToBase64(imageFile);
      // Combine address fields
      const combinedAddress = [
        formData.address1,
        formData.address2,
        formData.city,
        formData.state,
        formData.postalCode,
      ]
        .filter((field) => field.trim() !== "")
        .join(", ");

      const submissionData = {
        segment: formData.segment,
        fullName: formData.fullName,
        nric: formData.nric,
        mobileNumber: formData.mobileNumber.replace('+', ''),
        email: formData.email,
        address: combinedAddress,
        receiptNumber: formData.receiptNumber,
        receiptDate: formattedDate,
        image: imageBase64,
        imageName: imageFile.name,
        qnaAnswer: formData.qnaAnswer,
        timestamp: new Date().toISOString(),
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      toast.success("Form submitted successfully!");
      setFormData({
        segment: "",
        fullName: "",
        nric: "",
        mobileNumber: "+60",
        email: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        receiptNumber: "",
        receiptDate: "",
        qnaAnswer: "",
        termsAccepted: false,
        ageConfirmed: false,
        marketingConsent: false,
      });
      setImageFile(null);
      setImagePreview(null);
      setReceiptExists(false);
      document.getElementById("image-upload").value = "";
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionsByMobileNumber = async (mobileNumber) => {
    if (!mobileNumber || mobileNumber === "+60") {
      toast.error("Please enter a valid mobile number");
      return;
    }
    // Validate phone number format +60XXXXXXXXX (9-10 digits after +60)
    const phoneRegex = /^\+60\d{9,10}$/;
    if (!phoneRegex.test(mobileNumber)) {
      toast.error("Phone number must be +60 followed by 9-10 digits");
      return;
    }
    setLoadingSubmissions(true);
    try {
      // Remove + sign for tracking to match stored format
      const cleanedNumber = mobileNumber.replace('+', '');
      const response = await fetch(
        `${GOOGLE_SCRIPT_URL}?action=getSubmissionsByMobileNumber&mobileNumber=${cleanedNumber}`
      );
      const data = await response.json();
      if (data.result === "success") {
        setSubmissions(data.data);
        if (data.data.length === 0) {
          toast.info("No submissions found for this mobile number");
        }
      } else {
        toast.error("Failed to fetch submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Error fetching submissions");
    } finally {
      setLoadingSubmissions(false);
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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
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

      {/* Sub Navigation */}
      <div
        style={{
          backgroundColor: "#F5F0E8",
          borderBottom: "2px solid #E5B746",
        }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 h-12 sm:h-14 lg:h-16">
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-2 py-1 sm:px-4 sm:py-2 lg:px-6 font-bold text-[10px] sm:text-sm lg:text-lg transition whitespace-nowrap`}
              style={{
                fontStyle: activeTab === "submit" ? "italic" : "normal",
                color: activeTab === "submit" ? "#000" : "#F68B1F",
              }}
            >
              SUBMIT NOW
            </button>
            <button
              onClick={() => setActiveTab("tracker")}
              className={`px-2 py-1 sm:px-4 sm:py-2 lg:px-6 font-bold text-[10px] sm:text-sm lg:text-lg transition whitespace-nowrap`}
              style={{
                fontStyle: activeTab === "tracker" ? "italic" : "normal",
                color: activeTab === "tracker" ? "#000" : "#F68B1F",
              }}
            >
              ENTRY TRACKER
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-2 py-1 sm:px-4 sm:py-2 lg:px-6 font-bold text-[10px] sm:text-sm lg:text-lg transition whitespace-nowrap`}
              style={{
                fontStyle: activeTab === "faq" ? "italic" : "normal",
                color: activeTab === "faq" ? "#000" : "#F68B1F",
              }}
            >
              FAQ
            </button>
          </div>
        </div>
      </div>

      <div
        className="max-w-4xl mx-auto px-4 py-12"
        style={{ flex: "1 0 auto" }}
      >
        {/* SUBMIT NOW TAB */}
        {activeTab === "submit" && (
          <div>
            <h1
              className="text-xl sm:text-3xl lg:text-5xl font-bold text-center mb-12"
              style={{
                fontFamily: "'Merriweather', serif",
                color: "#F68B1F",
              }}
            >
              SUBMIT
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Segment */}
              <div>
                <label
                  className="block text-sm sm:text-base font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  SEGMENT<span className="text-red-600">*</span>
                </label>
                <select
                  name="segment"
                  value={formData.segment}
                  onChange={handleInputChange}
                  required
                  className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                >
                  <option value="">Choose your segment</option>
                  <option value="Supermarket">Supermarket/Hypermarket</option>
                  <option value="Convenience Store">Convenience Store</option>
                  <option value="Ecomm(Shopee/Lazada)">
                    Ecomm(Shopee/Lazada)
                  </option>
                </select>
              </div>

              {/* Full Name and NRIC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    FULL NAME (AS PER IC)<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your Name"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    NRIC<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="nric"
                    value={formData.nric}
                    onChange={handleInputChange}
                    required
                    maxLength="12"
                    placeholder="Eg.970909145222"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    PHONE NUMBER<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handlePhoneChange}
                    required
                    placeholder="Eg. +60123456789"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    EMAIL ADDRESS<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-8">
                {/* Address Line 1 */}
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    ADDRESS<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your address"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    ADDRESS 2
                  </label>
                  <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc. (optional)"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label
                      className="block text-sm sm:text-base font-bold mb-2"
                      style={{ color: "#000" }}
                    >
                      CITY<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your city"
                      className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm sm:text-base font-bold mb-2"
                      style={{ color: "#000" }}
                    >
                      STATE/PROVINCE<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your state/province"
                      className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                    />
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    POSTAL/ZIP CODE<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your postal/zip code"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                </div>
              </div>

              {/* Receipt Number and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    RECEIPT NUMBER<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your receipt number"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  />
                  {receiptExists && (
                    <p className="mt-2 text-sm text-red-600">
                      This receipt has been submitted
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm sm:text-base font-bold mb-2"
                    style={{ color: "#000" }}
                  >
                    RECEIPT DATE<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="receiptDate"
                    value={formData.receiptDate}
                    onChange={handleReceiptDateChange}
                    required
                    min="2024-12-26"
                    max="2026-02-01"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black"
                    style={{ colorScheme: "light" }}
                  />
                </div>
              </div>

              {/* Upload Image */}
              <div>
                <label
                  className="block text-base font-bold mb-4"
                  style={{ color: "#000" }}
                >
                  PROOF OF PURCHASE<span className="text-red-600">*</span>
                </label>
                <label
                  htmlFor="image-upload"
                  className="w-full py-4 sm:py-6 flex items-center justify-center font-bold text-base sm:text-xl lg:text-2xl text-white cursor-pointer rounded-lg shadow-lg transition"
                  style={{
                    background:
                      "linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)",
                  }}
                >
                  UPLOAD IMAGE
                  <svg
                    className="w-8 h-8 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="hidden"
                />
                {imagePreview && (
                  <div className="mt-4 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-64 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition shadow-lg"
                      aria-label="Remove image"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-4"
                  style={{ color: "#000" }}
                >
                  Where does Kirin Ichiban originally come from?
                </h3>
                <div className="grid grid-cols-2 gap-4 lg:flex lg:justify-between lg:gap-0">
                  {["JAPAN", "SOUTH KOREA", "CHINA", "SINGAPORE"].map(
                    (country) => (
                      <label
                        key={country}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="qnaAnswer"
                          value={country}
                          checked={formData.qnaAnswer === country}
                          onChange={handleInputChange}
                          className="h-5 w-5 flex-shrink-0"
                          style={{ accentColor: "#E5B746" }}
                        />
                        <span className="ml-3 text-xs sm:text-sm lg:text-base font-semibold whitespace-nowrap">{country}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Terms */}
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-4"
                  style={{ color: "#000" }}
                >
                  TERMS AND CONDITIONS
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ageConfirmed}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ageConfirmed: e.target.checked,
                        }))
                      }
                      className="mt-1 h-5 w-5 rounded"
                      style={{ accentColor: "#E5B746" }}
                    />
                    <span className="ml-3 text-xs sm:text-sm">
                      <span className="text-red-600">*</span> I acknowledge that
                      I'm a non-Muslim, aged 21 and above.
                    </span>
                  </label>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          termsAccepted: e.target.checked,
                        }))
                      }
                      className="mt-1 h-5 w-5 rounded"
                    />
                    <span className="ml-3 text-xs sm:text-sm">
                      <span className="text-red-600">*</span> I agree to the{" "}
                      <a
                        href={PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href={PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          marketingConsent: e.target.checked,
                        }))
                      }
                      className="mt-1 h-5 w-5 rounded"
                    />
                    <span className="ml-3 text-xs sm:text-sm">
                      <span className="text-red-600">*</span> I consent to
                      receiving Kirin Ichiban marketing and promotional message
                      /email.
                    </span>
                  </label>
                </div>
              </div>

              {/* Question */}

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  disabled={loading || receiptExists}
                  className="px-8 sm:px-12 py-3 sm:py-4 font-bold text-base sm:text-xl lg:text-2xl text-white rounded-full shadow-lg transition disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)",
                  }}
                >
                  {loading ? "SUBMITTING..." : "SUBMIT"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ENTRY TRACKER TAB */}
        {activeTab === "tracker" && (
          <div>
            <h1
              className="text-lg sm:text-2xl lg:text-3xl font-bold text-center mb-8"
              style={{
                fontFamily: "'Merriweather', serif",
                color: "#F68B1F"
              }}
            >
              ENTER YOUR MOBILE NUMBER AND TRACK YOUR ENTRY STATUS
            </h1>
            <div className="max-w-2xl mx-auto">
              <label
                className="block text-base font-bold mb-4"
                style={{ color: "#000" }}
              >
                MOBILE NUMBER<span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={trackingMobileNumber}
                onChange={handleTrackingPhoneChange}
                placeholder="Eg. +60123456789"
                className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none text-gray-400"
                style={{ fontStyle: "italic" }}
              />
              <div className="flex justify-center mt-8">
                <button
                  onClick={() =>
                    fetchSubmissionsByMobileNumber(trackingMobileNumber)
                  }
                  disabled={loadingSubmissions}
                  className="px-8 sm:px-12 py-3 sm:py-4 font-bold text-base sm:text-xl lg:text-2xl text-white rounded-full shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)",
                  }}
                >
                  {loadingSubmissions ? "LOADING..." : "TRACK MY ENTRY"}
                </button>
              </div>

              {submissions.length > 0 && (
                <div className="mt-12 overflow-x-auto">
                  <table
                    className="min-w-full"
                    style={{ backgroundColor: "#E5B746" }}
                  >
                    <thead>
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">
                          MOBILE NUMBER
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">
                          Name
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">
                          Date of Submission
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">
                          Receipt Number
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">
                          Submission Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {submissions.map((sub, idx) => (
                        <tr key={idx}>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                            {sub.mobileNumber}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{sub.name}</td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                            {new Date(
                              sub.dateOfSubmission
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                            {sub.receiptNumber}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                            {sub.submissionStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ TAB */}
        {activeTab === "faq" && (
          <div>
            <h1
              className="text-xl sm:text-3xl lg:text-4xl font-bold text-center mb-12"
              style={{
                fontFamily: "'Merriweather', serif",
                color: "#F68B1F"
              }}
            >
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  Who can participate in this Kirin Ichiban 2026 Chinese New
                  Year promotion?{" "}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  This promotion is open to all non-Muslim residents of West
                  Malaysia aged 21 years and above. All entries must comply with
                  the official Terms & Conditions.{" "}
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  When is the contest period?{" "}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  The Kirin Ichiban 2026 Chinese New Year promotion runs from
                  26th December 2025 – 1 st February 2026.{" "}
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  How can I participate in this promotion?{" "}
                </h3>
                <div className="text-xs sm:text-sm lg:text-base text-gray-700 space-y-3">
                  <div>
                    <p className="font-semibold mb-2">
                      Mechanics / Minimum Spend:
                    </p>
                    <ul className="list-none space-y-1 ml-4">
                      <li>
                        i. Purchase a total minimum of RM88 of any Kirin Ichiban
                        products in a single receipt.
                      </li>
                      <li>
                        ii. Scan QR code to submit the receipt via Contest
                        Website.
                      </li>
                      <li>
                        iii. Stand to win Kirin Ichiban Limited-Edition Mah Jong
                        Set worth RM388 (100 winners).
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Eligible Channels:</p>
                    <ul className="list-none space-y-1 ml-4">
                      <li>i. Hypermarket / Supermarkets / MOFT</li>
                      <li>ii. Convenience Stores (CVS)</li>
                      <li>iii. E-commerce platforms (Shopee/ Lazada)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  How do I submit my receipt?{" "}
                </h3>
                <div className="text-xs sm:text-sm lg:text-base text-gray-700">
                  <ol className="list-none space-y-2">
                    <li>
                      1) Scan the QR code found on the in-store point-of-sale
                      materials or visit
                      https://kirin-promotion.tongwohgroup.com/.
                    </li>
                    <li>
                      2) Fill in the form and ensure all details are accurate.
                    </li>
                    <li>
                      3) Upload your original receipt. Please make sure the
                      proof of purchase is clear and legible for verification.
                    </li>
                  </ol>
                </div>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  Can I combine multiple receipts to participate in the
                  promotion?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  No. Each entry must be submitted using one single receipt
                  only.{" "}
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  What receipts are considered valid?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  Receipts must clearly show the store name, date, purchased
                  Kirin Ichiban products, price, and total amount. Handwritten
                  receipts, altered receipts, or unclear images will not be
                  accepted.{" "}
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  Is there a limit to how many entries I can submit throughout
                  the campaign period?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  There is no limit to the number of entries. Participants may
                  submit as many valid entries as they wish, as long as each
                  entry uses a different receipt and meets all Terms &
                  Conditions.
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  How do I check my entry status?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  Participants may check their entry status via the mobile
                  number submitted at https://kirin-promotion.tongwohgroup.com/.
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  How will I know if I am selected as a winner?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  Winners will be announced on our official social media
                  channels: Instagram @kirinichibanmy and Facebook Kirin Ichiban
                  Malaysia. Participants may also check the winners list at
                  https://kirin-promotion.tongwohgroup.com/.{" "}
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  How will the prizes be delivered?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  Winners will be contacted for delivery arrangements. Prizes
                  will be delivered only to addresses within West Malaysia.{" "}
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  Can I transfer my prize to someone else?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  No. All prizes are non-transferable, non-exchangeable, and
                  cannot be redeemed for cash or other alternatives.
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  Are there any taxes or additional fees associated with the
                  prize?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  No. The prize is not subject to additional taxes or fees.
                  Winners will receive the prize exactly as described in the
                  Terms & Conditions.
                </p>
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base lg:text-xl font-bold mb-2"
                  style={{ color: "#000" }}
                >
                  Who can I contact if I have more questions?{" "}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700">
                  For further assistance, please email us at: enquiry@twe.my
                </p>
              </div>
            </div>

            {/* Notice Section */}
            <div className="mt-12 text-center">
              <p className="text-xs sm:text-sm lg:text-base font-bold" style={{ color: "#000" }}>
                Please do not forward this promotion to individuals below the legal drinking age
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="py-6 text-center"
        style={{ backgroundColor: "#E5B746", flexShrink: 0, marginTop: "auto" }}
      >
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

export default FormComponent;
