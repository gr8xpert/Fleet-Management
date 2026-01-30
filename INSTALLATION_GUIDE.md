# Bus Fleet Manager - Installation Guide

Complete guide to deploy the Bus Fleet Manager on a Plesk server.

---

## Prerequisites

- Plesk hosting panel access
- PHP 8.1+ enabled
- MySQL database
- Two subdomains (or one domain + subdomain)

---

## File Structure

```
buses-fleet-app/
├── backend/                 # Laravel API (PHP)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/              # Web root for API
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/              # Created by composer
│   ├── .env                 # Environment config
│   ├── artisan
│   ├── composer.json
│   └── composer.lock
│
└── frontend/
    └── dist/                # Built React app
        ├── index.html
        ├── config.js        # API URL configuration
        ├── .htaccess
        └── assets/
```

---

## Step 1: Create Subdomains in Plesk

### 1.1 API Subdomain
1. Login to Plesk
2. Go to **Websites & Domains**
3. Click **Add Subdomain**
4. Name: `api` (creates api.yourdomain.com)
5. Document root: Leave default

### 1.2 App Subdomain (or use main domain)
1. Click **Add Subdomain**
2. Name: `app` (creates app.yourdomain.com)
3. Document root: Leave default

---

## Step 2: Create MySQL Database

1. In Plesk, go to **Databases**
2. Click **Add Database**
3. Database name: `fleet_manager` (or any name)
4. Create database user with password
5. **Save these credentials** - you'll need them for .env file

---

## Step 3: Upload Backend Files

### 3.1 Upload Files
1. Go to **Files** for api.yourdomain.com
2. Upload ALL contents of `backend/` folder to the root
3. Structure should be:
   ```
   api.yourdomain.com/
   ├── app/
   ├── bootstrap/
   ├── config/
   ├── database/
   ├── public/
   ├── resources/
   ├── routes/
   ├── storage/
   ├── .env.example
   ├── artisan
   └── composer.json
   ```

### 3.2 Create .env File
1. Copy `.env.example` to `.env`
2. Edit `.env` with your settings:

```env
APP_NAME="Fleet Management"
APP_ENV=production
APP_KEY=base64:GENERATE_NEW_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

FRONTEND_URL=https://app.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# Email settings (optional - for notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Fleet Manager"

ALERT_EMAIL=admin@yourdomain.com
ALERT_DAYS_BEFORE=30
```

### 3.3 Generate APP_KEY
Run this Python command locally to generate a key:
```bash
python -c "import base64, os; print('base64:' + base64.b64encode(os.urandom(32)).decode())"
```
Copy the output to APP_KEY in .env

---

## Step 4: Change Document Root

**IMPORTANT: Laravel requires document root to point to /public folder**

1. Go to api.yourdomain.com dashboard
2. Click **Hosting & DNS** → **Hosting Settings**
3. Change **Document root** from:
   - `api.yourdomain.com`

   To:
   - `api.yourdomain.com/public`

4. Click **Save**

---

## Step 5: Run Composer Install

### Option A: Using Plesk PHP Composer
1. Go to api.yourdomain.com dashboard
2. Click **PHP Composer** (under Dev Tools)
3. If folder is wrong, click **[change]** and select root folder
4. Click **Install**

### Option B: Using Scheduled Tasks
1. Go to **Scheduled Tasks**
2. Add new task with command:
   ```
   cd ~/api.yourdomain.com && /opt/plesk/php/8.4/bin/php /usr/lib/plesk-9.0/composer.phar install --no-dev
   ```
3. Run once

### Option C: If you have SSH access
```bash
cd ~/api.yourdomain.com
composer install --no-dev --optimize-autoloader
```

---

## Step 6: Set Directory Permissions

1. Go to **Files** → api.yourdomain.com
2. Select **storage** folder → **More** → **Change Permissions** → Set to **777**
3. Select **bootstrap/cache** folder → **More** → **Change Permissions** → Set to **777**

If bootstrap/cache doesn't exist, create it first.

---

## Step 7: Run Database Migrations

### Create migrate.php (Temporary)

1. Go to **Files** → api.yourdomain.com → **public** folder
2. Create new file: `migrate.php`
3. Add this content:

```php
<?php
chdir('..');
echo "<pre>";
passthru('/opt/plesk/php/8.4/bin/php artisan migrate --seed --force 2>&1');
echo "</pre>";
echo "<br><b>Done! Delete this file now for security.</b>";
```

