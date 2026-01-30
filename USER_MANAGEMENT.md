# User Management Guide

## Method 1: Through the App (Recommended)

### Update Your Own Profile/Password
1. Login to the app at `https://app.ramzangroupdip.com`
2. Click **Settings** in the sidebar
3. Update your profile information or password
4. Click Save

### Manage Other Users (Admin Only)
1. Login as admin
2. Go to **Settings** → **User Management** (if available)
3. Add, edit, or deactivate users

---

## Method 2: Database Direct (phpMyAdmin/Plesk)

### Update Password
```sql
-- Set password to 'password'
UPDATE users
SET password = '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@example.com';
```

### Create New User
```sql
INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
VALUES (
    'New User',
    'user@example.com',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password: 'password'
    'admin',  -- Options: admin, manager, staff
    1,
    NOW(),
    NOW()
);
```

### List All Users
```sql
SELECT id, name, email, role, is_active FROM users;
```

### Deactivate User
```sql
UPDATE users SET is_active = 0 WHERE email = 'user@example.com';
```

### Delete User
```sql
DELETE FROM users WHERE email = 'user@example.com';
```

---

## Method 3: PHP Script (Temporary Upload)

### Update User Script
Create `update-user.php` in `api.ramzangroupdip.com/public/`:

```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

// === EDIT THESE VALUES ===
$email = 'admin@example.com';
$newPassword = 'your-new-password';
$newName = '';  // Leave empty to keep current
// =========================

$user = \App\Models\User::where('email', $email)->first();

if (!$user) {
    die("User not found! Existing users:\n" .
        \App\Models\User::pluck('email')->implode("\n"));
}

if ($newPassword) {
    $user->password = bcrypt($newPassword);
}
if ($newName) {
    $user->name = $newName;
}
$user->save();

echo "User updated successfully!\n";
echo "DELETE THIS FILE NOW!";
```

### Create User Script
Create `create-user.php` in `api.ramzangroupdip.com/public/`:

```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

// === EDIT THESE VALUES ===
$name = 'New Admin';
$email = 'newadmin@example.com';
$password = 'secure-password';
$role = 'admin';  // admin, manager, staff
// =========================

if (\App\Models\User::where('email', $email)->exists()) {
    die("User with email '$email' already exists!");
}

\App\Models\User::create([
    'name' => $name,
    'email' => $email,
    'password' => bcrypt($password),
    'role' => $role,
    'is_active' => true,
]);

echo "User created successfully!\n";
echo "Email: $email\n";
echo "Password: $password\n";
echo "\nDELETE THIS FILE NOW!";
```

### List Users Script
Create `list-users.php` in `api.ramzangroupdip.com/public/`:

```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

echo "<pre>";
echo "ID\tName\t\t\tEmail\t\t\t\tRole\t\tActive\n";
echo str_repeat("-", 80) . "\n";

$users = \App\Models\User::all();
foreach ($users as $user) {
    $active = $user->is_active ? 'Yes' : 'No';
    echo "{$user->id}\t{$user->name}\t\t{$user->email}\t\t{$user->role}\t\t{$active}\n";
}
echo "</pre>";
```

---

## Method 4: Laravel Artisan (SSH Access Required)

If you have SSH access to the server:

### Tinker (Interactive)
```bash
cd /var/www/vhosts/ramzangroupdip.com/api.ramzangroupdip.com
php artisan tinker
```

Then in tinker:
```php
// Update password
$user = User::where('email', 'admin@example.com')->first();
$user->password = bcrypt('new-password');
$user->save();

// Create user
User::create([
    'name' => 'New User',
    'email' => 'user@example.com',
    'password' => bcrypt('password'),
    'role' => 'admin',
    'is_active' => true,
]);

// List users
User::all(['id', 'name', 'email', 'role', 'is_active']);
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all features including user management |
| `manager` | Access to most features, cannot manage users |
| `staff` | Limited access, view-only for sensitive data |

---

## Default Demo Users

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | admin |
| manager@example.com | password | manager |
| staff@example.com | password | staff |

---

## Security Notes

1. **Always delete PHP scripts** after using them
2. **Use strong passwords** (min 8 chars, mix of letters, numbers, symbols)
3. **Change default passwords** immediately after installation
4. **Deactivate users** instead of deleting to preserve audit logs
5. **Review user list** periodically and remove unused accounts

---

## Troubleshooting

### "Invalid credentials" error
- Check if user exists in database
- Verify password is hashed with bcrypt
- Ensure `is_active = 1`

### Can't login after password change
- Clear browser cache and cookies
- Try incognito/private window
- Verify password was saved correctly

### Forgot admin password
- Use Method 2 (SQL) or Method 3 (PHP script) to reset
