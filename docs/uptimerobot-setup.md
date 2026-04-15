# Panduan Setup UptimeRobot untuk Anti-Idle

UptimeRobot adalah layanan monitoring gratis yang akan "ping" website Anda secara berkala, memastikan traffic masuk dan mencegah VM Oracle dianggap idle.

---

## 📋 Apa yang Dilakukan UptimeRobot?

1. ✅ **Ping website** setiap 5 menit
2. ✅ **Cek status** (200 OK atau error)
3. ✅ **Kirim alert** jika website down
4. ✅ **Buat traffic** yang mencegah idle detection Oracle

---

## 🚀 Langkah Setup

### 1. Daftar Akun

1. Buka: https://uptimerobot.com
2. Klik **"Sign Up Free"**
3. Isi email dan password
4. Verifikasi email

### 2. Dashboard

Setelah login, Anda akan melihat dashboard kosong.

### 3. Tambah Monitor Pertama (Frontend)

Klik **"+ Add New Monitor"**

**Settings**:
- **Monitor Type**: HTTP(s)
- **Friendly Name**: `HMIF Platform - Frontend`
- **URL**: `http://YOUR_IP_ADDRESS`
  - Ganti dengan IP Oracle Anda
  - Contoh: `http://152.67.123.45`
- **Monitoring Interval**: `5 minutes` (paling sering untuk free tier)
- **Monitor Timeout**: `30 seconds`

**Alert Contacts**:
- Pilih email Anda
- Atau tambahkan Discord/Telegram webhook (opsional)

Klik **"Create Monitor"**

### 4. Tambah Monitor Kedua (Backend API)

Klik **"+ Add New Monitor"** lagi

**Settings**:
- **Monitor Type**: HTTP(s)
- **Friendly Name**: `HMIF Platform - Backend API`
- **URL**: `http://YOUR_IP_ADDRESS:5000/api/health`
  - Contoh: `http://152.67.123.45:5000/api/health`
- **Monitoring Interval**: `5 minutes`

### 5. Tambah Monitor Ketiga (Chatbot API)

Klik **"+ Add New Monitor"** lagi

**Settings**:
- **Monitor Type**: HTTP(s)
- **Friendly Name**: `HMIF Platform - Chatbot API`
- **URL**: `http://YOUR_IP_ADDRESS:8000/health`
  - Contoh: `http://152.67.123.45:8000/health`
- **Monitoring Interval**: `5 minutes`

### 6. Verifikasi

Di dashboard, Anda akan melihat:
- 3 monitor aktif
- Status: **Up** (hijau)
- Response time (ms)
- Last checked

---

## 📊 Status Page (Optional)

Anda bisa buat public status page:

1. **Settings** → **Public Status Page**
2. Klik **"+ Add Public Status Page"**
3. **Page Name**: `HMIF Platform Status`
4. **Monitors**: Pilih semua 3 monitor
5. **URL**: Dapatkan link public untuk dibagikan

---

## 🔔 Alert Configuration

### Email Alert (Default)
- Sudah aktif dengan email pendaftaran
- Kirim email jika website down > 5 menit

### Discord Alert (Optional)
1. Buat webhook di Discord server Anda
2. **Settings** → **Alert Contacts** → **Add** → **Discord**
3. Paste webhook URL
4. Test webhook

### Telegram Alert (Optional)
1. Cari bot `@uptimerobot_bot`
2. Start bot dan dapatkan chat ID
3. **Settings** → **Alert Contacts** → **Add** → **Telegram**
4. Masukkan chat ID

---

## 💡 Tips & Best Practices

### 1. Interval Monitoring
- **5 minutes** = Paling baik untuk anti-idle
- **10 minutes** = Cukup untuk monitoring saja
- **1 minute** = Berbayar

### 2. Multiple Locations
UptimeRobot ping dari berbagai lokasi:
- USA
- Europe
- Asia

Ini membuat traffic terlihat lebih "realistic".

### 3. Response Time Monitoring
Lihat response time di dashboard:
- < 100ms = Excellent
- 100-500ms = Good
- > 500ms = Perlu optimasi

### 4. Maintenance Mode
Jika sedang maintenance:
1. Pause monitor sementara
2. Atau buat jadwal maintenance di advance settings

---

## 🔍 Verifikasi Anti-Idle

### Cara Cek UptimeRobot Berjalan:

1. **Dashboard** → Semua monitor show "Up" (hijau)
2. **Logs** → Lihat history ping setiap 5 menit
3. **Server logs** → Cek logs Nginx/backend ada request dari UptimeRobot

```bash
# Cek logs di server
tail -f /opt/hmif-platform/logs/nginx/access.log

# Seharusnya ada request setiap 5 menit dari IP UptimeRobot
```

### Test Manual:
1. Matikan VM sementara (stop docker)
2. Tunggu 5-10 menit
3. Check email → seharusnya dapat alert "Down"
4. Nyalakan VM lagi
5. Check email → seharusnya dapat alert "Up"

---

## ⚠️ Batasan Free Tier

- **50 monitors** maksimum
- **5 minutes** interval minimum
- **Email alerts** only
- **3 months** logs retention

Untuk HMIF Platform, ini **sudah cukup**.

---

## 🎯 Ringkasan

| Monitor | URL | Interval |
|---------|-----|----------|
| Frontend | http://YOUR_IP/ | 5 min |
| Backend | http://YOUR_IP:5000/api/health | 5 min |
| Chatbot | http://YOUR_IP:8000/health | 5 min |

**Total**: 3 ping per 5 menit = 36 ping per jam
Ini cukup untuk mencegah idle detection Oracle.

---

## ✅ Checklist

- [ ] Daftar UptimeRobot
- [ ] Tambah 3 monitor
- [ ] Konfigurasi alert email
- [ ] Verifikasi semua monitor "Up"
- [ ] (Opsional) Setup Discord/Telegram alert
- [ ] (Opsional) Buat public status page

**Selamat!** Website Anda sekanti ter-monitor 24/7 dan terlindungi dari idle detection.
