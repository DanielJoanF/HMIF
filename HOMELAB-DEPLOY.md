# Panduan Deploy Homelab Server — HMIF Platform

Dokumen ini berisi panduan singkat untuk menjalankan **HMIF Platform** di server Home Lab menggunakan **Docker Compose**.

## Architecture Stack

Stack aplikasi terdiri dari 4 container:
1. **Frontend**: Static React application dilayani oleh Nginx (Port 80 / 443)
2. **Backend**: Express.js REST API (Port 5000)
3. **Chatbot**: Python FastAPI Service dengan Groq API Integration (Port 8000)
4. **Database**: MongoDB Database Service (Port 27017)

---

## Langkah Deployment

### 1. Salin Environment Template
```bash
cp .env.example .env
```
Edit file `.env` dan ganti rahasia seperti `ADMIN_PASSWORD`, `JWT_SECRET`, dan `GROQ_API_KEY`.

### 2. Build Frontend (Jika menggunakan static build Host)
```bash
npm install
npm run build
```

### 3. Jalankan Service dengan Docker Compose
```bash
docker compose up -d --build
```

### 4. Periksa Status Container
```bash
docker compose ps
docker compose logs -f
```

---

## Commands Penting

- **Stop Services**: `docker compose down`
- **Restart Services**: `docker compose restart`
- **View Logs**: `docker compose logs -f [service_name]` (contoh: `docker compose logs -f backend`)
