# 🚀 HMIF Platform - Oracle Cloud Deployment

Deploy aplikasi HMIF Platform ke Oracle Cloud Infrastructure (Free Tier) dengan anti-idle protection.

## 📁 File yang Sudah Dibuat

### Configuration Files:
- ✅ `docker-compose.oracle.yml` - Docker Compose untuk 1 VM
- ✅ `Dockerfile.backend` - Image untuk Express.js backend
- ✅ `Dockerfile.chatbot` - Image untuk Python FastAPI
- ✅ `nginx.oracle.conf` - Nginx reverse proxy configuration
- ✅ `.env.oracle` - Template environment variables

### Scripts:
- ✅ `scripts/setup-oracle.sh` - Setup VM otomatis
- ✅ `scripts/keepalive.sh` - Anti-idle health check
- ✅ `scripts/setup-cron.sh` - Setup cron jobs
- ✅ `scripts/backup-uploads.sh` - Backup uploads ke Object Storage
- ✅ `scripts/make-executable.sh` - Membuat semua script executable

### Documentation:
- ✅ `docs/ORACLE-DEPLOY-GUIDE.md` - Panduan lengkap step-by-step
- ✅ `docs/uptimerobot-setup.md` - Setup monitoring external
- ✅ `ORACLE-DEPLOY-README.md` - File ini

---

## 🎯 Quick Start (3 Langkah)

### Langkah 1: Daftar Oracle Cloud
1. Buka https://www.oracle.com/cloud/free/
2. Daftar dengan email dan kartu kredit (tidak ada charge)
3. Pilih region: **Singapore** (terdekat dengan Indonesia)
4. Buat VM instance:
   - Image: Ubuntu 22.04
   - Shape: VM.Standard.A1.Flex (4 OCPU, 24GB RAM) ✅ Gratis
   - atau VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM) ✅ Gratis

### Langkah 2: Setup VM
SSH ke VM dan jalankan:

```bash
# SSH ke VM (ganti dengan IP Anda)
ssh -i your-key.pem ubuntu@152.67.xxx.xxx

# Clone repository
git clone https://github.com/yourusername/hmif-platform.git
cd hmif-platform

# Jalankan setup otomatis
sudo bash scripts/setup-oracle.sh
```

### Langkah 3: Deploy & Anti-Idle

```bash
# Copy dan edit environment
cp .env.oracle .env
nano .env
# Isi: MONGODB_URI, ADMIN_PASSWORD, GROQ_API_KEY

# Build frontend
npm install
npm run build

# Deploy
docker-compose -f docker-compose.oracle.yml up -d

# Setup anti-idle
sudo bash scripts/setup-cron.sh
```

### Langkah 4: Setup UptimeRobot

1. Daftar di https://uptimerobot.com
2. Tambah 3 monitor:
   - `http://YOUR_IP` (Frontend)
   - `http://YOUR_IP:5000/api/health` (Backend)
   - `http://YOUR_IP:8000/health` (Chatbot)
3. Interval: 5 minutes

---

## 🌐 Akses Website

Setelah deploy:
- **Frontend**: http://YOUR_IP
- **Backend API**: http://YOUR_IP:5000/api/health
- **Chatbot API**: http://YOUR_IP:8000/health

---

## 🛡️ Anti-Idle Protection (3 Layer)

1. **Layer 1 - UptimeRobot**: External ping setiap 5 menit
2. **Layer 2 - Cron Job**: Internal health check setiap 10 menit
3. **Layer 3 - Systemd**: Service keepalive yang selalu aktif

---

## 📊 Perintah Penting

```bash
# Cek status
docker-compose -f docker-compose.oracle.yml ps

# Lihat logs
docker-compose -f docker-compose.oracle.yml logs -f

# Restart
docker-compose -f docker-compose.oracle.yml restart

# Update (setelah git pull)
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml up -d --build

# Backup manual
sudo bash scripts/backup-uploads.sh

# Cek anti-idle logs
tail -f /var/log/hmif-keepalive.log
```

---

## ⚠️ Catatan Penting

1. **Jangan lupa** setup UptimeRobot - ini paling penting untuk anti-idle!
2. **Backup uploads** berjalan otomatis setiap hari jam 2 pagi
3. **Monitor logs** secara berkala: `tail -f /var/log/hmif-keepalive.log`
4. **Update system** mingguan: `sudo apt update && sudo apt upgrade`

---

## 💰 Cost

- **Oracle Cloud**: Rp 0 (Always Free) ✅
- **MongoDB Atlas**: Rp 0 (Free Tier 512MB) ✅
- **UptimeRobot**: Rp 0 (Free Tier) ✅
- **Domain**: Rp 100-150rb/tahun (opsional)

**Total**: **GRATIS** untuk jalan terus!

---

## 📞 Butuh Bantuan?

1. Baca `docs/ORACLE-DEPLOY-GUIDE.md` untuk panduan lengkap
2. Baca `docs/uptimerobot-setup.md` untuk setup monitoring
3. Cek logs: `docker-compose -f docker-compose.oracle.yml logs`

---

## 🎉 Selamat!

Website HMIF Platform Anda sekarang live di Oracle Cloud dengan:
- ✅ Free tier (tidak ada biaya)
- ✅ Anti-idle protection
- ✅ Backup otomatis
- ✅ Monitoring 24/7
- ✅ SSL ready (untuk domain nanti)

**Next Step**: Beli domain dan setup SSL untuk tampilan profesional!
