import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 1. Check environment variables
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !privateKey || !folderId) {
      console.error('Missing Google Drive environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 2. Format private key (replace escaped newlines if any)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    // 3. Initialize Google Auth JWT Client
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedPrivateKey,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    // 4. Initialize Google Drive Service
    const drive = google.drive({ version: 'v3', auth });

    // 5. Convert file ArrayBuffer to Buffer and then to readable stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // 6. Upload file to Google Drive folder
    const fileMetadata = {
      name: file.name,
      parents: [folderId],
    };

    const media = {
      mimeType: file.type,
      body: stream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true,
    });

    const uploadedFile = response.data;

    if (!uploadedFile || !uploadedFile.id) {
      throw new Error('Failed to create file on Google Drive');
    }

    // 7. Change file permission to "Anyone with link can view (reader)"
    await drive.permissions.create({
      fileId: uploadedFile.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    // 8. Return success response with Google Drive webViewLink
    return NextResponse.json({
      url: uploadedFile.webViewLink,
      name: uploadedFile.name,
      id: uploadedFile.id
    });

  } catch (error: any) {
    console.error('Google Drive Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file to Google Drive' },
      { status: 550 }
    );
  }
}
