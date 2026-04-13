# 🎬 Video Upload App

A full-featured video upload application built with **Next.js 14 (App Router)** and **Tailwind CSS**, integrated with **Cloudinary** and a local fallback.

---

## ✨ Features

- Drag & drop or click-to-browse video upload
- Real-time upload progress bar
- Video preview before upload
- Cloudinary integration with local `/public/uploads` fallback
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

### 2. Configure Cloudinary

Open `.env.local` and fill in your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get your credentials from: https://cloudinary.com/console

> **Note:** If you skip this step, uploads will be saved locally in `/public/uploads` automatically.

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
│   ├── api/upload/route.js      # Upload API (Cloudinary + local fallback)
│   ├── components/
│   │   ├── VideoUpload.jsx      # Drag & drop upload area
│   │   ├── VideoPreview.jsx     # Preview before upload
│   │   ├── ProgressBar.jsx      # Animated progress bar
│   │   └── VideoGallery.jsx     # Gallery with player & actions
│   ├── lib/cloudinary.js        # Cloudinary SDK config
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
