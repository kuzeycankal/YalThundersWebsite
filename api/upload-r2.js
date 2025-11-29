// Cloudflare Pages Function for R2 upload
// Place in /functions/api/upload.js (Cloudflare auto-detects)

export async function onRequest(context) {
  const { request, env } = context;

  // CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get filename from URL
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return new Response(JSON.stringify({ error: 'filename required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📤 Uploading to R2:', filename);

    // Upload to R2
    await env.R2_BUCKET.put(filename, request.body, {
      httpMetadata: {
        contentType: request.headers.get('content-type') || 'application/octet-stream',
      },
    });

    // Generate public URL
    const publicUrl = `https://pub-${env.R2_PUBLIC_URL}/${filename}`;

    console.log('✅ Upload successful:', publicUrl);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
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



