// Simple R2 upload proxy for Vercel
// Uses AWS S3 SDK (R2 is S3-compatible!)

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

// R2 credentials (set in Vercel env)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // https://xxxxx.r2.cloudflarestorage.com
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bb = busboy({ headers: req.headers });
    let filename = '';
    let fileBuffer = Buffer.alloc(0);
    let mimeType = '';

    bb.on('field', (name, val) => {
      if (name === 'filename') filename = val;
    });

    bb.on('file', (name, file, info) => {
      mimeType = info.mimeType;
      const chunks = [];
      
      file.on('data', (data) => {
        chunks.push(data);
      });
      
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on('finish', async () => {
      if (!filename || !fileBuffer.length) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing file or filename' 
        });
      }

      console.log('📤 Uploading to R2:', filename);

      // Upload to R2 using S3 SDK
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'yal-thunders-academy',
        Key: filename,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);

      // Generate public URL
      const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;

      console.log('✅ Upload successful:', publicUrl);

      return res.status(200).json({
        success: true,
        url: publicUrl,
      });
    });

    req.pipe(bb);

  } catch (error) {
    console.error('❌ R2 upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message,
    });
  }
}

