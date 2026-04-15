# Panduan Deploy HMIF Platform ke Oracle Cloud

Panduan lengkap untuk deploy aplikasi HMIF Platform ke Oracle Cloud Infrastructure (OCI) Free Tier.

## 📋 Daftar Isi

1. [Persiapan](#persiapan)
2. [Daftar Oracle Cloud](#1-daftar-oracle-cloud)
3. [Buat VM Instance](#2-buat-vm-instance)
4. [Setup VM](#3-setup-vm)
5. [Deploy Aplikasi](#4-deploy-aplikasi)
6. [Setup Anti-Idle](#5-setup-anti-idle)
7. [Setup Domain & SSL](#6-setup-domain--ssl-optional)
8. [Monitoring & Maintenance](#7-monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Persiapan

### Yang Dibutuhkan:
- ✅ Kartu kredit/debit (untuk verifikasi Oracle)
- ✅ Akun GitHub (untuk clone repo)
- ✅ MongoDB Atlas account (sudah ada)
- ✅ Groq API Key (sudah ada)

### Spesifikasi Minimum:
- **OS**: Ubuntu 22.04 LTS
- **Shape**: VM.Standard.A1.Flex (ARM) atau VM.Standard.E2.1.Micro (AMD)
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 50GB minimum

---

## 1. Daftar Oracle Cloud

### Langkah-langkah:

1. **Kunjungi**: https://www.oracle.com/cloud/free/

2. **Klik "Sign Up for Free Cloud Tier"**

3. **Isi Formulir**:
   - Nama lengkap
   - Email (akan digunakan untuk login)
   - Nama perusahaan (bisa nama pribadi)
   - Alamat lengkap
   - Nomor telepon

4. **Verifikasi Email**:
   - Cek email dari Oracle
   - Klik link verifikasi

5. **Verifikasi Kartu Kredit**:
   - Masukkan detail kartu kredit
   - **Tidak akan ada charge** (hanya verifikasi)
   - Mungkin ada temporary hold Rp 1-5 (akan direlease)

6. **Pilih Home Region**:
   - Pilih region terdekat (Singapore untuk Indonesia)
   - **Catatan**: Always Free resources hanya tersedia di home region

7. **Tunggu Persetujuan**:
   - Biasanya instant, kadang perlu 24-48 jam

---

## 2. Buat VM Instance

### Langkah 1: Login ke Console
1. Buka: https://cloud.oracle.com
2. Login dengan akun yang sudah dibuat

### Langkah 2: Buat VM
1. **Menu** → **Compute** → **Instances**
2. Klik **"Create Instance"**

### Langkah 3: Konfigurasi VM

**Name**: `hmif-platform-vm`

**Image and Shape**:
- **Image**: Ubuntu 22.04 (Canonical)
- **Shape**: 
  - Pilih **VM.Standard.A1.Flex** (ARM - 4 OCPU, 24GB RAM gratis)
  - Atau **VM.Standard.E2.1.Micro** (AMD - 1 OCPU, 1GB RAM)

**Networking**:
- **Virtual Cloud Network**: Buat baru atau pilih existing
- **Subnet**: Public Subnet
- **Assign Public IP**: Yes

**Add SSH Keys**:
- Pilih **"Generate SSH Key Pair"** (download private key)
- Atau upload public key Anda

**Boot Volume**:
- Size: **50GB** (default)
- 

### Langkah 4: Security Rules
1. Buka VCN yang digunakan
2. Klik **Security Lists** → **Default Security List**
3. Klik **"Add Ingress Rules"**:
   - Protocol: TCP
   - Port Range: 80 (HTTP)
   - Source: 0.0.0.0/0
   
   - Protocol: TCP
   - Port Range: 443 (HTTPS)
   - Source: 0.0.0.0/0
   
   - Protocol: TCP
   - Port Range: 22 (SSH)
   - Source: IP Anda
   
   - Protocol: TCP
   - Port Range: 5000 (Backend API)
   - Source: 0.0.0.0/0
   
   - Protocol: TCP
   - Port Range: 8000 (Chatbot API)
   - Source: 0.0.0.0/0

### Langkah 5: Catat Informasi Penting
Setelah VM created, catat:
- **Public IP Address**: Contoh `152.67.123.45`
- **Private Key Path**: File `.key` yang didownload

---

## 3. Setup VM

### Langkah 1: SSH ke VM

```bash
# Ubah permission private key
chmod 400 your-key-file.key

# SSH ke VM
ssh -i your-key-file.key ubuntu@152.67.123.45
```

**Ganti**: `152.67.123.45` dengan IP VM Anda

### Langkah 2: Clone Repository

```bash
# Install git
sudo apt update && sudo apt install -y git

# Pindah ke direktori
sudo mkdir -p /opt/hmif-platform
sudo chown ubuntu:ubuntu /opt/hmif-platform
cd /opt/hmif-platform

# Clone repository
git clone https://github.com/yourusername/hmif-platform.git .

# Atau upload manual dengan SFTP/SCP
```

### Langkah 3: Jalankan Setup Script

```bash
# Jalankan setup otomatis
cd /opt/hmif-platform
sudo bash scripts/setup-oracle.sh
```

**Script ini akan**:
- Update system
- Install Docker & Docker Compose
- Install Nginx
- Install Certbot (SSL)
- Setup firewall
- Install OCI CLI

---

## 4. Deploy Aplikasi

### Langkah 1: Copy Environment File

```bash
# Copy template environment
cd /opt/hmif-platform
cp .env .env.oracle

# Edit dengan nano atau vim
nano .env.oracle
```

### Isi Environment Variables:

```bash
# MongoDB Atlas (gunakan yang sudah ada)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hmif-platform?retryWrites=true&w=majority

# Admin Password
ADMIN_PASSWORD=password_anda_yang_kuat

# Groq API Key (gunakan yang sudah ada)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Object Storage (opsional untuk backup)
OCI_BUCKET_NAME=hmif-uploads-backup
OCI_NAMESPACE=your-namespace
```

### Langkah 2: Build Frontend

```bash
cd /opt/hmif-platform

# Install dependencies
npm install

# Build production
npm run build
```

### Langkah 3: Deploy dengan Docker Compose

```bash
cd /opt/hmif-platform

# Deploy semua service
docker-compose -f docker-compose.oracle.yml up -d

# Cek status
docker-compose -f docker-compose.oracle.yml ps

# Lihat logs
docker-compose -f docker-compose.oracle.yml logs -f
```

### Langkah 4: Verifikasi

Buka browser dan akses:
- **Frontend**: http://152.67.123.45
- **Backend Health**: http://152.67.123.45:5000/api/health
- **Chatbot Health**: http://152.67.123.45:8000/health

**Ganti** `152.67.123.45` dengan IP VM Anda.

---

## 5. Setup Anti-Idle

### Langkah 1: Setup Cron Jobs

```bash
cd /opt/hmif-platform
sudo bash scripts/setup-cron.sh
```

**Ini akan**:
- Jalankan health check setiap 10 menit
- Backup uploads setiap hari jam 2 pagi
- Setup log rotation mingguan
- Aktifkan systemd service

### Langkah 2: Setup UptimeRobot (External Monitoring)

1. **Daftar**: https://uptimerobot.com (gratis)
2. **Dashboard** → **"Add New Monitor"**
3. **Monitor 1 - Frontend**:
   - Type: HTTP(s)
   - URL: http://152.67.123.45
   - Interval: 5 minutes
   - Alert: Email Anda

4. **Monitor 2 - Backend**:
   - Type: HTTP(s)
   - URL: http://152.67.123.45:5000/api/health
   - Interval: 5 minutes

5. **Monitor 3 - Chatbot**:
   - Type: HTTP(s)
   - URL: http://152.67.123.45:8000/health
   - Interval: 5 minutes

### Langkah 3: Verifikasi Anti-Idle

```bash
# Cek logs keepalive
tail -f /var/log/hmif-keepalive.log

# Cek cron jobs aktif
sudo crontab -l

# Cek service running
sudo systemctl status hmif-keepalive
```

---

## 6. Setup Domain & SSL (Optional)

### Langkah 1: Beli Domain
- Hostinger, Namecheap, Niagahoster, dll
- Contoh: `hmif-univ.com`

### Langkah 2: Setting DNS
1. Login ke panel domain Anda
2. Tambah **A Record**:
   - Name: `@` atau `www`
   - Value: IP Oracle Anda (152.67.123.45)
   - TTL: 3600

### Langkah 3: Update Nginx Config

Edit `nginx.oracle.conf`:

```nginx
server {
    listen 80;
    server_name hmif-univ.com www.hmif-univ.com;
    # ...
}
```

### Langkah 4: Setup SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d hmif-univ.com -d www.hmif-univ.com

# Auto-renewal sudah otomatis
```

### Langkah 5: Restart Docker

```bash
cd /opt/hmif-platform
docker-compose -f docker-compose.oracle.yml restart
```

---

## 7. Monitoring & Maintenance

### Perintah Berguna:

```bash
# Lihat status container
docker-compose -f docker-compose.oracle.yml ps

# Lihat logs real-time
docker-compose -f docker-compose.oracle.yml logs -f

# Lihat logs backend
docker-compose -f docker-compose.oracle.yml logs -f backend

# Lihat logs chatbot
docker-compose -f docker-compose.oracle.yml logs -f chatbot

# Restart service
docker-compose -f docker-compose.oracle.yml restart

# Update aplikasi (setelah git pull)
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml up -d --build

# Backup manual
sudo bash /opt/hmif-platform/scripts/backup-uploads.sh

# Cek disk usage
df -h

# Cek memory
free -h
```

### Maintenance Rutin:

**Mingguan**:
- Cek logs error
- Cek disk space
- Cek memory usage

**Bulanan**:
- Update system: `sudo apt update && sudo apt upgrade`
- Review logs backup
- Cek resource usage

---

## 8. Troubleshooting

### Problem 1: Container tidak bisa start

```bash
# Cek error
docker-compose -f docker-compose.oracle.yml logs

# Restart dengan rebuild
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml up -d --build
```

### Problem 2: MongoDB tidak connect

```bash
# Cek network dari dalam container
docker exec -it hmif-backend /bin/sh
ping mongodb+srv://your-mongodb-uri

# Cek .env file
cat /opt/hmif-platform/.env.oracle | grep MONGODB
```

### Problem 3: Port tidak bisa diakses

```bash
# Cek firewall
sudo ufw status

# Cek security list di Oracle Console
# Ensure port 80, 443, 5000, 8000 terbuka
```

### Problem 4: VM terhapus (idle)

```bash
# Jika VM terhapus:
# 1. Buat VM baru
# 2. Jalankan setup script lagi
# 3. Restore dari backup (jika ada)

# Restore dari backup Object Storage:
oci os object get --bucket-name hmif-uploads-backup --name uploads_backup_xxx.tar.gz --file /tmp/restore.tar.gz
tar -xzf /tmp/restore.tar.gz -C /opt/hmif-platform/
```

### Problem 5: Disk penuh

```bash
# Cek disk usage
du -h /opt/hmif-platform | sort -rh | head -20

# Cleanup Docker
docker system prune -a

# Cleanup logs
sudo find /opt/hmif-platform/logs -name "*.log" -mtime +7 -delete
```

---

## 📞 Butuh Bantuan?

Jika ada masalah:

1. **Cek logs**: `docker-compose -f docker-compose.oracle.yml logs`
2. **Cek status**: `docker-compose -f docker-compose.oracle.yml ps`
3. **Restart semua**: `docker-compose -f docker-compose.oracle.yml restart`
4. **Ulang dari awal**: Hapus VM, buat baru, jalankan setup script

---

## 🎉 Selamat!

Aplikasi HMIF Platform Anda sudah live di Oracle Cloud dengan:
- ✅ Anti-idle protection (3 layer)
- ✅ Backup otomatis
- ✅ Monitoring
- ✅ SSL (jika pakai domain)
- ✅ Gratis selamanya!

**Ingat**: Pantau logs secara berkala untuk memastikan semua berjalan lancar.

---

## 📝 Catatan Penting

1. **Never expose your `.env` file** - pastikan tidak di-push ke GitHub
2. **Always backup** - walaupun ada anti-idle, backup tetap penting
3. **Monitor resource** - cek CPU/memory secara berkala
4. **Update security** - update sistem secara berkala
