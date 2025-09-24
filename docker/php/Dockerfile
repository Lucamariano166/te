FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libicu-dev \
    default-mysql-client \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Update Apache configuration
RUN echo 'ServerName localhost' >> /etc/apache2/apache2.conf && \
    echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/webroot\n\
    <Directory /var/www/html/webroot>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Create entrypoint script
RUN echo '#!/bin/bash\n\
# Wait for MySQL to be ready\n\
echo "Waiting for MySQL to be ready..."\n\
for i in {1..30}; do\n\
    if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --skip-ssl -e "SELECT 1" &>/dev/null; then\n\
        echo "MySQL is ready!"\n\
        break\n\
    fi\n\
    echo "MySQL not ready, waiting... ($i/30)"\n\
    sleep 3\n\
done\n\
\n\
# Install/update composer dependencies\n\
composer install --optimize-autoloader --no-interaction\n\
\n\
# Copy environment file if it does not exist\n\
if [ ! -f "config/.env" ]; then\n\
    cp config/.env.example config/.env\n\
fi\n\
\n\
# Create logs directory if it does not exist\n\
mkdir -p logs\n\
\n\
# Set permissions\n\
chmod -R 777 tmp logs\n\
\n\
# Run migrations\n\
bin/cake migrations migrate\n\
\n\
# Run seeds if they exist\n\
if [ -d "config/Seeds" ] && [ "$(ls -A config/Seeds)" ]; then\n\
    bin/cake migrations seed\n\
fi\n\
\n\
# Start Apache\n\
apache2-foreground' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]