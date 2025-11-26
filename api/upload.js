import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📤 Upload request received');
    
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get('filename');

    if (!filename) {
      console.error('❌ No filename provided');
      return res.status(400).json({ 
        success: false,
        error: 'filename parameter required' 
      });
    }

    console.log('📁 Uploading to Blob:', filename);
    console.log('🔑 Token exists:', !!process.env.BLOB_READ_WRITE_TOKEN);

    // Upload directly from request body stream
    const blob = await put(filename, req, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ Upload successful:', blob.url);

    return res.status(200).json({
      success: true,
      url: blob.url,
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message,
    });
  }
}

