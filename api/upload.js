// api/upload.js
// Vercel Serverless Function for file uploads
// Uses Vercel Blob Storage

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll handle it ourselves
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file from the request
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Invalid content type. Expected multipart/form-data' });
    }

    // Parse multipart form data
    const formidable = require('formidable');
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const file = files.file?.[0] || files.file;
      const type = fields.type?.[0] || fields.type || 'file';

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      try {
        // Read file buffer
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(file.filepath);
        
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.originalFilename || 'upload';
        const filename = `academy/${type}s/${timestamp}_${originalName}`;

        // Upload to Vercel Blob
        const blob = await put(filename, fileBuffer, {
          access: 'public',
          contentType: file.mimetype,
        });

        console.log(`File uploaded successfully: ${blob.url}`);

        // Return the public URL
        return res.status(200).json({
          success: true,
          url: blob.url,
          filename: filename
        });

      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload file',
          details: uploadError.message 
        });
      }
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

