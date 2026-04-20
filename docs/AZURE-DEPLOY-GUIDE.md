# 🚀 Deploy HMIF Platform ke Microsoft Azure (Azure for Students)

Panduan lengkap untuk deploy 3 services HMIF Platform ke Azure menggunakan akun Azure for Students ($100 kredit gratis, tanpa kartu kredit).

## Arsitektur Deployment

```
┌──────────────────────────────────────┐
│    Azure Static Web Apps (GRATIS)    │ ← React Frontend (Vite build)
│    Auto-deploy dari GitHub           │
└──────────────┬───────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│ Azure App   │  │ Azure App  │
│ Service #1  │  │ Service #2 │
│ (Node.js)   │  │ (Python)   │
│ Express API │  │ Chatbot API│
└──────┬──────┘  └────────────┘
       │
┌──────▼──────────────────────────────┐
│    MongoDB Atlas (Free Tier)        │ ← Database (gratis, sudah ada)
└─────────────────────────────────────┘
```

---

## Prasyarat

- ✅ Akun Azure for Students (sudah login)
- ✅ Repository di GitHub
- ✅ Azure CLI terinstall (opsional, bisa pakai Portal)
- ✅ MongoDB Atlas connection string

---

## Step 1: Deploy Frontend — Azure Static Web Apps

Azure Static Web Apps **gratis** dan otomatis deploy dari GitHub.

### Via Azure Portal:

