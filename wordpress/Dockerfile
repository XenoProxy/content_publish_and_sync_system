FROM php:8.2-fpm

# Устанавливаем необходимые пакеты
RUN apt-get update && apt-get install -y unzip git curl libzip-dev && docker-php-ext-install zip pdo_mysql

WORKDIR /var/www

# Копируем весь проект Bedrock
COPY . /var/www

# Устанавливаем Composer и зависимости WordPress/Bedrock
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-interaction --no-progress

# Expose порт PHP-FPM
EXPOSE 9000

# Healthcheck для Compose, ждём пока index.php доступен
HEALTHCHECK --interval=5s --timeout=3s --retries=5 \
  CMD curl -f http://localhost/web/index.php || exit 1

# Запуск PHP-FPM
CMD ["php-fpm"]
