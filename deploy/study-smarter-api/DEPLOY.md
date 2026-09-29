# VPS deploy — study-smarter-api

Production domain: **studysmarter.habittrackerapi.com**  
App port (internal): **3021** · PM2 name: **study-smarter-api** · Nginx site: **study-smarter-api**

## 1. Server prep (Ubuntu)

```bash
sudo apt update && sudo apt install -y git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. Clone app

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
git clone https://github.com/sherazkdev/studysmarter.habittrackerapi.com.git /var/www/study-smarter-api
cd /var/www/study-smarter-api
```

## 3. Environment

```bash
cp .env.example .env
nano .env
```

Required:

```env
GROQ_API_KEY=gsk_...
X_API_KEY=strong_random_client_key
GROQ_CHAT_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=qwen/qwen3.6-27b
PUBLIC_BASE_URL=https://studysmarter.habittrackerapi.com
PORT=3021
```

## 4. Build & PM2

```bash
npm ci
npm run build
pm2 start deploy/study-smarter-api/ecosystem.config.cjs
pm2 save
pm2 startup   # run the command it prints
```

Check:

```bash
curl -s http://127.0.0.1:3021/api/health
pm2 logs study-smarter-api
```

## 5. Nginx

```bash
sudo cp deploy/study-smarter-api/study-smarter-api.conf /etc/nginx/sites-available/study-smarter-api
sudo ln -sf /etc/nginx/sites-available/study-smarter-api /etc/nginx/sites-enabled/study-smarter-api
sudo nginx -t
sudo systemctl reload nginx
```

DNS **A record** → VPS IP for `studysmarter.habittrackerapi.com`.

## 6. SSL (next step)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d studysmarter.habittrackerapi.com
```

Then set in `.env`:

```env
PUBLIC_BASE_URL=https://studysmarter.habittrackerapi.com
```

Restart PM2 if you change env:

```bash
pm2 restart study-smarter-api
```

## 7. Updates (pull & rebuild)

```bash
cd /var/www/study-smarter-api
git pull origin main
npm ci
npm run build
pm2 restart study-smarter-api
```

## Ports

| Port | Use |
|------|-----|
| **3021** | Next.js (PM2, localhost only) |
| **80** | Nginx → proxy to 3021 |
| **443** | HTTPS after certbot |

Free port check:

```bash
sudo ss -tlnp | grep -E ':3021'
```
