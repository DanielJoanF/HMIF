#!/usr/bin/env bash
# ============================================================
# HMIF auto-deployer (dijalankan via cron tiap 5 menit)
#
# Alur: cek update di GitHub main (repo publik, tanpa auth)
#   -> kalau ada: pull kode, pull image GHCR, compose up
#   -> health check; gagal? rollback ke image "prev"
# ============================================================
set -uo pipefail

DIR="/home/niel/projects/hmif"
MARKER="/home/niel/.hmif-deploy-sha"
LOG="/home/niel/hmif-deploy.log"
IMG="ghcr.io/danieljoanf"
SERVICES="frontend backend chatbot"

log() { echo "[$(date '+%F %T')] $*" >> "$LOG"; }

# Lock: cegah 2 deploy jalan bareng
exec 9>"$DIR/.deploy.lock" || exit 0
flock -n 9 || { log "skip: deploy lain masih jalan"; exit 0; }

cd "$DIR" || exit 0

# Cek update dari GitHub
git fetch origin main 2>>"$LOG" || { log "ERR: git fetch gagal"; exit 0; }
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

[ -z "$REMOTE" ] && { log "ERR: gak bisa baca origin/main"; exit 0; }
[ "$LOCAL" = "$REMOTE" ] && exit 0   # gak ada perubahan -> diam

log "UPDATE: ${LOCAL:0:7} -> ${REMOTE:0:7}"

# Simpan image lama buat rollback
for s in $SERVICES; do
  docker tag "$IMG/hmif-$s:latest" "$IMG/hmif-$s:prev" 2>/dev/null || true
done

git pull --ff-only origin main 2>>"$LOG" || { log "ERR: git pull gagal (ada perubahan lokal?)"; exit 0; }

docker compose pull 2>>"$LOG" || { log "ERR: docker compose pull gagal"; exit 0; }
docker compose up -d 2>>"$LOG" || { log "ERR: docker compose up gagal — rollback"; rollback; exit 0; }

# Health check (frontend nginx -> proxy /api -> backend)
OK=0
for i in $(seq 1 12); do
  sleep 5
  if curl -fsS --max-time 8 "http://127.0.0.1:8085/api/health" >/dev/null 2>&1; then
    OK=1; break
  fi
done

if [ "$OK" = "1" ]; then
  echo "$REMOTE" > "$MARKER"
  log "DEPLOY OK ($REMOTE)"
else
  log "HEALTH CHECK GAGAL — rollback ke image prev"
  for s in $SERVICES; do
    docker tag "$IMG/hmif-$s:prev" "$IMG/hmif-$s:latest" 2>/dev/null || true
  done
  docker compose up -d 2>>"$LOG" || true
  log "ROLLBACK selesai"
fi
