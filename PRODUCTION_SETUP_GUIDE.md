# ZoeFlock Admin - Production Setup Guide

## 🚀 Backend Production Configuration

### 1. Environment Configuration (.env)

The most critical step is configuring your `.env` file for production. Here are the key changes needed:

#### **Critical Production Settings:**

```bash
# Change from local to production
APP_ENV=production
APP_DEBUG=false

# Update URLs to use HTTPS
APP_URL=https://zoeflockadmin.org
FRONTEND_URL=https://zoeflockadmin.org

# Enable session encryption
SESSION_ENCRYPT=true
SESSION_DOMAIN=.zoeflockadmin.org

# Set proper log level
LOG_LEVEL=error

# Configure CORS for production domains
CORS_ALLOWED_ORIGINS=https://zoeflockadmin.org,https://www.zoeflockadmin.org
SANCTUM_STATEFUL_DOMAINS=zoeflockadmin.org,www.zoeflockadmin.org

# Disable Swagger generation in production
L5_SWAGGER_GENERATE_ALWAYS=false
```

#### **Email Configuration:**

```bash
# Configure SMTP for production emails
MAIL_MAILER=smtp
MAIL_HOST=smtp.your-domain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@zoeflockadmin.org
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@zoeflockadmin.org"
```

### 2. Database Configuration

Your database settings look good, but ensure:

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sql_zoeflockadmi
DB_USERNAME=sql_zoeflockadmi
DB_PASSWORD="c55190cf55b5f"
```

### 3. Production Deployment Steps

#### **Step 1: Update Environment File**
```bash
cd /www/wwwroot/projects/ZoeFlockAdmin/backend
cp .env.production .env
```

#### **Step 2: Install Dependencies**
```bash
composer install --no-dev --optimize-autoloader
```

#### **Step 3: Generate Application Key**
```bash
php artisan key:generate --force
```

#### **Step 4: Run Migrations**
```bash
php artisan migrate --force
```

#### **Step 5: Cache Configuration**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

#### **Step 6: Set Permissions**
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 4. Web Server Configuration

#### **Nginx Configuration**
Create `/etc/nginx/sites-available/zoeflockadmin`:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name zoeflockadmin.org www.zoeflockadmin.org;
    root /www/wwwroot/projects/ZoeFlockAdmin/backend/public;

    # SSL Configuration (if using HTTPS)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/zoeflockadmin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Queue Worker Setup

#### **Create Queue Worker Service**
Create `/etc/systemd/system/zoeflockadmin-worker.service`:

```ini
[Unit]
Description=ZoeFlock Admin Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /www/wwwroot/projects/ZoeFlockAdmin/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
WorkingDirectory=/www/wwwroot/projects/ZoeFlockAdmin/backend

[Install]
WantedBy=multi-user.target
```

#### **Start Queue Worker**
```bash
sudo systemctl enable zoeflockadmin-worker
sudo systemctl start zoeflockadmin-worker
```

### 6. Scheduled Tasks Setup

#### **Add to Crontab**
```bash
sudo crontab -e
```

Add this line:
```bash
* * * * * cd /www/wwwroot/projects/ZoeFlockAdmin/backend && php artisan schedule:run >> /dev/null 2>&1
```

### 7. Security Considerations

#### **File Permissions**
```bash
# Set proper permissions
find /www/wwwroot/projects/ZoeFlockAdmin/backend -type f -exec chmod 644 {} \;
find /www/wwwroot/projects/ZoeFlockAdmin/backend -type d -exec chmod 755 {} \;
chmod -R 775 storage bootstrap/cache
```

#### **Environment Security**
- Never commit `.env` files to version control
- Use strong database passwords
- Enable HTTPS in production
- Regularly update dependencies

### 8. Monitoring & Logs

#### **Log Files Location**
- Application logs: `/www/wwwroot/projects/ZoeFlockAdmin/backend/storage/logs/`
- Nginx logs: `/var/log/nginx/`
- PHP-FPM logs: `/var/log/php8.2-fpm.log`

#### **Health Check Endpoint**
Your API has health check endpoints available at:
- `/api/v1/health` - Basic health check
- `/api/v1/status` - Detailed status

### 9. Backup Strategy

#### **Database Backup**
```bash
# Create backup script
cat > /usr/local/bin/backup-zoeflockadmin.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/zoeflockadmin"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u sql_zoeflockadmi -p'c55190cf55b5f' sql_zoeflockadmi > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /www/wwwroot/projects/ZoeFlockAdmin/backend

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-zoeflockadmin.sh
```

#### **Schedule Backups**
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * /usr/local/bin/backup-zoeflockadmin.sh
```

### 10. Performance Optimization

#### **PHP-FPM Configuration**
Update `/etc/php/8.2/fpm/pool.d/www.conf`:
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 1000
```

#### **OPcache Configuration**
Add to `/etc/php/8.2/fpm/conf.d/10-opcache.ini`:
```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
```

### 11. Deployment Checklist

- [ ] Update `.env` file with production settings
- [ ] Install production dependencies (`composer install --no-dev`)
- [ ] Run database migrations
- [ ] Cache configuration and routes
- [ ] Set proper file permissions
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up queue workers
- [ ] Configure scheduled tasks (cron)
- [ ] Set up SSL certificates
- [ ] Configure email settings
- [ ] Set up monitoring and logging
- [ ] Create backup strategy
- [ ] Test all functionality
- [ ] Update DNS records

### 12. Troubleshooting

#### **Common Issues:**

1. **Permission Errors**
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   ```

2. **Cache Issues**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

3. **Queue Not Processing**
   ```bash
   sudo systemctl status zoeflockadmin-worker
   sudo systemctl restart zoeflockadmin-worker
   ```

4. **Database Connection Issues**
   - Check database credentials in `.env`
   - Ensure MySQL service is running
   - Verify database exists

### 13. Maintenance Commands

```bash
# Clear all caches
php artisan optimize:clear

# Re-optimize for production
php artisan optimize

# Check application status
php artisan about

# Run health checks
php artisan health:check
```

---

## 🎯 Quick Start Commands

```bash
# 1. Update environment
cp .env.production .env

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Run migrations
php artisan migrate --force

# 4. Optimize for production
php artisan optimize

# 5. Set permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

Your backend will be production-ready! 🚀