4. Save the file
5. Visit in browser: `https://api.yourdomain.com/migrate.php`
6. Wait for output showing all migrations completed
7. **DELETE migrate.php immediately!**

### Expected Output:
```
INFO  Running migrations.

0001_01_01_000000_create_users_table ............... DONE
0001_01_01_000001_create_cache_table ............... DONE
... (more tables)

INFO  Seeding database.

Database\Seeders\UserSeeder ....................... DONE
Database\Seeders\ExpenseCategorySeeder ............ DONE
Database\Seeders\IncomeCategorySeeder ............. DONE
```

---

## Step 8: Upload Frontend Files

1. Go to **Files** for app.yourdomain.com
2. Delete default files (index.html, etc.)
3. Upload ALL contents of `frontend/dist/` folder:
   ```
   app.yourdomain.com/
   ├── index.html
   ├── config.js
   ├── .htaccess
   ├── bus-icon.svg
   └── assets/
       ├── index-XXXXX.js
       └── index-XXXXX.css
   ```

---

## Step 9: Configure Frontend API URL

1. Edit `config.js` in app.yourdomain.com:

```javascript
// Configuration for Bus Fleet Management
// Change this URL to match your API server
window.FLEET_CONFIG = {
    API_URL: 'https://api.yourdomain.com/api'
};
```

---

## Step 10: Enable SSL (HTTPS)

### Option A: Cloudflare (Recommended if using Cloudflare DNS)
1. Add both subdomains to Cloudflare
2. Enable proxy (orange cloud)
3. SSL mode: Full

### Option B: Let's Encrypt via Plesk
1. Go to subdomain dashboard
2. Click **SSL/TLS Certificates**
3. Click **Install** next to Let's Encrypt
4. Enable "Redirect HTTP to HTTPS"

---

## Step 11: Test the Application

### Test API:
Visit: `https://api.yourdomain.com`

Expected response:
```json
{
  "name": "Bus Fleet Management API",
  "version": "1.0.0",
  "status": "running"
}
```

### Test Frontend:
Visit: `https://app.yourdomain.com`

Login with:
- **Email:** admin@example.com
- **Password:** password

---

## Troubleshooting

### Issue: CORS Errors on Login
**Fix:** Check .env has correct values:
```env
SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
```

### Issue: 500 Server Error
**Fix:** Check permissions:
```
storage/ → 777
bootstrap/cache/ → 777
```

### Issue: "php: command not found"
**Fix:** Use full PHP path:
```
/opt/plesk/php/8.4/bin/php artisan migrate
```
Or try: `/usr/bin/php`

### Issue: "directory must be writable"
**Fix:** Create and set permissions:
1. Create `bootstrap/cache` folder if missing
2. Set permissions to 777

### Issue: Login not working (no errors)
**Fix:** Clear browser cache and cookies, or test in incognito mode

---

## Optional: Setup Email Notifications

For expiry alerts to work, configure SMTP in .env:

### Gmail Example:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your.email@gmail.com
MAIL_PASSWORD=your_app_specific_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Fleet Manager"

ALERT_EMAIL=admin@yourdomain.com
```

**Note:** For Gmail, use an App Password (not your regular password).

### Setup Scheduled Expiry Checks:
1. Go to **Scheduled Tasks** in Plesk
2. Add new task:
   ```
   cd ~/api.yourdomain.com && /opt/plesk/php/8.4/bin/php artisan schedule:run
   ```
3. Set to run: **Every day at 8:00 AM**

---

## Default Login Credentials

After migration with seeder:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Manager | manager@example.com | password |
| Staff | staff@example.com | password |

**Change these passwords immediately after first login!**

---

## Backup Recommendations

1. **Database:** Enable automatic MySQL backups in Plesk
2. **Files:** Backup `storage/` folder (uploaded documents)
3. **Config:** Keep a copy of `.env` file securely

---

## Quick Reference Commands

```bash
# Run migrations
cd ~/api.yourdomain.com && php artisan migrate --force

# Seed database
cd ~/api.yourdomain.com && php artisan db:seed --force

# Clear cache
cd ~/api.yourdomain.com && php artisan cache:clear

# Clear config cache
cd ~/api.yourdomain.com && php artisan config:clear

# Generate new APP_KEY
cd ~/api.yourdomain.com && php artisan key:generate
```

---

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check API response in Network tab
3. Verify .env configuration
4. Check file permissions

---

## Version Info

- Laravel: 11.x
- PHP: 8.1+
- React: 18.x
- Node: 18+ (for building frontend only)
