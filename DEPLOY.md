# Panduan Deploy HMIF Platform ke Render.com (Gratis)

## Overview
Project ini terdiri dari 3 service:
1. **Frontend** (React + Vite) → Static Site
2. **Backend API** (Express + MongoDB) → Web Service
3. **Chatbot API** (Python FastAPI) → Web Service

## Langkah-langkah Deploy

### 1. Daftar & Login ke Render.com
- Buka https://render.com
- Daftar dengan email/GitHub
- Verifikasi email

### 2. Deploy MongoDB (MongoDB Atlas - Gratis)
1. Buka https://www.mongodb.com/atlas
2. Buat akun gratis
3. Buat cluster baru (M0 - Gratis)
4. Buat database user baru
5. Dapatkan connection string (URI)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/hmif-platform`

### 3. Deploy ke Render.com

#### A. Deploy Backend API (Express)
1. Di Render Dashboard, klik "New" → "Web Service"
2. Connect repository GitHub
3. Isi form:
   - **Name**: hmif-platform-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Klik "Advanced" → tambah Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hmif-platform
   ADMIN_PASSWORD=password_admin_anda
   PORT=10000
   ```
5. Klik "Create Web Service"
6. Tunggu deploy selesai, catat URL (contoh: `https://hmif-platform-api.onrender.com`)

#### B. Deploy Chatbot API (Python FastAPI)
1. Klik "New" → "Web Service"
2. Isi form:
   - **Name**: hmif-platform-chatbot
   - **Root Directory**: `chatbot-api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3
3. Tambah Environment Variable:
   ```
   ```
4. Klik "Create Web Service"
5. Catat URL (contoh: `https://hmif-platform-chatbot.onrender.com`)

#### C. Deploy Frontend (React)
1. Klik "New" → "Static Site"
2. Isi form:
   - **Name**: hmif-platform
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Tambah Environment Variables:
   ```
   VITE_API_URL=https://hmif-platform-api.onrender.com
   VITE_CHATBOT_URL=https://hmif-platform-chatbot.onrender.com
   ```
4. Klik "Create Static Site"

### 4. Update CORS (Jika Perlu)
Setelah deploy, update CORS di backend (`server/server.js`):
```javascript
app.use(cors({
  origin: ['https://hmif-platform-xxx.onrender.com', 'http://localhost:5173']
}));
```

### 5. Verifikasi
- Buka URL frontend
- Cek fitur:
  - Forum
  - Aspirasi
  - Dokumentasi
  - Chatbot
  - Admin panel

## Troubleshooting

### Masalah CORS
Edit `server/server.js` dan tambahkan domain frontend ke allowed origins.

### Masalah MongoDB
Pastikan:
- IP address sudah di-whitelist di MongoDB Atlas
- Connection string benar
- Database user punya permission read/write

### Masalah Chatbot
Pastikan:
- GROQ_API_KEY masih aktif
- Python dependencies sudah terinstall

## Cost
- Render.com: **Gratis** (tapi akan sleep setelah 15 menit idle)
- MongoDB Atlas: **Gratis** (512MB storage)
- Groq API: **Gratis tier** tersedia

Untuk production, upgrade ke plan berbayar agar service tidak sleep.
