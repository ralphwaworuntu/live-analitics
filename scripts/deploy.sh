#!/bin/bash
# ============================================
# SENTINEL — Server Initial Setup Script
# Biro Operasi Polda NTT
# ============================================
# Jalankan di VPS GPU baru:
#   chmod +x scripts/deploy.sh && sudo ./scripts/deploy.sh
# ============================================

set -euo pipefail

echo "============================================"
echo "🛡️  SENTINEL Command Center — Initial Setup"
echo "    Biro Operasi Polda NTT"
echo "============================================"

# 1. System Update
echo "📦 [1/7] Updating system packages..."
apt-get update && apt-get upgrade -y

# 2. Install Docker
echo "🐳 [2/7] Installing Docker Engine..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully."
else
    echo "Docker already installed."
fi

# 3. Install Docker Compose Plugin
echo "🔧 [3/7] Verifying Docker Compose..."
docker compose version || {
    apt-get install -y docker-compose-plugin
}

# 4. Install NVIDIA Container Toolkit (for GPU/Ollama)
echo "🎮 [4/7] Installing NVIDIA Container Toolkit..."
if command -v nvidia-smi &> /dev/null; then
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
    curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
        sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
    apt-get update
    apt-get install -y nvidia-container-toolkit
    nvidia-ctk runtime configure --runtime=docker
    systemctl restart docker
    echo "NVIDIA runtime configured."
else
    echo "⚠️  No NVIDIA GPU detected. Ollama will run in CPU mode (slower)."
fi

# 5. Setup Firewall
echo "🔥 [5/7] Configuring UFW Firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo "Firewall active: Only SSH, HTTP, HTTPS allowed."

# 6. Create directories
echo "📁 [6/7] Creating directories..."
mkdir -p /opt/sentinel/backups
mkdir -p /opt/sentinel/logs

# 7. Instructions
echo ""
echo "============================================"
echo "✅ Server siap! Langkah selanjutnya:"
echo "============================================"
echo ""
echo "  1. Clone repo proyek:"
echo "     git clone <repo-url> /opt/sentinel/app"
echo ""
echo "  2. Konfigurasi environment:"
echo "     cd /opt/sentinel/app"
echo "     cp .env.production .env"
echo "     nano .env   # Isi semua variabel"
echo ""
echo "  3. Setup SSL (pertama kali):"
echo "     # Edit nginx/sentinel.conf → ganti domain"
echo "     # Jalankan certbot terpisah dulu:"
echo "     docker run --rm -v letsencrypt:/etc/letsencrypt \\"
echo "       -v certbot_www:/var/www/certbot \\"
echo "       certbot/certbot certonly --webroot \\"
echo "       -w /var/www/certbot \\"
echo "       -d sentinel.poldantt.polri.go.id"
echo ""
echo "  4. Deploy:"
echo "     docker compose up -d --build"
echo ""
echo "  5. Pull AI Model (pertama kali):"    
echo "     docker exec -it sentinel-ollama-1 ollama pull llama3:8b"
echo ""
echo "  6. Seed database:"
echo "     docker exec -it sentinel-api-1 python seed.py"
echo ""
echo "  7. Setup auto-backup:"
echo "     crontab -e"
echo "     # 0 2 * * * /opt/sentinel/app/scripts/backup.sh"
echo ""
echo "============================================"
echo "🛡️  SENTINEL siap beroperasi."
echo "============================================"
