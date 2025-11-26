// Cloudflare Pages Function - R2 Upload
// Cloudflare otomatik olarak /functions/ klasöründeki dosyaları algılar

export async function onRequest(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Method not allowed' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get filename from query
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'filename parameter required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📤 R2 Upload:', filename);

    // Upload to R2 bucket
    // R2_BUCKET is bound in Cloudflare Pages settings
    await env.R2_BUCKET.put(filename, request.body, {
      httpMetadata: {
        contentType: request.headers.get('content-type') || 'application/octet-stream',
      },
    });

    // R2 public URL format
    // You need to enable R2 custom domain or use R2.dev domain
    const bucketPublicUrl = env.R2_PUBLIC_URL || `https://pub-${env.CLOUDFLARE_ACCOUNT_ID}.r2.dev`;
    const fileUrl = `${bucketPublicUrl}/${filename}`;

    console.log('✅ Upload successful:', fileUrl);

    return new Response(JSON.stringify({
      success: true,
      url: fileUrl,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ R2 Upload error:', error);
    
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

