FROM php:8.2-fpm

WORKDIR /var/www

COPY . /var/www

RUN apt-get update && apt-get install -y unzip git \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && composer install

EXPOSE 9000

# Healthcheck для PHP-FPM
HEALTHCHECK --interval=5s --timeout=3s --retries=5 CMD curl -f http://localhost/web/index.php || exit 1

CMD ["php-fpm"]
