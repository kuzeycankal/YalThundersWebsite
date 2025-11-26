// Vercel Serverless Function - R2 Upload
// Using AWS SDK (proper way!)

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('📤 R2 Upload request received');
    console.log('Headers:', req.headers['content-type']);

    // Parse multipart form data manually
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type must be multipart/form-data'
      });
    }

    // Get boundary
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({
        success: false,
        error: 'No boundary found'
      });
    }

    // Read body chunks
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Parse multipart data
    const parts = buffer.toString('binary').split(`--${boundary}`);
    
    let fileBuffer = null;
    let filename = '';
    let contentType = 'application/octet-stream';

    for (const part of parts) {
      if (part.includes('name="filename"')) {
        const match = part.match(/\r\n\r\n(.*?)\r\n/);
        if (match) filename = match[1];
      }
      
      if (part.includes('name="file"')) {
        const filenameMatch = part.match(/filename="(.+?)"/);
        const contentTypeMatch = part.match(/Content-Type:\s*(.+?)\r\n/i);
        
        if (contentTypeMatch) contentType = contentTypeMatch[1];
        
        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        
        if (dataStart > 3 && dataEnd > dataStart) {
          const binaryStr = part.substring(dataStart, dataEnd);
          fileBuffer = Buffer.from(binaryStr, 'binary');
        }
      }
    }

    if (!fileBuffer || !filename) {
      console.error('❌ Missing file or filename');
      return res.status(400).json({
        success: false,
        error: 'Missing file or filename',
        debug: { hasFile: !!fileBuffer, filename }
      });
    }

    console.log('📁 File:', filename, 'Size:', fileBuffer.length, 'Type:', contentType);

    // Check R2 credentials
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.error('❌ R2 credentials missing');
      return res.status(500).json({
        success: false,
        error: 'R2 credentials not configured'
      });
    }

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'yal-thunders-academy',
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType,
    });

    console.log('⬆️ Uploading to R2...');
    await s3Client.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    console.log('✅ Upload successful:', publicUrl);

    return res.status(200).json({
      success: true,
      url: publicUrl,
    });

  } catch (error) {
    console.error('❌ R2 upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message,
      stack: error.stack,
    });
  }
}

