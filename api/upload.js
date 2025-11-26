// api/upload.js
// Vercel Serverless Function for file uploads
// Uses Vercel Blob Storage

import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB
    });

    const parseForm = () => new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = await parseForm();

    // Get file and type
    const file = files.file?.[0] || files.file;
    const type = fields.type?.[0] || fields.type || 'file';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Read file
    const fileBuffer = await fs.promises.readFile(file.filepath);
    
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || file.newFilename || 'upload';
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `academy/${type}s/${timestamp}_${safeName}`;

    console.log(`Uploading to Blob: ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

    // Upload to Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: 'public',
      contentType: file.mimetype || 'application/octet-stream',
    });

    // Clean up temp file
    try {
      await fs.promises.unlink(file.filepath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    console.log(`Upload successful: ${blob.url}`);

    // Return success
    return res.status(200).json({
      success: true,
      url: blob.url,
      filename: filename,
      size: fileBuffer.length
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ 
      error: 'Upload failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

