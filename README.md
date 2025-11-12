# Form Submission App

A React application with Tailwind CSS for submitting form data to Google Sheets via Google Apps Script.

## Features

- Full Name input field
- Identity Number input field
- Email Address input field
- Receipt Number input field (unique identifier)
- Image upload with preview
- Form validation
- Responsive design with Tailwind CSS
- Data submitted to Google Sheets
- Images stored in Google Drive

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Account (for Google Sheets and Apps Script)

## Setup Instructions

### 1. Install Dependencies

```bash
cd form-submission-app
npm install
```

### 2. Set Up Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Give it a name (e.g., "Form Submissions")
4. Note: The script will automatically create headers on first submission

### 3. Set Up Google Apps Script

1. In your Google Sheet, click on **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Copy the entire content from `google-apps-script.js` file
4. Paste it into the Apps Script editor
5. Click the **Save** icon (or Ctrl+S / Cmd+S)
6. Give your project a name (e.g., "Form Submission Handler")

### 4. Deploy Google Apps Script as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Configure the deployment:
   - **Description**: Form Submission API (or any description)
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. Review and grant permissions:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** > **Go to [Your Project Name] (unsafe)**
   - Click **Allow**
7. Copy the **Web app URL** - you'll need this for the React app

### 5. Configure React App

1. Open `src/components/FormComponent.js`
2. Find this line:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your Web app URL from step 4
4. Save the file

### 6. Run the Application

```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## Usage

1. Fill in all required fields:
   - Full Name
   - Identity Number
   - Email Address
   - Receipt Number
2. Upload an image (max 5MB)
3. Preview the image before submitting
4. Click "Submit Form"
5. Check your Google Sheet to see the submitted data
6. Images will be stored in a Google Drive folder named "Form Submissions Images"

## Project Structure

```
form-submission-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── FormComponent.js    # Main form component
│   ├── App.js                   # Main app component
│   ├── index.js                 # Entry point
│   └── index.css                # Tailwind CSS imports
├── google-apps-script.js        # Google Apps Script code (copy to Apps Script editor)
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## How It Works

1. **Frontend (React)**:
   - User fills in the form with required information
   - Image is converted to base64 format
   - Data is sent to Google Apps Script via POST request

2. **Backend (Google Apps Script)**:
   - Receives the form data
   - Creates/updates the Google Sheet with form data
   - Saves the image to Google Drive
   - Returns a success/error response

3. **Data Storage**:
   - Form data is stored in Google Sheets
   - Images are stored in Google Drive
   - Each submission includes a timestamp

## Customization

### Change Form Styling

Edit Tailwind classes in `src/components/FormComponent.js`

### Add More Fields

1. Add the field to the `formData` state in `FormComponent.js`
2. Add the input element in the JSX
3. Add the field to the `handleInputChange` function
4. Update the Google Apps Script to handle the new field

### Change Image Size Limit

In `FormComponent.js`, modify this line:
```javascript
if (file.size > 5 * 1024 * 1024) {  // Change 5 to your desired MB limit
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder. You can deploy this to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## Troubleshooting

### Form submission not working

1. Check that you've updated the `GOOGLE_SCRIPT_URL` in `FormComponent.js`
2. Verify the Google Apps Script is deployed as a Web App
3. Ensure the Web App access is set to "Anyone"
4. Check the Apps Script execution logs for errors

### Image not uploading

1. Check the image size is under 5MB
2. Verify the image is a valid image format
3. Check Google Drive permissions in Apps Script

### CORS errors

The app uses `mode: 'no-cors'` to handle CORS restrictions. If you need to read the response, you'll need to:
1. Remove `mode: 'no-cors'`
2. Set up proper CORS headers in Google Apps Script

## License

MIT

## Support

For issues and questions, please check:
- React documentation: https://react.dev
- Tailwind CSS documentation: https://tailwindcss.com
- Google Apps Script documentation: https://developers.google.com/apps-script
