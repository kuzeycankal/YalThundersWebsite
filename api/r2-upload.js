diff --git a/academy/js/upload-r2-direct.js b/academy/js/upload-r2-direct.js
index 0b7e11137f7f679e1cf680e6d55d26bddb24db84..26cf093677e8df1620ef12bc9e3702390fbb98a8 100644
--- a/academy/js/upload-r2-direct.js
+++ b/academy/js/upload-r2-direct.js
@@ -21,52 +21,53 @@ async function checkIfAdmin(user) {
     if (!user) return false;
     if (ADMIN_EMAILS.includes(user.email)) return true;
     
     try {
         const adminDoc = await getDoc(doc(db, "admins", user.uid));
         return adminDoc.exists();
     } catch (err) {
         console.error("Admin check error:", err);
         return false;
     }
 }
 
 // Upload file directly to R2 using fetch
 async function uploadToR2(file, type) {
     try {
         const timestamp = Date.now();
         const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
         const filename = `academy/${type}s/${timestamp}_${safeName}`;
         
         console.log(`📤 Uploading ${type}:`, filename);
         
         // Direct PUT to R2 public endpoint
         // Note: This requires R2 bucket to allow public uploads OR
         // we need a presigned URL from backend
         
-        // For now, use Cloudflare Worker endpoint
-        const uploadUrl = `/api/r2-upload`;
+        // For now, use Cloudflare Worker endpoint (Cloudflare Pages Function)
+        // The function is available at /api/upload
+        const uploadUrl = `/api/upload`;
         
         const formData = new FormData();
         formData.append('file', file);
         formData.append('filename', filename);
         formData.append('type', type);
         
         const response = await fetch(uploadUrl, {
             method: 'POST',
             body: formData
         });
         
         if (!response.ok) {
             const errorText = await response.text();
             console.error('Upload failed:', response.status, errorText);
             throw new Error(`Upload failed: ${response.status}`);
         }
         
         const data = await response.json();
         
         if (!data.success) {
             throw new Error(data.error || 'Upload failed');
         }
         
         console.log(`✅ ${type} uploaded:`, data.url);
         return data.url;
