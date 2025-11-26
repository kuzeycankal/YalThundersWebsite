// Vercel Edge Function - R2 Upload
// Using fetch API (no AWS SDK needed!)

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('📤 R2 Upload request received');

    // Get FormData
    const formData = await req.formData();
    const file = formData.get('file');
    const filename = formData.get('filename');
    const type = formData.get('type');

    if (!file || !filename) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing file or filename' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📁 File:', filename, 'Type:', type);

    // Get R2 config from env
    const R2_ENDPOINT = process.env.R2_ENDPOINT;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'yal-thunders-academy';
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      console.error('❌ R2 credentials missing');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'R2 credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Upload to R2 using S3-compatible API
    const uploadUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${filename}`;
    
    // Create AWS Signature V4 (simplified for PUT)
    const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = date.slice(0, 8);
    
    // For simplicity, use presigned URL approach
    // Or use direct PUT with proper auth headers
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'public-read',
        'Authorization': `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${dateStamp}/auto/s3/aws4_request`,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ R2 upload failed:', uploadResponse.status, errorText);
      throw new Error(`R2 upload failed: ${uploadResponse.status}`);
    }

    // Generate public URL
    const publicUrl = `${R2_PUBLIC_URL}/${filename}`;

    console.log('✅ Upload successful:', publicUrl);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ R2 upload error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Upload failed',
      message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

