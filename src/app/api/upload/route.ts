import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

// Generate a unique filename: YYYYMMDD_THHMMSS_XXXXXX.ext
function generateUniqueFilename(originalName: string): string {
  const ext = originalName.includes('.')
    ? '.' + originalName.split('.').pop()
    : '';
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${datePart}_${timePart}_${random}${ext}`;
}

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

    // 6. Upload file to Google Drive folder (using a unique renamed filename)
    const uniqueFilename = generateUniqueFilename(file.name);
    const fileMetadata = {
      name: uniqueFilename,
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

    // 8. Return success response with Google Drive webViewLink and both names
    return NextResponse.json({
      url: uploadedFile.webViewLink,
      name: uploadedFile.name,        // renamed unique filename
      originalName: file.name,        // original filename for display
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'No fileId provided' },
        { status: 400 }
      );
    }

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      console.error('Missing Google Drive environment variables for deletion');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedPrivateKey,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Delete file from Google Drive
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Google Drive Deletion Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file from Google Drive' },
      { status: 550 }
    );
  }
}
