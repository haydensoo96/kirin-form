// ==================================================
// SIMPLIFIED VERSION - No Rate Limiting, No reCAPTCHA
// ==================================================
// Updated: Added Brand Answer column, removed Address column
// ==================================================

// ==================================================
// GET Request Handler
// ==================================================

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getWinners') {
      return getWinners();
    } else if (action === 'getSubmissionsByMobileNumber') {
      return getSubmissionsByMobileNumber(e.parameter.mobileNumber);
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

// ==================================================
// POST Request Handler
// ==================================================

function doPost(e) {
  try {
    Logger.log('POST: Received request');

    const data = JSON.parse(e.postData.contents);
    Logger.log('POST: Parsed data successfully');

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    Logger.log('POST: Got sheet: ' + sheet.getName());

    // If this is the first submission, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',       // col 1
        'Segment',         // col 2
        'Full Name',       // col 3
        'NRIC',            // col 4
        'Mobile Number',   // col 5
        'Email',           // col 6
        'Receipt Number',  // col 7
        'Receipt Date',    // col 8
        'Image Link',      // col 9
        'Brand Answer',    // col 10
        'QnA Answer',      // col 11
        'Submission Status', // col 12
        'Winner',          // col 13
      ]);
      Logger.log('POST: Added headers');
    }

    // Check for duplicate receipt number
    const receiptNumber = data.receiptNumber || '';
    if (receiptNumber) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const receiptColumn = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
        const existingReceipts = receiptColumn.map(row => row[0].toString().trim());

        if (existingReceipts.includes(receiptNumber.trim())) {
          Logger.log('POST: Duplicate receipt number');
          return ContentService
            .createTextOutput(JSON.stringify({
              'result': 'error',
              'message': 'This receipt number has already been submitted. One receipt can only be submitted once.'
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    Logger.log('POST: Starting image upload');

    // Handle image upload
    let imageUrl = '';
    if (data.image && data.imageName) {
      try {
        const base64Data = data.image.split(',')[1];
        const mimeType = data.image.split(';')[0].split(':')[1];

        const blob = Utilities.newBlob(
          Utilities.base64Decode(base64Data),
          mimeType,
          data.imageName
        );

        const folders = DriveApp.getFoldersByName('Form Submissions Images');
        let folder;
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder('Form Submissions Images');
        }

        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        imageUrl = file.getUrl();

        Logger.log('POST: Image uploaded: ' + imageUrl);
      } catch (imageError) {
        Logger.log('POST: Image upload error: ' + imageError.toString());
        imageUrl = 'Error uploading image';
      }
    }

    Logger.log('POST: Appending data to sheet');

    sheet.appendRow([
      data.timestamp || new Date().toISOString(), // col 1
      data.segment || '',                          // col 2
      data.fullName || '',                         // col 3
      "'" + (data.nric || ''),                     // col 4
      "'" + (data.mobileNumber || ''),             // col 5
      data.email || '',                            // col 6
      data.receiptNumber || '',                    // col 7
      data.receiptDate || '',                      // col 8
      imageUrl,                                    // col 9
      data.brandAnswer || '',                      // col 10
      data.qnaAnswer || '',                        // col 11
      'Submitted',                                 // col 12
      false,                                       // col 13
    ]);

    Logger.log('POST: Data appended successfully');

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'message': 'Data submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('POST: Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================================================
// Get Winners
// ==================================================

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

    const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues(); // 13 columns
    const winners = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i][12] === true || data[i][12] === 'TRUE' || data[i][12] === 'true') { // Winner: index 12
        winners.push({
          name: data[i][2],
          nric: data[i][3],
          receiptNumber: data[i][6]
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

// ==================================================
// Get Submissions by Mobile Number
// ==================================================

function getSubmissionsByMobileNumber(mobileNumber) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1 || !mobileNumber) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'result': 'success',
          'data': []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues(); // 13 columns
    const submissions = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i][4].toString().trim() === mobileNumber.trim()) {
        submissions.push({
          mobileNumber: data[i][4],
          name: data[i][2],
          dateOfSubmission: data[i][0],
          receiptNumber: data[i][6],
          submissionStatus: data[i][11] // Submission Status: index 11
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

// ==================================================
// Check Receipt Number
// ==================================================

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

    const receiptColumn = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
    const existingReceipts = receiptColumn.map(row => row[0].toString().trim());

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
