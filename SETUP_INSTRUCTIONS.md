# YAL Thunders Academy Setup Instructions

## Vercel Deployment Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@11ty/eleventy` - Static site generator
- `@vercel/blob` - Vercel Blob Storage
- `formidable` - Form data parsing for file uploads

### 2. Vercel Blob Storage Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to your project → Storage → Blob
3. Create a new Blob store if you haven't already
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Environment Variables

Add the following environment variable to your Vercel project:

**In Vercel Dashboard:**
- Go to Settings → Environment Variables
- Add:
  - Name: `BLOB_READ_WRITE_TOKEN`
  - Value: Your Vercel Blob token (starts with `vercel_blob_rw_`)

**For Local Development:**
Create a `.env` file in the root directory:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

### 4. Deploy to Vercel

```bash
vercel
```

Or push to GitHub and let Vercel auto-deploy.

## File Structure

```
project/
├── api/
│   └── upload.js          # Vercel Serverless Function for uploads
├── academy/
│   ├── js/
│   │   ├── upload.js      # Frontend upload logic
│   │   ├── meetings.js    # Meeting creation
│   │   └── ...
│   └── ...
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── eleventy.config.js    # Eleventy configuration
```

## API Endpoints

### POST /api/upload
Upload videos and thumbnails to Vercel Blob Storage

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: File to upload
  - `type`: 'video' or 'thumbnail'

**Response:**
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/...",
  "filename": "academy/videos/1234567890_video.mp4"
}
```

## How It Works

### Video Upload Process:

1. **User selects files** in the admin panel
2. **Frontend (upload.js)** sends files to `/api/upload`
3. **Backend (api/upload.js)** uploads to Vercel Blob Storage
4. **Returns public URL** to frontend
5. **Frontend saves** video metadata to Firebase Firestore with the URLs

### Meeting Creation Process:

1. **Admin fills** meeting form
2. **Frontend (meetings.js)** validates data
3. **Saves directly** to Firebase Firestore
4. **No file uploads** needed for meetings

## Firebase Configuration

Firebase is already configured in `firebase-init.js`:
- Authentication: User login/register
- Firestore: Store video metadata and meetings
- No Firebase Storage used (replaced with Vercel Blob)

## Admin Access

Admin users are defined in:
- `academy/js/admin.js`
- `academy/js/upload.js`
- `academy/js/meetings.js`
- `academy/js/list-meetings.js`

Current admin: `kuzeycankal@gmail.com`

To add more admins, update the `ADMIN_EMAILS` array in these files.

## Testing Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up `.env` file with `BLOB_READ_WRITE_TOKEN`

3. Run Eleventy:
   ```bash
   npm run dev
   ```

4. Test upload:
   - Go to `/academy/academy-admin.html`
   - Login as admin
   - Upload a test video

## Troubleshooting

### Upload fails with "BLOB_READ_WRITE_TOKEN not found"
- Make sure the environment variable is set in Vercel
- For local dev, create a `.env` file

### "Method not allowed" error
- Check that the API route is properly configured in `vercel.json`
- Make sure you're sending POST requests

### File size limits
- Vercel Blob has generous limits (up to 500MB per file)
- For videos larger than 100MB, consider using resumable uploads

### Console errors during upload
- Open browser DevTools (F12) → Console
- Check for detailed error messages
- Verify network requests in the Network tab

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Blob Storage created and configured
- [ ] Firebase configuration correct
- [ ] Admin emails updated
- [ ] Test video upload
- [ ] Test meeting creation
- [ ] Check mobile responsiveness
- [ ] Verify theme switching works

## Support

For issues or questions:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify environment variables are set correctly

