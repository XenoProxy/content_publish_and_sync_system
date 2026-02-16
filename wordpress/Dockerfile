FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip curl git less default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && apt-get clean

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

WORKDIR /var/www

COPY . /var/www

RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer \
    && composer install --no-interaction --no-progress

EXPOSE 9000
CMD ["php-fpm"]
