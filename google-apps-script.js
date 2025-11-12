// Google Apps Script Code
// Deploy this as a Web App in Google Apps Script Editor

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getWinners') {
      return getWinners();
    } else if (action === 'getSubmissionsByNRIC') {
      return getSubmissionsByNRIC(e.parameter.nric);
    } else if (action === 'checkReceiptNumber') {
      return checkReceiptNumber(e.parameter.receiptNumber);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet (or specify by ID)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If this is the first submission, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Segment',
        'Full Name',
        'NRIC',
        'Mobile Number',
        'Email',
        'Receipt Number',
        'Receipt Date',
        'Image Link',
        'QnA Answer',
        'Submission Status',
        'Winner'
      ]);
    }

    // Check for duplicate receipt number
    const receiptNumber = data.receiptNumber || '';
    if (receiptNumber) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) { // If there are rows beyond the header
        // Get all receipt numbers from column G (index 7)
        const receiptColumn = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
        const existingReceipts = receiptColumn.map(row => row[0].toString().trim());

        // Check if the receipt number already exists
        if (existingReceipts.includes(receiptNumber.trim())) {
          return ContentService
            .createTextOutput(JSON.stringify({
              'result': 'error',
              'message': 'This receipt number has already been submitted. One receipt can only be submitted once.'
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Handle image upload
    let imageUrl = '';
    if (data.image && data.imageName) {
      try {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = data.image.split(',')[1];
        const mimeType = data.image.split(';')[0].split(':')[1];

        // Convert base64 to blob
        const blob = Utilities.newBlob(
          Utilities.base64Decode(base64Data),
          mimeType,
          data.imageName
        );

        // Get or create a folder in Google Drive to store images
        const folders = DriveApp.getFoldersByName('Form Submissions Images');
        let folder;
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder('Form Submissions Images');
        }

        // Save the file to Google Drive
        const file = folder.createFile(blob);

        // Make the file publicly accessible (optional)
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        // Get the file URL
        imageUrl = file.getUrl();
      } catch (imageError) {
        Logger.log('Error processing image: ' + imageError.toString());
        imageUrl = 'Error uploading image';
      }
    }

    // Append the data to the sheet
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.segment || '',
      data.fullName || '',
      data.nric || '',
      data.mobileNumber || '',
      data.email || '',
      data.receiptNumber || '',
      data.receiptDate || '',
      imageUrl,
      data.qnaAnswer || '',
      'Submitted',
      false
    ]);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'message': 'Data submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Get winners list
function getWinners() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'result': 'success',
          'data': []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get all data
    const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    const winners = [];

    // Filter winners (column 12 is Winner)
    for (let i = 0; i < data.length; i++) {
      if (data[i][11] === true || data[i][11] === 'TRUE' || data[i][11] === 'true') {
        winners.push({
          name: data[i][2],          // Full Name (column C)
          nric: data[i][3],          // NRIC (column D)
          receiptNumber: data[i][6]  // Receipt Number (column G)
        });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'data': winners
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Get submissions by NRIC
function getSubmissionsByNRIC(nric) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1 || !nric) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'result': 'success',
          'data': []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get all data
    const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    const submissions = [];

    // Filter by NRIC (column 4)
    for (let i = 0; i < data.length; i++) {
      if (data[i][3].toString().trim() === nric.trim()) {
        submissions.push({
          nric: data[i][3],              // NRIC (column D)
          name: data[i][2],              // Full Name (column C)
          dateOfSubmission: data[i][0],  // Timestamp (column A)
          receiptNumber: data[i][6],     // Receipt Number (column G)
          submissionStatus: data[i][10]  // Submission Status (column K)
        });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'data': submissions
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Check if receipt number exists
function checkReceiptNumber(receiptNumber) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1 || !receiptNumber) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'result': 'success',
          'exists': false
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get all receipt numbers from column G (index 7)
    const receiptColumn = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
    const existingReceipts = receiptColumn.map(row => row[0].toString().trim());

    // Check if the receipt number already exists
    const exists = existingReceipts.includes(receiptNumber.trim());

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'exists': exists
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        segment: 'Supermarket',
        fullName: 'Test User',
        nric: '123456781234',
        mobileNumber: '0122223333',
        email: 'test@example.com',
        receiptNumber: 'REC001',
        receiptDate: '01-01-2025',
        qnaAnswer: 'Japan',
        timestamp: new Date().toISOString()
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
