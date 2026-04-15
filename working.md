# Voultify — How It Works

A comprehensive guide explaining how every feature of the Voultify cloud storage application works, covering the full stack from frontend to backend.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Application Startup & Entry Point](#application-startup--entry-point)
4. [Authentication (Sign Up & Sign In)](#authentication-sign-up--sign-in)
5. [Routing & Protected Routes](#routing--protected-routes)
6. [App Layout (Sidebar, Topbar, Content)](#app-layout-sidebar-topbar-content)
7. [File Upload & Client-Side Encryption](#file-upload--client-side-encryption)
8. [File Listing & Fetching](#file-listing--fetching)
9. [File Preview & Client-Side Decryption](#file-preview--client-side-decryption)
10. [Folder Management](#folder-management)
11. [File Operations (Delete, Move, Share, Bulk Actions)](#file-operations-delete-move-share-bulk-actions)
12. [Trash System](#trash-system)
13. [Search](#search)
14. [Profile Management](#profile-management)
15. [Theme (Light/Dark Mode)](#theme-lightdark-mode)
16. [Backend API Reference](#backend-api-reference)
17. [Encryption Deep Dive](#encryption-deep-dive)

---

## Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Frontend    | React 18 + Vite                           |
| Styling     | Tailwind CSS                              |
| Routing     | React Router v6                           |
| Icons       | Lucide React                              |
| Encryption  | CryptoJS (AES-256)                        |
| Backend     | Node.js + Express                         |
| Database    | MongoDB + Mongoose                        |
| Auth        | JWT (JSON Web Tokens) + bcryptjs          |
| File Upload | Multer (disk storage)                     |
| Dev Server  | Vite (frontend), Nodemon (backend)        |

---

## Project Structure

```
voultify-frontend/
├── src/                          # FRONTEND
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Route definitions
│   ├── index.css                 # Global styles
│   ├── assets/                   # Static assets (logo, etc.)
│   ├── context/
│   │   ├── AuthContext.jsx       # Auth state (user, token, login/logout)
│   │   └── ThemeContext.jsx      # Light/Dark mode state
│   ├── layouts/
│   │   └── AppLayout.jsx         # Main layout (Sidebar + Topbar + Outlet)
│   ├── components/
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── Topbar.jsx            # Top bar (search, upload, new folder)
│   │   ├── FileCard.jsx          # Individual file/folder card with decrypted cover
│   │   ├── FilePreviewModal.jsx  # Full-screen file preview with decryption
│   │   ├── Modals.jsx            # Upload, New Folder, Move File modals
│   │   └── ProtectedRoute.jsx   # Auth guard component
│   ├── pages/
│   │   ├── Auth.jsx              # Sign In / Sign Up page
│   │   ├── Dashboard.jsx         # Overview with recent files
│   │   ├── MyFiles.jsx           # File browser with folder navigation
│   │   ├── Folders.jsx           # Root-level folder listing
│   │   ├── Trash.jsx             # Trashed files view
│   │   ├── Profile.jsx           # User profile & password management
│   │   └── Settings.jsx          # Theme toggle settings
│   └── utils/
│       └── encryption.js         # Client-side AES encrypt/decrypt functions
│
├── backend/                      # BACKEND
│   ├── src/
│   │   ├── server.js             # Server entry point
│   │   ├── app.js                # Express app config, routes, middleware
│   │   ├── config/
│   │   │   └── db.js             # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js           # User schema (name, email, password, avatar)
│   │   │   └── File.js           # File schema (name, type, size, url, folderId, isTrashed)
│   │   ├── controllers/
│   │   │   ├── userController.js # Register, login, profile CRUD
│   │   │   └── fileController.js # Upload, folders, CRUD, trash, bulk ops
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verification (protect middleware)
│   │   │   ├── uploadMiddleware.js# Multer config for disk storage
│   │   │   └── errorMiddleware.js # 404 and error handlers
│   │   └── routes/
│   │       ├── userRoutes.js     # /api/user/* routes
│   │       └── fileRoutes.js     # /api/file/* routes
│   └── uploads/                  # Encrypted files stored on disk
│
├── package.json                  # Frontend dependencies
├── vite.config.mjs               # Vite configuration
└── tailwind.config.cjs           # Tailwind CSS configuration
```

---

## Application Startup & Entry Point

### Frontend (`main.jsx`)

```
ReactDOM.createRoot → <BrowserRouter> → <ThemeProvider> → <AuthProvider> → <App />
```

1. **`BrowserRouter`** — enables client-side routing.
2. **`ThemeProvider`** — wraps the app to provide light/dark mode state via React Context. Reads theme from `localStorage` key `voultify-theme` (defaults to `dark`). Adds/removes the `dark` class on `<html>`.
3. **`AuthProvider`** — wraps the app to provide auth state (`user`, `token`, `isAuthenticated`, `logout`, `login_success`, `refreshUser`). On mount, reads the JWT token from `localStorage` key `token` and fetches `GET /api/user/profile` to populate the user object.
4. **`<App />`** — defines all routes.

### Backend (`server.js`)

1. Loads `.env` variables with `dotenv`.
2. Connects to MongoDB via `connectDB()`.
3. Starts Express on the configured `PORT` (default `5000`, but the frontend targets port `3000`).
4. `app.js` sets up: CORS, JSON body parser, mounts `/api/user` and `/api/file` routes, serves `/uploads` as static files, and adds error handling middleware.

---

## Authentication (Sign Up & Sign In)

### Sign Up Flow

```
[User fills form] → POST /api/user/register → [Backend creates user with hashed password]
                                              → [Returns success message]
                                              → [Frontend switches to Sign In panel]
```

1. User enters **Name**, **Email**, **Password** on the Sign Up form (`Auth.jsx`).
2. Frontend sends `POST https://voultback.onrender.com/api/user/register` with `{ name, email, password }`.
3. Backend (`userController.js → registerUser`):
   - Checks if email already exists → throws error if so.
   - Creates new `User` document via `User.create()`.
   - The Mongoose `pre('save')` hook hashes the password with `bcryptjs` (10 salt rounds).
   - Returns `201` with user data and a JWT token.
4. Frontend pre-fills the Sign In email field and switches to the Sign In panel.

### Sign In Flow

```
[User fills form] → POST /api/user/login → [Backend validates credentials]
                                          → [Returns JWT token]
                                          → [Frontend stores token in localStorage]
                                          → [AuthContext updates state]
                                          → [Redirect to /dashboard]
```

1. User enters **Email** and **Password** on the Sign In form.
2. Frontend sends `POST https://voultback.onrender.com/api/user/login` with `{ email, password }`.
3. Backend (`userController.js → authUser`):
   - Finds user by email.
   - Calls `user.matchPassword(password)` which uses `bcrypt.compare()`.
   - If valid, generates a JWT token (`jwt.sign` with 30-day expiry) and returns it along with user data.
4. Frontend stores the token in `localStorage.setItem('token', data.token)`.
5. Calls `onLogin()` → which triggers `AuthContext.login_success()` → which reads the token from localStorage and sets it in state.
6. The `useEffect` in `AuthProvider` detects the new token and calls `GET /api/user/profile` to populate the `user` object.
7. Navigation redirects to `/dashboard`.

### JWT Token Verification (Backend)

Every protected API request goes through the `protect` middleware (`authMiddleware.js`):
1. Extracts the token from the `Authorization: Bearer <token>` header.
2. Verifies and decodes it with `jwt.verify()`.
3. Looks up the user by the decoded `id` and attaches `req.user` (excluding password).
4. Calls `next()` to proceed to the controller.

---

## Routing & Protected Routes

Defined in `App.jsx`:

| Path                | Component     | Auth Required | Description                |
| ------------------- | ------------- | ------------- | -------------------------- |
| `/auth`             | `Auth`        | No            | Sign In / Sign Up page     |
| `/dashboard`        | `Dashboard`   | Yes           | Overview with recent files |
| `/my-files`         | `MyFiles`     | Yes           | File browser (root level)  |
| `/folders`          | `Folders`     | Yes           | All root-level folders     |
| `/folders/:folderId`| `MyFiles`     | Yes           | Browse inside a folder     |
| `/trash`            | `Trash`       | Yes           | View trashed files         |
| `/profile`          | `Profile`     | Yes           | Profile settings           |
| `/settings`         | `Settings`    | Yes           | Theme settings             |
| `/` (base)          | Redirect      | Yes           | Redirects to `/dashboard`  |

**`ProtectedRoute`** component: If `isAuthenticated` is `false`, redirects to `/auth`. Otherwise renders children (the `AppLayout`).

---

## App Layout (Sidebar, Topbar, Content)

When authenticated, the app renders `AppLayout.jsx`:

```
┌──────────────────────────────────────────────┐
│  Sidebar (fixed left)  │  Topbar (sticky top) │
│                        │─────────────────────│
│  - Dashboard           │  [Search] [Upload]  │
│  - My Files            │  [New Folder] [Avatar]│
│  - Folders             │─────────────────────│
│  - Trash               │                     │
│  - Profile             │    <Outlet />        │
│  - Settings            │   (Page Content)     │
│                        │                     │
│  ──────────────────    │                     │
│  Storage: 2.5/15 GB    │                     │
│  User info             │                     │
└──────────────────────────────────────────────┘
```

- **Sidebar** (`Sidebar.jsx`): Uses `NavLink` from React Router for active-state highlighting (gradient bg for active item). Shows logo, navigation items, storage bar, and user info at the bottom. Has responsive mobile support with slide-in/out animation.
- **Topbar** (`Topbar.jsx`): Contains the search input, Upload button (opens `UploadModal`), New Folder button (opens `NewFolderModal`), hamburger menu for mobile, and avatar link to `/profile`.
- **`<Outlet />`**: React Router renders the current page here. The `searchQuery` state from `AppLayout` is passed down via `useOutletContext()`.

---

## File Upload & Client-Side Encryption

This is the **core security feature** of Voultify. Files are **encrypted in the browser before upload** so that the server only ever stores ciphertext.

### Upload Flow (Step by Step)

```
[User selects file(s)]
         │
         ▼
[UploadModal.jsx] — calls encryptFile() for each file
         │
         ▼
[encryption.js → encryptFile()]
  1. FileReader reads file as ArrayBuffer
  2. Convert ArrayBuffer → CryptoJS WordArray
  3. AES.encrypt(wordArray, key) where key = user._id
  4. Result → OpenSSL Base64 string (contains salt + ciphertext)
  5. Base64 → raw binary Uint8Array
  6. Create Blob from Uint8Array (type: application/octet-stream)
         │
         ▼
[Create new File() object with encrypted blob + original filename + original mime type]
         │
         ▼
[Append to FormData, also append folderId if inside a folder]
         │
         ▼
[POST /api/file/upload with Authorization header]
         │
         ▼
[Backend: Multer saves encrypted file to /uploads/ directory]
[Backend: Creates File document in MongoDB with metadata]
  - user, name (original), type (original mimetype), size, url (/uploads/filename)
  - folderId (if uploading into a folder)
         │
         ▼
[Frontend dispatches 'fileChange' custom event to refresh file lists]
```

### Key Points

- **Encryption Key**: `user._id` (the MongoDB ObjectId of the logged-in user). This is a **persistent key** that doesn't change between sessions — solving the issue where using the session token would cause files to become inaccessible after logging out and back in.
- **Fallback Key**: If `user._id` is unavailable, the JWT `token` is used as fallback.
- **Algorithm**: AES-256 via CryptoJS. Uses CryptoJS's built-in password-based key derivation (PBKDF with random salt). The salt is embedded in the OpenSSL format output.
- **What's stored on server**: Fully encrypted binary data. The original filename and mimetype are stored in the MongoDB document, but the actual file content on disk is unreadable ciphertext.

---

## File Listing & Fetching

### `MyFiles.jsx` — Main file browser

1. On mount / when dependencies change, calls `fetchFiles()`.
2. Constructs the API URL: `GET https://voultback.onrender.com/api/file?folderId=<id>` or `?search=<query>`.
3. Backend (`fileController.js → getFiles`):
   - Filters by `user`, `isTrashed: false`, and `folderId` (or searches by name regex if search query present).
   - For folders, counts children with `File.countDocuments()`.
   - Returns array sorted by `createdAt` descending.
4. Frontend maps the response into display-friendly objects: `{ id, name, type, url, size, modifiedAt }`.
5. Listens for `fileChange` window events to auto-refresh.

### `Dashboard.jsx`

- Same fetch but slices to show only the **6 most recent** files.

### `Folders.jsx`

- Fetches root-level files (`folderId=`), then filters client-side for `type === 'folder'`.

---

## File Preview & Client-Side Decryption

When a user clicks on a file, the `FilePreviewModal` opens and **decrypts the file in the browser**.

### Preview/Decryption Flow

```
[User clicks file]
       │
       ▼
[FilePreviewModal.jsx opens]
       │
       ▼
[Fetch encrypted file from server: GET https://voultback.onrender.com/uploads/<filename>]
       │
       ▼
[Receive encrypted Blob]
       │
       ▼
[decryptFile(encryptedBlob, user._id, originalMimeType)]
  1. FileReader reads blob as ArrayBuffer
  2. ArrayBuffer → Uint8Array → binary string (chunked to avoid stack overflow)
  3. Binary string → Base64 (reconstruct OpenSSL format)
  4. CryptoJS.AES.decrypt(base64String, key) → decrypted WordArray
  5. Verify sigBytes > 0 (decryption succeeded)
  6. WordArray → Uint8Array via wordArrayToUint8Array() helper
  7. Create Blob with original mimetype
       │
       ▼
[URL.createObjectURL(decryptedBlob)]
       │
       ▼
[Render in browser based on file type:]
  - Image  → <img src={objectUrl} />
  - Video  → <video src={objectUrl} controls />
  - Audio  → <audio src={objectUrl} controls />
  - PDF    → <iframe src={objectUrl} />
  - Other  → "No Preview Available" with open/download buttons
```

### FileCard Thumbnails

`FileCard.jsx` also decrypts image/video files on mount to show a **thumbnail cover**:
- Fetches the encrypted blob from the server.
- Decrypts using the same `decryptFile()` function.
- Creates an object URL for the `<img>` or `<video>` cover element.
- Cleans up the object URL on unmount to prevent memory leaks.

---

## Folder Management

### Creating a Folder

```
[User clicks "New Folder" → NewFolderModal opens]
       │
       ▼
[User enters folder name, clicks "Create"]
       │
       ▼
[POST /api/file/folder with { name, folderId }]
       │
       ▼
[Backend creates a File document with type: 'folder', size: 0, url: '']
       │
       ▼
[Frontend dispatches 'fileChange' event → file list refreshes]
```

- Folders are stored as `File` documents in MongoDB with `type: 'folder'`.
- Nested folders use the `folderId` field (self-referencing the `File` collection).

### Navigating into a Folder

- **From Folders page** (`/folders`): Clicking a folder navigates to `/folders/:folderId` using React Router's `useNavigate()`. The `MyFiles` component is rendered, which reads `folderId` from `useParams()`.
- **From My Files page** (`/my-files`): Clicking a folder pushes it onto the `folderStack` array (client-side breadcrumb state) and fetches its contents.

### Breadcrumb Navigation

`MyFiles.jsx` renders a breadcrumb trail from the `folderStack`:
```
My Files > Folder A > Subfolder B
```
Each crumb is clickable, truncating the stack to that level.

---

## File Operations (Delete, Move, Share, Bulk Actions)

### Delete (Soft Delete → Trash)

```
[FileCard menu → "Delete"] → confirm dialog
       │
       ▼
[DELETE /api/file/:id]
       │
       ▼
[Backend sets file.isTrashed = true and saves]
       │
       ▼
[File disappears from My Files, appears in Trash]
```

### Move to Another Folder

```
[FileCard menu → "Move"] → MoveFileModal opens
       │
       ▼
[Modal fetches root folders from GET /api/file?folderId=]
[User selects a destination folder (or root)]
[Optionally creates a new folder inline]
       │
       ▼
[POST /api/file/bulk/move with { fileIds, folderId }]
       │
       ▼
[Backend updates folderId for matching files]
```

### Share

- Copies the file's download URL to the clipboard using `navigator.clipboard.writeText()`.
- **Note**: Since files are encrypted, sharing the raw URL gives an encrypted file. The recipient would need the same decryption key (user ID) to open it.

### Bulk Actions

When files are selected via checkboxes, a floating **Bulk Action Bar** appears at the bottom:
- **Select All** / **Clear** — manages the `selectedFiles` array.
- **Share** — copies all selected file URLs to clipboard.
- **Move** — opens `MoveFileModal` with multiple files.
- **Delete** — sends `POST /api/file/bulk/delete` with `{ fileIds }`.

---

## Trash System

### Viewing Trash

`Trash.jsx` fetches `GET /api/file/trash`, which returns files where `isTrashed: true`.

### Restore from Trash

```
[FileCard menu → "Restore"] → PUT /api/file/restore/:id
       │
       ▼
[Backend sets file.isTrashed = false]
[File reappears in its original location]
```

### Permanent Delete

```
[FileCard menu → "Permanent"] → confirm dialog
       │
       ▼
[DELETE /api/file/permanent/:id]
       │
       ▼
[Backend deletes the physical file from /uploads/ directory]
[Backend deletes the File document from MongoDB]
```

### Bulk Trash Operations

- **Bulk Restore**: `POST /api/file/bulk/restore` with `{ fileIds }`
- **Bulk Permanent Delete**: `POST /api/file/bulk/permanent` with `{ fileIds }` — deletes physical files and DB records.

---

## Search

1. User types in the **Topbar** search input.
2. `searchQuery` state is managed in `AppLayout.jsx` and passed down via `useOutletContext()`.
3. `MyFiles.jsx` detects the search query and includes it in the API call: `GET /api/file?search=<query>`.
4. Backend uses a MongoDB regex match: `{ name: { $regex: query, $options: 'i' } }`.
5. When searching, the `folderId` filter is **skipped** — search is global across all non-trashed files.

---

## Profile Management

### Viewing Profile

`Profile.jsx` shows the user's avatar, name, and email in a read-only overview.

### Editing Profile

1. User clicks "Edit Profile" → form appears with avatar upload and name input.
2. Avatar is selected via a hidden `<input type="file">` and previewed locally via `URL.createObjectURL()`.
3. On "Save Changes", a `FormData` is sent via `PUT /api/user/profile` containing:
   - `name` (if changed)
   - `avatar` file (if selected)
4. Backend (`userController.js → updateUserProfile`):
   - Updates the `name` field.
   - If an avatar file is uploaded (via Multer), sets `user.avatarUrl` to `/uploads/<filename>`.
   - Saves and returns updated user data.
5. Frontend calls `refreshUser()` to update the AuthContext with new profile data.

### Changing Password

1. User navigates to "Privacy & Security" tab.
2. Enters **current password**, **new password**, **confirm password**.
3. Frontend sends via `PUT /api/user/profile` with `oldPassword` and `password` in `FormData`.
4. Backend:
   - Verifies the old password with `bcrypt.compare()`.
   - If correct, sets `user.password = newPassword` → the `pre('save')` hook hashes it.
   - Returns updated user data.

### Logout

- Clears `token` from `localStorage`.
- Resets `token` and `user` state in `AuthContext`.
- Navigates to `/auth`.

---

## Theme (Light/Dark Mode)

Managed by `ThemeContext.jsx`:

1. Reads initial theme from `localStorage` key `voultify-theme` (defaults to `dark`).
2. On change, saves to `localStorage` and toggles the `dark` class on `document.documentElement`.
3. All components use Tailwind's `dark:` prefix for dark mode styles.
4. The `Settings.jsx` page provides a toggle switch to flip between light and dark.

---

## Backend API Reference

### User Routes (`/api/user`)

| Method | Endpoint     | Auth | Description            |
| ------ | ------------ | ---- | ---------------------- |
| POST   | `/register`  | No   | Create new user        |
| POST   | `/login`     | No   | Authenticate & get JWT |
| GET    | `/profile`   | Yes  | Get user profile       |
| PUT    | `/profile`   | Yes  | Update profile/avatar/password |

### File Routes (`/api/file`)

| Method | Endpoint           | Auth | Description                     |
| ------ | ------------------ | ---- | ------------------------------- |
| GET    | `/`                | Yes  | Get files (with folderId/search filter) |
| POST   | `/upload`          | Yes  | Upload encrypted file(s)        |
| POST   | `/folder`          | Yes  | Create a new folder             |
| GET    | `/trash`           | Yes  | Get trashed files               |
| DELETE | `/:id`             | Yes  | Soft delete (move to trash)     |
| PUT    | `/restore/:id`     | Yes  | Restore from trash              |
| DELETE | `/permanent/:id`   | Yes  | Permanently delete file + disk  |
| PUT    | `/move/:id`        | Yes  | Move file to another folder     |
| POST   | `/bulk/delete`     | Yes  | Bulk soft delete                |
| POST   | `/bulk/move`       | Yes  | Bulk move files                 |
| POST   | `/bulk/restore`    | Yes  | Bulk restore from trash         |
| POST   | `/bulk/permanent`  | Yes  | Bulk permanent delete           |

---

## Encryption Deep Dive

### Algorithm Details

- **Cipher**: AES (Advanced Encryption Standard)
- **Library**: CryptoJS
- **Mode**: CBC (Cipher Block Chaining) — CryptoJS default
- **Padding**: PKCS7 — CryptoJS default
- **Key Derivation**: CryptoJS uses a built-in PBKDF (Password-Based Key Derivation Function) when a string key is passed. It generates a random **salt** and derives a 256-bit key + 128-bit IV from `(password, salt)`.
- **Output Format**: OpenSSL-compatible format: `"Salted__" + 8-byte salt + ciphertext`, encoded in Base64.

### Encryption Process (`encryptFile`)

```
File → FileReader (ArrayBuffer)
     → CryptoJS.lib.WordArray.create(arrayBuffer)
     → CryptoJS.AES.encrypt(wordArray, userID)
     → encrypted.toString()  // Base64 OpenSSL string
     → atob(base64)          // decode to binary string
     → Uint8Array            // convert each char to byte
     → Blob                  // final encrypted blob
```

### Decryption Process (`decryptFile`)

```
Encrypted Blob → FileReader (ArrayBuffer)
               → Uint8Array
               → String.fromCharCode (chunked, 8192 bytes at a time)
               → btoa(binaryString)  // re-encode to Base64 OpenSSL string
               → CryptoJS.AES.decrypt(base64String, userID)
               → decryptedWordArray
               → wordArrayToUint8Array(decryptedWordArray)
               → Blob (with original mimetype)
```

### Why `user._id` as the Key?

- **Persistence**: Unlike the JWT token (which changes on each login), the `user._id` from MongoDB never changes. This ensures files encrypted in one session can always be decrypted in future sessions.
- **Per-User Isolation**: Each user's files are encrypted with their unique ID, so even if the server is compromised, files from different users cannot be cross-decrypted.

### Security Considerations

- The encryption key (`user._id`) is accessible to anyone with access to the user's authenticated session.
- Server-side, files are stored as opaque binary blobs — the server cannot read file contents.
- True end-to-end encryption would require a user-provided passphrase that never leaves the client, but the current approach balances security with convenience (no need to remember a separate passphrase).

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                        │
│                                                                 │
│  1. User selects file                                           │
│  2. encryption.js encrypts with AES using user._id              │
│  3. Encrypted blob sent to server via POST /api/file/upload     │
│                                                                 │
│  4. On preview: fetch encrypted blob from /uploads/filename     │
│  5. encryption.js decrypts with AES using user._id              │
│  6. Decrypted blob → Object URL → rendered in browser           │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (local: HTTP)
┌──────────────────────────▼──────────────────────────────────────┐
│                         SERVER (Backend)                         │
│                                                                 │
│  • Multer saves encrypted file to /uploads/ directory           │
│  • MongoDB stores metadata (name, type, size, url, folderId)    │
│  • Server NEVER sees decrypted file content                     │
│  • JWT auth validates every request                             │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                         MongoDB                                  │
│                                                                 │
│  Users Collection: { name, email, password (hashed), avatarUrl } │
│  Files Collection: { user, name, type, size, url, folderId,     │
│                      isStarred, isTrashed, timestamps }          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
