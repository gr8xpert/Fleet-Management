# Bus Fleet Management System

A modern, self-hosted web application for managing a bus fleet. Built with Laravel (PHP) backend and React (Vite + TypeScript) frontend.

## Features

- **Dashboard**: Real-time overview of fleet status, upcoming expiries, and financial summary
- **Vehicle Management**: Track vehicles, mulkiya, insurance, and ownership transfers
- **Maintenance**: Log service records, schedule maintenance, manage spare parts
- **Employee Management**: Driver profiles, documents, salary tracking
- **Visa & Immigration**: Track visas, applications, and expiry alerts
- **Fines Management**: Traffic fines, assignment to drivers, payment tracking
- **Financial Module**: Expenses, income, cheques, and reporting
- **Customer Management**: Client registry and payment tracking
- **Reports**: Financial, fleet, HR, and expiry reports
- **Email Alerts**: Automatic notifications for expiring documents

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.1+)
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Database**: MySQL
- **Authentication**: Laravel Sanctum

## Project Structure

```
buses-fleet-app/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Mail/
│   │   └── Console/Commands/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env.example
│
├── frontend/                # React App
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── context/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Setup Instructions

### Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your database in `.env`:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=buses_fleet
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```

7. Create storage link:
   ```bash
   php artisan storage:link
   ```

8. Start the development server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Default Login Credentials

After running seeders, you can login with:

- **Admin**: admin@example.com / password
- **Manager**: manager@example.com / password
- **Staff**: staff@example.com / password

## Deployment to Plesk

### Backend Deployment

1. Create a subdomain for the API (e.g., api.yourdomain.com)
2. Upload the `backend/` folder contents to the subdomain
3. Set document root to `public/`
4. Create a MySQL database via Plesk
5. Update `.env` with production database credentials
6. Run via SSH or Plesk terminal:
   ```bash
   php artisan migrate --seed
   php artisan storage:link
   php artisan config:cache
   php artisan route:cache
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload the `dist/` folder contents to your main domain
3. Configure `.htaccess` for SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. Update the API URL in production build or use environment variables

## Email Notifications

Configure SMTP settings in `.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=notifications@yourdomain.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=fleet@yourdomain.com
MAIL_FROM_NAME="Bus Fleet Management"
```

### Setting Up Cron Job

Add to your server's crontab:

```bash
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

This will run daily expiry checks and send email alerts.

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/register` - Register
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user

### Dashboard
- `GET /api/dashboard` - Overview stats
- `GET /api/dashboard/expiries` - Upcoming expiries
- `GET /api/dashboard/summary` - Financial summary

### Vehicles
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/{id}` - Get vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle

### And many more...

See `routes/api.php` for the complete API documentation.

## License

MIT License
