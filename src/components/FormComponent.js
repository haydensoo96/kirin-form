import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FormComponent = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [formData, setFormData] = useState({
    segment: '',
    fullName: '',
    nric: '',
    mobileNumber: '',
    email: '',
    address: '',
    receiptNumber: '',
    receiptDate: '',
    qnaAnswer: '',
    termsAccepted: false,
    ageConfirmed: false,
    marketingConsent: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [trackingMobileNumber, setTrackingMobileNumber] = useState('');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [receiptExists, setReceiptExists] = useState(false);

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuGP2d-UqG6pxqrScREnvfhF4d-s7QAzl-96itpFRfCbPLopyNxc3ojgA-DuA6GmAJ/exec';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
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

  const checkReceiptNumberExists = useCallback(async (receiptNumber) => {
    if (!receiptNumber || receiptNumber.trim() === '') {
      setReceiptExists(false);
      return;
    }
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkReceiptNumber&receiptNumber=${encodeURIComponent(receiptNumber)}`);
      const data = await response.json();
      if (data.result === 'success') {
        setReceiptExists(data.exists);
      }
    } catch (error) {
      console.error('Error checking receipt number:', error);
    }
  }, [GOOGLE_SCRIPT_URL]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkReceiptNumberExists(formData.receiptNumber);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.receiptNumber, checkReceiptNumberExists]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.segment || !formData.fullName || !formData.nric || !formData.mobileNumber ||
        !formData.email || !formData.address || !formData.receiptNumber || !formData.receiptDate || !formData.qnaAnswer) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (receiptExists) {
      toast.error('This receipt number has already been submitted');
      return;
    }

    if (!imageFile) {
      toast.error('Please upload a receipt image');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    const nricRegex = /^\d{12}$/;
    if (!nricRegex.test(formData.nric)) {
      toast.error('NRIC must be 12 digits');
      return;
    }

    if (formData.mobileNumber.length > 12) {
      toast.error('Mobile number cannot exceed 12 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const imageBase64 = await convertImageToBase64(imageFile);
      const submissionData = {
        segment: formData.segment,
        fullName: formData.fullName,
        nric: formData.nric,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        address: formData.address,
        receiptNumber: formData.receiptNumber,
        receiptDate: formData.receiptDate,
        image: imageBase64,
        imageName: imageFile.name,
        qnaAnswer: formData.qnaAnswer,
        timestamp: new Date().toISOString()
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      toast.success('Form submitted successfully!');
      setFormData({
        segment: '',
        fullName: '',
        nric: '',
        mobileNumber: '',
        email: '',
        address: '',
        receiptNumber: '',
        receiptDate: '',
        qnaAnswer: '',
        termsAccepted: false,
        ageConfirmed: false,
        marketingConsent: false
      });
      setImageFile(null);
      setImagePreview(null);
      setReceiptExists(false);
      document.getElementById('image-upload').value = '';
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionsByMobileNumber = async (mobileNumber) => {
    if (!mobileNumber || mobileNumber.length > 11) {
      toast.error('Please enter a valid mobile number (max 11 digits)');
      return;
    }
    setLoadingSubmissions(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getSubmissionsByMobileNumber&mobileNumber=${mobileNumber}`);
      const data = await response.json();
      if (data.result === 'success') {
        setSubmissions(data.data);
        if (data.data.length === 0) {
          toast.info('No submissions found for this mobile number');
        }
      } else {
        toast.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Error fetching submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  return (
    <div style={{
      backgroundImage: 'url(/Background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#F5F0E8',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
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

      {/* Sub Navigation */}
      <div style={{ backgroundColor: '#F5F0E8', borderBottom: '2px solid #E5B746' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 h-16">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-2 font-bold text-lg transition ${
                activeTab === 'submit' ? 'text-black' : 'text-gray-400'
              }`}
              style={{ fontStyle: activeTab === 'submit' ? 'italic' : 'normal' }}
            >
              SUBMIT NOW
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-6 py-2 font-bold text-lg transition ${
                activeTab === 'tracker' ? 'text-black' : 'text-gray-400'
              }`}
              style={{ fontStyle: activeTab === 'tracker' ? 'italic' : 'normal' }}
            >
              ENTRY TRACKER
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-2 font-bold text-lg transition ${
                activeTab === 'faq' ? 'text-black' : 'text-gray-400'
              }`}
              style={{ fontStyle: activeTab === 'faq' ? 'italic' : 'normal' }}
            >
              FAQ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12" style={{ flex: '1 0 auto' }}>
        {/* SUBMIT NOW TAB */}
        {activeTab === 'submit' && (
          <div>
            <h1 className="text-5xl font-bold text-center mb-12" style={{
              fontFamily: 'BebasNeue, Arial, sans-serif',
              color: '#E5B746'
            }}>
              SUBMIT RECEIPT
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Segment */}
              <div>
                <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
                  SEGMENT<span className="text-red-600">*</span>
                </label>
                <select
                  name="segment"
                  value={formData.segment}
                  onChange={handleInputChange}
                  required
                  className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  style={{ fontStyle: 'italic' }}
                >
                  <option value="">Choose your segment</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Convenience Store">Convenience Store</option>
                  <option value="Ecomm(Shopee/Lazada)">Ecomm(Shopee/Lazada)</option>
                </select>
              </div>

              {/* Full Name and NRIC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
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
                    style={{ fontStyle: 'italic' }}
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
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
                    style={{ fontStyle: 'italic' }}
                  />
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
                    PHONE NUMBER<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                    maxLength="12"
                    placeholder="Eg. +60 123 456 7890"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                    style={{ fontStyle: 'italic' }}
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
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
                    style={{ fontStyle: 'italic' }}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
                  ADDRESS<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your address"
                  className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                  style={{ fontStyle: 'italic' }}
                />
              </div>

              {/* Receipt Number and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
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
                    style={{ fontStyle: 'italic' }}
                  />
                  {receiptExists && (
                    <p className="mt-2 text-sm text-red-600">This receipt has been submitted</p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: '#000' }}>
                    RECEIPT DATE<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiptDate"
                    value={formData.receiptDate}
                    onChange={handleInputChange}
                    required
                    placeholder="dd/mm/yyy"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none focus:border-b-2 focus:border-black text-gray-400"
                    style={{ fontStyle: 'italic' }}
                  />
                </div>
              </div>

              {/* Upload Image */}
              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#000' }}>
                  PROOF OF PURCHASE<span className="text-red-600">*</span>
                </label>
                <label
                  htmlFor="image-upload"
                  className="w-full py-6 flex items-center justify-center font-bold text-2xl text-white cursor-pointer rounded-lg shadow-lg transition"
                  style={{
                    background: 'linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)'
                  }}
                >
                  UPLOAD IMAGE
                  <svg className="w-8 h-8 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="max-w-full h-auto max-h-64 rounded-md" />
                  </div>
                )}
              </div>

              {/* Terms */}
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#000' }}>TERMS AND CONDITIONS</h3>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ageConfirmed}
                      onChange={(e) => setFormData(prev => ({ ...prev, ageConfirmed: e.target.checked }))}
                      className="mt-1 h-5 w-5 rounded"
                      style={{ accentColor: '#E5B746' }}
                    />
                    <span className="ml-3 text-sm">
                      <span className="text-red-600">*</span> I acknowledge that I'm a non-Muslim, aged 21 and above.
                    </span>
                  </label>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      className="mt-1 h-5 w-5 rounded"
                    />
                    <span className="ml-3 text-sm">
                      <span className="text-red-600">*</span> I agree to the <u>Terms & Conditions</u> and <u>Privacy Policy</u>.
                    </span>
                  </label>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) => setFormData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                      className="mt-1 h-5 w-5 rounded"
                    />
                    <span className="ml-3 text-sm">
                      <span className="text-red-600">*</span> I consent to receiving Kirin Ichiban marketing and promotional message /email.
                    </span>
                  </label>
                </div>
              </div>

              {/* Question */}
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#000' }}>QUESTION ABOUT KIRIN ICHIBAN</h3>
                <p className="mb-4 font-semibold" style={{ fontStyle: 'italic' }}>
                  <span className="text-red-600">*</span>Where does Kirin Ichiban originally come from?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['CHINA', 'SOUTH KOREA', 'JAPAN', 'SINGAPORE'].map((country) => (
                    <label key={country} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="qnaAnswer"
                        value={country}
                        checked={formData.qnaAnswer === country}
                        onChange={handleInputChange}
                        className="h-5 w-5"
                        style={{ accentColor: '#E5B746' }}
                      />
                      <span className="ml-2 font-semibold">{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  disabled={loading || receiptExists}
                  className="px-12 py-4 font-bold text-2xl text-white rounded-full shadow-lg transition disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)'
                  }}
                >
                  {loading ? 'SUBMITTING...' : 'SUBMIT RECEIPT'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ENTRY TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#000' }}>
              ENTER YOUR MOBILE NUMBER AND TRACK YOUR ENTRY STATUS
            </h1>
            <div className="max-w-2xl mx-auto">
              <label className="block text-base font-bold mb-4" style={{ color: '#000' }}>
                MOBILE NUMBER<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={trackingMobileNumber}
                onChange={(e) => setTrackingMobileNumber(e.target.value)}
                maxLength="11"
                placeholder="Enter mobile number (max 11 digits)"
                className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-black focus:outline-none text-gray-400"
                style={{ fontStyle: 'italic' }}
              />
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchSubmissionsByMobileNumber(trackingMobileNumber)}
                  disabled={loadingSubmissions}
                  className="px-12 py-4 font-bold text-2xl text-white rounded-full shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #9B3D3D 0%, #C85A54 100%)' }}
                >
                  {loadingSubmissions ? 'LOADING...' : 'TRACK MY ENTRY'}
                </button>
              </div>

              {submissions.length > 0 && (
                <div className="mt-12 overflow-x-auto">
                  <table className="min-w-full" style={{ backgroundColor: '#E5B746' }}>
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold">MOBILE NUMBER</th>
                        <th className="px-6 py-3 text-left text-sm font-bold">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-bold">Date of Submission</th>
                        <th className="px-6 py-3 text-left text-sm font-bold">Receipt Number</th>
                        <th className="px-6 py-3 text-left text-sm font-bold">Submission Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {submissions.map((sub, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm">{sub.mobileNumber}</td>
                          <td className="px-6 py-4 text-sm">{sub.name}</td>
                          <td className="px-6 py-4 text-sm">{new Date(sub.dateOfSubmission).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{sub.receiptNumber}</td>
                          <td className="px-6 py-4 text-sm">{sub.submissionStatus}</td>
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
        {activeTab === 'faq' && (
          <div>
            <h1 className="text-4xl font-bold text-center mb-12" style={{ color: '#000' }}>
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
                  Who can participate in the Kirin Spend to Win Campaign?
                </h3>
                <p className="text-gray-700 italic">
                  The promotions are open to all non-Muslim residents in Malaysia aged 21 years and above. All entries are subject to terms and conditions. Please refer to T&Cs for more information.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
                  Can I participate if I live in East Malaysia?
                </h3>
                <p className="text-gray-700 italic">
                  No, the campaign only available for West Malaysia.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
                  Lorem Ipsum
                </h3>
                <p className="text-gray-700 italic">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
                  Lorem Ipsum
                </h3>
                <p className="text-gray-700 italic">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center" style={{ backgroundColor: '#E5B746', flexShrink: 0, marginTop: 'auto' }}>
        <p className="text-black font-bold text-[10px] sm:text-sm lg:text-base">
          TERMS & CONDITION APPLIES  •  PRIVACY POLICY
        </p>
      </div>
    </div>
  );
};

export default FormComponent;
