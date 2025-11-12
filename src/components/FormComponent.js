import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FormComponent = () => {
  const [formData, setFormData] = useState({
    segment: '',
    fullName: '',
    nric: '',
    mobileNumber: '',
    email: '',
    receiptNumber: '',
    receiptDate: '',
    qnaAnswer: '',
    termsAccepted: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [trackingNRIC, setTrackingNRIC] = useState('');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Replace this with your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEahEV1ejD19wWxxs76Ly7PWcKwx6-5pdwh8fCjqxMCpXgaZUOXAdFeH-zdVS-Td1a/exec'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
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

  const fetchSubmissionsByNRIC = async (nric) => {
    if (!nric || nric.length !== 12) {
      toast.error('Please enter a valid 12-digit NRIC');
      return;
    }

    setLoadingSubmissions(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getSubmissionsByNRIC&nric=${nric}`);
      const data = await response.json();

      if (data.result === 'success') {
        setSubmissions(data.data);
        if (data.data.length === 0) {
          toast.info('No submissions found for this NRIC');
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

  const handleTrackSubmissions = () => {
    fetchSubmissionsByNRIC(trackingNRIC);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.segment || !formData.fullName || !formData.nric || !formData.mobileNumber ||
        !formData.email || !formData.receiptNumber || !formData.receiptDate || !formData.qnaAnswer) {
      toast.error('Please fill in all required fields');
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

    // Validate NRIC format (12 digits)
    const nricRegex = /^\d{12}$/;
    if (!nricRegex.test(formData.nric)) {
      toast.error('NRIC must be 12 digits (format: 000000112222)');
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error('Mobile number must be 10 digits (format: 0122223333)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64
      const imageBase64 = await convertImageToBase64(imageFile);

      // Prepare data for Google Sheets
      const submissionData = {
        segment: formData.segment,
        fullName: formData.fullName,
        nric: formData.nric,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        receiptNumber: formData.receiptNumber,
        receiptDate: formData.receiptDate,
        image: imageBase64,
        imageName: imageFile.name,
        qnaAnswer: formData.qnaAnswer,
        timestamp: new Date().toISOString()
      };

      // Submit to Google Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      // Note: with 'no-cors' mode, we can't read the response
      // Assume success if no error is thrown
      toast.success('Form submitted successfully!');

      // Reset form
      setFormData({
        segment: '',
        fullName: '',
        nric: '',
        mobileNumber: '',
        email: '',
        receiptNumber: '',
        receiptDate: '',
        qnaAnswer: '',
        termsAccepted: false
      });
      setImageFile(null);
      setImagePreview(null);

      // Reset file input
      document.getElementById('image-upload').value = '';

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Form Submission
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Segment */}
        <div>
          <label htmlFor="segment" className="block text-sm font-medium text-gray-700 mb-2">
            Segment <span className="text-red-500">*</span>
          </label>
          <select
            id="segment"
            name="segment"
            value={formData.segment}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select a segment</option>
            <option value="Supermarket">Supermarket</option>
            <option value="Convenience Store">Convenience Store</option>
            <option value="Ecomm(Shopee/Lazada)">Ecomm(Shopee/Lazada)</option>
          </select>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Enter your full name"
          />
        </div>

        {/* NRIC */}
        <div>
          <label htmlFor="nric" className="block text-sm font-medium text-gray-700 mb-2">
            NRIC <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nric"
            name="nric"
            value={formData.nric}
            onChange={handleInputChange}
            required
            maxLength="12"
            pattern="\d{12}"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="000000112222"
          />
          <p className="mt-1 text-sm text-gray-500">Format: 12 digits (000000112222)</p>
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            required
            maxLength="10"
            pattern="\d{10}"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="0122223333"
          />
          <p className="mt-1 text-sm text-gray-500">Format: 10 digits (0122223333)</p>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="someone@gmail.com"
          />
        </div>

        {/* Receipt Number */}
        <div>
          <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Receipt Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="receiptNumber"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Enter receipt number"
          />
        </div>

        {/* Receipt Date */}
        <div>
          <label htmlFor="receiptDate" className="block text-sm font-medium text-gray-700 mb-2">
            Receipt Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="receiptDate"
            name="receiptDate"
            value={formData.receiptDate}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Upload Receipt */}
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Receipt <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">Max file size: 5MB</p>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Receipt Preview:</p>
            <img
              src={imagePreview}
              alt="Receipt Preview"
              className="max-w-full h-auto max-h-64 rounded-md border border-gray-300"
            />
          </div>
        )}

        {/* QnA */}
        <div>
          <label htmlFor="qnaAnswer" className="block text-sm font-medium text-gray-700 mb-2">
            Where does Kirin Ichiban originally come from? <span className="text-red-500">*</span>
          </label>
          <select
            id="qnaAnswer"
            name="qnaAnswer"
            value={formData.qnaAnswer}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select an answer</option>
            <option value="China">China</option>
            <option value="South Korea">South Korea</option>
            <option value="Japan">Japan</option>
            <option value="Singapore">Singapore</option>
          </select>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
            required
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-700">
            I accept the{' '}
            <span
              className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
              title="Terms & Conditions: By participating in this promotion, you agree to provide accurate information. Winners will be selected based on the criteria set by the organizers. Personal data collected will be used solely for this promotion and will be handled in accordance with privacy regulations. The organizers reserve the right to modify or terminate the promotion at any time."
            >
              Terms & Conditions
            </span>{' '}
            <span className="text-red-500">*</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition flex items-center justify-center ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Submitting...
            </>
          ) : (
            'Submit Form'
          )}
        </button>
      </form>

      {/* Entry Tracker Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Entry Tracker</h2>
        <p className="text-gray-600 mb-4">Track your submissions by entering your NRIC</p>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={trackingNRIC}
            onChange={(e) => setTrackingNRIC(e.target.value)}
            maxLength="12"
            placeholder="Enter your NRIC (12 digits)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <button
            onClick={handleTrackSubmissions}
            disabled={loadingSubmissions}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 transition"
          >
            {loadingSubmissions ? 'Loading...' : 'Track'}
          </button>
        </div>

        {submissions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    NRIC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Date of Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Receipt Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Submission Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.nric}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(submission.dateOfSubmission).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {submission.submissionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default FormComponent;
