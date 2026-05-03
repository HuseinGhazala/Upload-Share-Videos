# 🎬 Video Upload App

A full-featured video upload application built with **Next.js 14 (App Router)** and **Tailwind CSS**, with **GitHub** storage (optional) and a **local** `/public/uploads` fallback.

---

## ✨ Features

- Drag & drop or click-to-browse video upload
- Real-time upload progress bar
- Video preview before upload
- Video storage: GitHub repository (optional) or local `/public/uploads`
- Files larger than 512KB upload in small chunks (reduces **503** errors on shared hosting)
- Video gallery with player, copy link, and delete
- Toast notifications
- Responsive dark UI with animations

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
cd video-upload-app
npm install
```

### 2. Configure GitHub uploads (optional)

Videos can be pushed to **one** GitHub repository. You need a token with **Contents: Read and write** on that repo, plus the owner and repo name.

Production target for this project: [themiifyHG/uploavideos](https://github.com/themiifyHG/uploavideos).

```env
GITHUB_UPLOAD_TOKEN=your_token_from_account_with_repo_access
GITHUB_UPLOAD_OWNER=themiifyHG
GITHUB_UPLOAD_REPO=uploavideos
GITHUB_UPLOAD_BRANCH=main
GITHUB_UPLOAD_FOLDER=uploads
```

`GITHUB_UPLOAD_OWNER` and `GITHUB_UPLOAD_REPO` are **required** when using GitHub upload. If GitHub is not configured or upload fails, the app saves videos under `/public/uploads`.

> **Token:** create it while logged in as a user that can push to `themiifyHG/uploavideos` (or use a fine-grained token with access to that repository only).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
video-upload-app/
├── app/
│   ├── api/upload/route.js      # Upload API (GitHub + local fallback)
│   ├── components/
│   │   ├── VideoUpload.jsx      # Drag & drop upload area
│   │   ├── VideoPreview.jsx     # Preview before upload
│   │   ├── ProgressBar.jsx      # Animated progress bar
│   │   └── VideoGallery.jsx     # Gallery with player & actions
│   ├── lib/githubUpload.js     # GitHub upload helper
│   ├── hooks/useVideoUpload.js  # Upload logic with XHR progress
│   ├── page.js                  # Main page
│   ├── layout.js
│   └── globals.css
├── public/uploads/              # Local fallback storage
├── .env.local                   # Environment variables
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 📋 Supported Video Formats

| Format | MIME Type       |
|--------|-----------------|
| MP4    | video/mp4       |
| WebM   | video/webm      |
| MOV    | video/quicktime |

Max file size: **50MB**

# Upload-Share-Videos
