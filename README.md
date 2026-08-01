# HMIF Platform

Platform Web Resmi Himpunan Mahasiswa Informatika (HMIF) Universitas Sanata Dharma. Platform ini mengintegrasikan portal informasi, manajemen program kerja/event, kotak aspirasi mahasiswa, galeri dokumentasi, forum diskusi, serta **AI Chatbot Asisten HMIF** yang siap menjawab pertanyaan seputar informatika dan organisasi.

---

## Fitur Utama

- **Landing Page & Informasi HMIF**: Tampilan modern dan interaktif dengan animasi smooth menggunakan GSAP.
- **Events & Agenda Kegiatan**: Informasi program kerja, event harian/tahunan HMIF, serta pengumuman penting.
- **Kotak Aspirasi Mahasiswa**: Sarana penyampaian kritik, saran, dan aspirasi mahasiswa Informatika secara aman.
- **Galeri & Dokumentasi**: Dokumentasi foto kegiatan HMIF dengan dukungan manajemen upload file (Multer).
- **Forum Diskusi**: Ruang diskusi mahasiswa untuk berbagi informasi akademik dan organisasi.
- **AI Chatbot Asisten**: Chatbot FastAPI bertenaga LLM (Groq API) dengan *local knowledge base* mengenai HMIF dan Informatika.
- **Admin Panel Portal**: Panel terproteksi JWT untuk pengurus HMIF mengelola aspirasi, galeri foto, forum, dan rincian konten.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **Styling & Animation**: Vanilla CSS, GSAP (GreenSock Animation Platform), React Icons

### Backend API
- **Runtime & Framework**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Security**: JWT Authentication, Helmet.js, Express Rate Limit, Express Mongo Sanitize
- **File Storage**: Multer (Upload gambar/dokumentasi)

### Chatbot API
- **Framework**: Python 3.11 + FastAPI + Uvicorn
- **AI / LLM Integration**: Groq API SDK (`groq-sdk`)
- **Knowledge Base**: Custom RAG / Local Knowledge Module & Cache System

### Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server & Reverse Proxy**: Nginx Alpine

---

## Struktur Project

```
hmif-platform/
├── chatbot-api/           # Service Chatbot Python FastAPI
│   ├── data/              # Data pengetahuan lokal chatbot
│   ├── main.py            # Entry point FastAPI
│   ├── llm_service.py     # Integrasi Groq LLM API
│   ├── local_knowledge.py # Logic pencarian informasi lokal
│   ├── requirements.txt   # Dependensi Python
│   └── Dockerfile         # Docker build chatbot
├── server/                # Service Backend Express.js API
│   ├── middleware/        # Authentication & file upload middleware
│   ├── models/            # Schema MongoDB (Mongoose)
│   ├── routes/            # API Endpoints (Admin, Aspirations, Gallery, Forum)
│   ├── server.js          # Entry point Express API
│   └── Dockerfile         # Docker build backend
├── src/                   # Frontend React (Vite)
│   ├── components/        # UI Components (Navbar, Footer, Modals, Chatbot UI)
│   ├── pages/             # Halaman Aplikasi (Home, About, Events, Aspirations, Admin)
│   ├── services/          # HTTP Client & API Integrations
│   ├── App.jsx            # Routing & Layout Root
│   └── main.jsx           # Entry point React
├── public/                # Asset publik statis
├── docker-compose.yml     # Orchestration Docker Compose untuk Homelab/Production
├── nginx.conf             # Konfigurasi Nginx reverse proxy
├── .env.example           # Template environment variable
├── HOMELAB-DEPLOY.md      # Panduan deployment Homelab Server
└── README.md              # Dokumentasi utama project
```

---

## Cara Menjalankan Project (Local Development)

### Prasyarat
- Node.js v20+ dan npm
- Python 3.11+ dan pip
- MongoDB (Lokal atau MongoDB Atlas)

### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/DanielJoanF/HMIF.git hmif-platform
cd hmif-platform

# Salin file konfigurasi environment
cp .env.example .env
```
Edit file `.env` dan atur parameter sesuai kebutuhan (misal `MONGODB_URI`, `GROQ_API_KEY`, `ADMIN_PASSWORD`).

### 2. Jalankan Backend Express API
```bash
cd server
npm install
npm run dev
```
Backend akan berjalan di `http://localhost:5000`.

### 3. Jalankan Chatbot API (Python FastAPI)
```bash
cd chatbot-api
python -m venv venv
source venv/bin/activate  # Di Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Chatbot API akan berjalan di `http://localhost:8000`.

### 4. Jalankan Frontend (React + Vite)
```bash
# Kembali ke root folder project
cd ..
npm install
npm run dev
```
Buka browser di `http://localhost:5173`.

---

## Deployment dengan Docker (Homelab / Server)

Project ini dilengkapi dengan konfigurasi `docker-compose.yml` yang siap digunakan di Homelab server maupun VPS.

### Langkah Deploy:
```bash
# 1. Pastikan file .env sudah siap
cp .env.example .env

# 2. Build frontend static files
npm install && npm run build

# 3. Jalankan seluruh service container
docker compose up -d --build
```

Container yang akan berjalan:
- `hmif-frontend`: Nginx Reverse Proxy (Port 80/443)
- `hmif-backend`: Express.js API (Port 5000)
- `hmif-chatbot`: FastAPI Service (Port 8000)
- `hmif-mongodb`: Database MongoDB (Port 27017)

Panduan detail deployment Homelab dapat dibaca di **[HOMELAB-DEPLOY.md](HOMELAB-DEPLOY.md)**.

---

## License & Kontribusi

Dikembangkan untuk **Himpunan Mahasiswa Informatika (HMIF) Universitas Sanata Dharma**.  
Hak Cipta © 2026 HMIF USD. All rights reserved.
