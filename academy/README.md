# YAL Thunders Academy System

Modern, theme-aware video learning platform for YAL Thunders FRC Team.

## Features

### 🎓 Video Library
- Browse training videos by category (Software, Design, CAD, Robotics)
- Search videos by title, description, or category
- Watch videos with modern video player
- Related videos sidebar
- Responsive grid layout

### 👨‍💼 Admin Panel
- Upload videos with thumbnails
- Create and manage meetings
- Admin authentication (email-based + Firestore)
- Firebase Storage integration

### 🎨 Modern Design
- Light/Dark theme support (synced with main site)
- Smooth animations and transitions
- Modern color palette
- Responsive design for all devices
- Professional card-based layout

### 🔐 Security
- Firebase Authentication
- Admin-only access to upload/create features
- Firestore security rules ready

## File Structure

```
academy/
├── index.html              # Main academy page (video list)
├── video.html              # Video player page
├── academy-admin.html      # Admin panel (upload & create)
├── academy-meetings.html   # Meetings list page
│
├── css/
│   └── academy.css         # Complete Academy styles with theme support
│
└── js/
    ├── firebase.js         # Firebase initialization
    ├── theme.js            # Theme switcher (light/dark)
    ├── video-list.js       # Video listing & filtering
    ├── view.js             # Video player functionality
    ├── admin.js            # Admin authentication
    ├── upload.js           # Video upload with Firebase Storage
    ├── meetings.js         # Meeting creation
    └── list-meetings.js    # Meeting listing & deletion
```

## Admin Setup

### Add Admin Users

Admin users are controlled by:
1. **Email list** (hardcoded in `admin.js`, `upload.js`, `meetings.js`, `list-meetings.js`)
2. **Firestore** (users who register with admin code)

To add a new admin:

**Option 1: Update Email List**
Edit these files and add email to `ADMIN_EMAILS` array:
- `academy/js/admin.js`
- `academy/js/upload.js`
- `academy/js/meetings.js`
- `academy/js/list-meetings.js`

```javascript
const ADMIN_EMAILS = [
    "kuzeycankal@gmail.com",
    "newemail@example.com"  // Add here
];
```

**Option 2: Use Admin Code**
User registers with admin code: `YALTHUNDERS2026`

## Theme System

Academy uses the same theme system as the main site:
- Automatically syncs with main site theme
- Stored in localStorage as `theme-preference`
- Supports system preference detection
- Smooth transitions between themes

### Theme Colors

#### Light Theme
- Primary: #ffcc00 (Yellow/Gold)
- Background: #ffffff, #f5f5f5, #e8e8e8
- Text: #1a1a1a, #4a4a4a, #7a7a7a

#### Dark Theme
- Primary: #ffcc00 (Yellow/Gold)
- Background: #0f0f0f, #1a1a1a, #2a2a2a
- Text: #ffffff, #d1d1d1, #a1a1a1

## Firebase Collections

### videos
```json
{
  "title": "Video Title",
  "description": "Video description",
  "category": "software|design|robotics|cad",
  "videoUrl": "Firebase Storage URL",
  "thumbnail": "Firebase Storage URL",
  "uploadedBy": "user UID",
  "uploaderName": "User Name",
  "createdAt": "Firestore Timestamp"
}
```

### meetings
```json
{
  "title": "Meeting Title",
  "description": "Meeting description",
  "dateTime": "ISO Date String",
  "joinCode": "Meeting Code",
  "createdBy": "user UID",
  "creatorName": "User Name",
  "createdAt": "Firestore Timestamp"
}
```

### admins
```json
{
  "admin": true
}
```
Document ID: user UID

## Usage

### For Users
1. Browse academy homepage
2. Use filters to find videos by category
3. Search for specific topics
4. Click video to watch
5. View related videos in sidebar

### For Admins
1. Login with admin email or admin code
2. Navigate to Admin Panel
3. Upload videos (max file size depends on Firebase Storage)
4. Create meetings with join codes
5. Delete meetings from Meetings page

## Development

### Adding New Categories
1. Update filter buttons in `academy/index.html`
2. Update `getCategoryIcon()` in `video-list.js` and `view.js`
3. Add category option in admin panel form

### Customizing Theme
Edit CSS variables in `academy/css/academy.css`:
```css
[data-theme="light"] {
  --primary: #ffcc00;
  /* ... other variables */
}

[data-theme="dark"] {
  --primary: #ffcc00;
  /* ... other variables */
}
```

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6 Modules support required
- CSS Grid and Flexbox
- CSS Custom Properties (CSS Variables)

## Dependencies
- Firebase 10.12.2 (via CDN)
  - Firebase Auth
  - Cloud Firestore
  - Firebase Storage
- Font Awesome 6.x (icons)

## License
Part of YAL Thunders 9160 official website.