1. Buka **[portal.azure.com](https://portal.azure.com)**
2. Klik **"Create a resource"** → cari **"Static Web Apps"**
3. Klik **Create** dan isi:

| Field | Value |
|---|---|
| Subscription | Azure for Students |
| Resource Group | `hmif-platform-rg` (buat baru) |
| Name | `hmif-platform-frontend` |
| Plan type | **Free** |
| Region | **East Asia** (terdekat ke Indonesia) |
| Source | **GitHub** |
| Organization | *(akun GitHub kamu)* |
| Repository | `hmif-platform` |
| Branch | `main` |

4. Di bagian **Build Details**:

| Field | Value |
|---|---|
| Build Preset | **React** |
| App location | `/` |
| Api location | *(kosongkan)* |
| Output location | `dist` |

5. Klik **Review + Create** → **Create**

Azure akan otomatis membuat GitHub Action workflow (`.github/workflows/`) untuk CI/CD.

### Tambahkan Environment Variables:

Setelah Static Web App dibuat:
1. Buka resource → **Settings** → **Configuration**
2. Tambahkan:

```
VITE_API_URL = https://<nama-app-service-backend>.azurewebsites.net/api
VITE_CHATBOT_API_URL = https://<nama-app-service-chatbot>.azurewebsites.net
```

> **⚠️ PENTING:** URL ini baru bisa diisi setelah Step 2 & 3 selesai.
> Kamu perlu kembali ke sini dan update setelah backend & chatbot di-deploy.

---

## Step 2: Deploy Backend API — Azure App Service (Node.js)

### Via Azure Portal:

1. **Create a resource** → cari **"App Service"** → **Create** → **Web App**
2. Isi:

| Field | Value |
|---|---|
| Subscription | Azure for Students |
| Resource Group | `hmif-platform-rg` (yang sama) |
| Name | `hmif-platform-api` |
| Publish | **Code** |
| Runtime stack | **Node 20 LTS** |
| Operating System | **Linux** |
| Region | **East Asia** |
| Pricing plan | **Free F1** |

3. Klik **Review + Create** → **Create**

### Configure Deployment:

1. Buka resource `hmif-platform-api`
2. **Deployment Center** → Source: **GitHub**
3. Pilih repository `hmif-platform`, branch `main`
4. Azure akan membuat GitHub Action

### Konfigurasi Startup:

Karena backend ada di folder `server/`, kamu perlu set startup command:

1. Buka **Settings** → **Configuration** → **General settings**
2. Set **Startup Command**:
```
cd server && npm install && npm start
```

### Set Environment Variables:

1. **Settings** → **Configuration** → **Application settings**
2. Tambahkan:

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `MONGODB_URI` | `mongodb+srv://...` (connection string MongoDB Atlas kamu) |
| `ADMIN_PASSWORD` | *(password admin kamu)* |
| `CHATBOT_SERVICE_URL` | `https://hmif-platform-chatbot.azurewebsites.net` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

3. Klik **Save** → **Continue**

---

## Step 3: Deploy Chatbot API — Azure App Service (Python)

### Via Azure Portal:

1. **Create a resource** → **App Service** → **Web App**
2. Isi:

| Field | Value |
|---|---|
| Subscription | Azure for Students |
| Resource Group | `hmif-platform-rg` |
| Name | `hmif-platform-chatbot` |
| Publish | **Code** |
| Runtime stack | **Python 3.11** |
| Operating System | **Linux** |
| Region | **East Asia** |
| Pricing plan | **Free F1** (atau **B1** jika F1 sudah terpakai) |

3. Klik **Review + Create** → **Create**

### Configure Deployment:

1. Buka resource `hmif-platform-chatbot`
2. **Deployment Center** → Source: **GitHub**
3. Pilih repository dan branch

### Konfigurasi Startup:

1. **Settings** → **Configuration** → **General settings**
2. Set **Startup Command**:
```
cd chatbot-api && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000
```

### Set Environment Variables:

1. **Settings** → **Configuration** → **Application settings**
2. Tambahkan:

| Name | Value |
|---|---|
| `GROQ_API_KEY` | `gsk_...` (API key Groq kamu) |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

3. Klik **Save**

---

## Step 4: Update Frontend Environment Variables

Sekarang semua service sudah di-deploy, kembali ke **Static Web App**:

1. Buka `hmif-platform-frontend` → **Configuration**
2. Update:

```
VITE_API_URL = https://hmif-platform-api.azurewebsites.net/api
VITE_CHATBOT_API_URL = https://hmif-platform-chatbot.azurewebsites.net
```

3. **Save** & redeploy frontend (push commit kosong atau trigger di GitHub Actions)

---

## Step 5: Verifikasi

Cek semua service berjalan:

| Service | URL | Expected |
|---|---|---|
| Frontend | `https://<nama>.azurestaticapps.net` | Halaman HMIF muncul |
| Backend API | `https://hmif-platform-api.azurewebsites.net/api/health` | `{"status":"OK"}` |
| Chatbot API | `https://hmif-platform-chatbot.azurewebsites.net/health` | `{"status":"ok"}` |

---

## Estimasi Biaya

| Service | Tier | Biaya/bulan |
|---|---|---|
| Static Web Apps | Free | **$0** |
| App Service (Backend) | F1 Free | **$0** |
| App Service (Chatbot) | F1 Free / B1 | **$0 / ~$13** |
| MongoDB Atlas | M0 Free | **$0** |
| **Total** | | **$0 – $13/bulan** |

> Dengan kredit $100 dari Azure for Students, kamu bisa jalankan platform ini **gratis selama 7+ bulan** bahkan jika pakai tier B1.

---

## Troubleshooting

### Frontend tidak bisa konek ke API
- Pastikan environment variables `VITE_API_URL` sudah benar
- Pastikan CORS di backend sudah mengizinkan domain frontend

### Backend error "Cannot find module"
- Pastikan startup command benar: `cd server && npm install && npm start`
- Cek log di **App Service** → **Log stream**

### Chatbot API tidak respond
- Cek **Log stream** di Azure Portal
- Pastikan `GROQ_API_KEY` sudah diset
- Pastikan startup command benar

### Melihat Log
1. Buka App Service → **Monitoring** → **Log stream**
2. Atau via Azure CLI:
```bash
az webapp log tail --name hmif-platform-api --resource-group hmif-platform-rg
```

---

## Tips

- **Custom Domain**: Bisa tambahkan custom domain gratis di Static Web Apps
- **SSL**: Otomatis gratis (HTTPS) untuk semua Azure services
- **Auto-deploy**: Setiap push ke `main` branch akan otomatis deploy
- **Monitoring**: Gunakan **Application Insights** (gratis) untuk monitoring
