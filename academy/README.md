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

#### Light Theme - Emerald Green Palette
- Primary: #10b981 (Emerald Green)
- Primary Dark: #059669 (Dark Emerald)
- Primary Light: #34d399 (Light Emerald)
- Background: #ffffff, #f0fdf4 (Light green tint), #dcfce7
- Text: #064e3b (Dark green), #065f46, #10b981
- Card Border: #d1fae5 (Green border)

#### Dark Theme - Forest Green Palette
- Primary: #10b981 (Emerald Green)
- Background: #0a1f1a (Dark forest), #0f2f26, #1a4d3d
- Text: #ecfdf5 (Light mint), #d1fae5, #a7f3d0
- Card Border: #1a4d3d (Dark green border)
- Shadows: Green glow effects

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
  --primary: #10b981;          /* Emerald Green */
  --primary-dark: #059669;     /* Dark Emerald */
  --primary-light: #34d399;    /* Light Emerald */
  /* ... other variables */
}

[data-theme="dark"] {
  --primary: #10b981;          /* Emerald Green */
  --bg-primary: #0a1f1a;       /* Very dark green */
  --bg-secondary: #0f2f26;     /* Dark forest green */
  /* ... other variables */
}
```

### Color Philosophy
The Academy uses a professional emerald green color palette that:
- Represents growth, learning, and nature
- Provides excellent readability in both light and dark modes
- Creates a calming and focused learning environment
- Matches the YAL Thunders brand identity
- Offers great contrast ratios for accessibility

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

