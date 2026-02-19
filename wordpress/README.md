# Content Publish & Sync System

Полноценная headless CMS-система для медиа-компании.

Проект реализует архитектуру, в которой:

-   Контент поступает из внешнего REST API
-   Синхронизируется в WordPress (Bedrock)
-   Хранится в кастомной таблице
-   Публикуется редакторами через Gutenberg-блок
-   Отображается на публичном фронтенде (Next.js)
-   Разворачивается как единая инфраструктура в Docker

Система спроектирована как единое целое, где backend, frontend и
инфраструктура интегрированы между собой.

------------------------------------------------------------------------

# Архитектура системы

## Сервисы

-   `wordpress` --- Bedrock + плагин `content-sync-manager`
-   `mysql` --- база данных
-   `nextjs` --- публичный фронтенд (App Router, TypeScript)
-   `nginx` --- reverse proxy

Все сервисы работают в одной Docker network.

------------------------------------------------------------------------

# Часть 1 --- WordPress Backend (Bedrock)

## 1.1 Плагин `content-sync-manager`

Центральный компонент системы.

Расположение:

    wordpress/web/app/plugins/content-sync-manager

------------------------------------------------------------------------

## Синхронизация с внешним API

Источник данных:

    https://jsonplaceholder.typicode.com/posts

### Реализовано

-   Инкрементальная синхронизация (только новые или изменённые записи)
-   Retry logic: 3 попытки с exponential backoff
-   Graceful degradation при недоступности API
-   Логирование ошибок в debug.log

------------------------------------------------------------------------

## Кастомная таблица

Название:

    wp_content_sync_posts

Структура:

  Поле          Описание
  ------------- --------------------
  id            внутренний ID
  external_id   ID во внешнем API
  user_id       ID автора
  title         заголовок
  body          текст
  synced_at     дата синхронизации
  status        draft / published

Реализованы индексы на `external_id`, `user_id`, `synced_at`.

⚠ Стандартные WordPress посты НЕ используются для хранения
синхронизированного контента.

------------------------------------------------------------------------

## Механизм синхронизации

### Автоматическая

-   WP-Cron
-   каждые 15 минут

### Ручная через WP-CLI

``` bash
wp content-sync sync --force
```

В Docker:

``` bash
docker exec -it content_wordpress wp content-sync sync --force
```

------------------------------------------------------------------------

## REST API

Namespace:

    /wp-json/content-sync/v1/

Поддержка:

-   Пагинация (`page`, `per_page` ≤ 50)
-   Фильтрация (`user_id`, `status`)
-   Сортировка (`orderby=id|synced_at`, `order=asc|desc`)
-   Поиск (`search`)
-   Rate limiting --- 120 запросов/минуту
-   Кэширование --- 5 минут

------------------------------------------------------------------------

## Публикация поста

1.  Данные хранятся в кастомной таблице.
2.  Через Gutenberg-блок редактор выбирает запись.
3.  Создаётся WordPress post со статусом `draft`.
4.  Добавляется meta `_content_sync_id`.
5.  При публикации:
    -   статус в кастомной таблице меняется на `published`
    -   обновляется `published_at`
    -   очищается кэш REST API

------------------------------------------------------------------------

# 1.2 Gutenberg блок `content-sync-preview`

-   Нативный React
-   Использует `@wordpress/block-editor` и `@wordpress/components`
-   Работает в редакторе и на фронтенде
-   Loading state и error handling
-   Использует тот же REST API, что и Next.js

Настройки:

-   Количество постов (1--20)
-   Фильтр по `user_id`
-   Статус
-   Стиль отображения
-   Кнопка синхронизации

------------------------------------------------------------------------

# Часть 2 --- Next.js Frontend

## Главная страница `/`

-   SSR
-   10 последних опубликованных постов

## `/posts`

-   SSR
-   Пагинация
-   Фильтрация
-   Debounced search (≥300ms)
-   Client-side navigation

## `/posts/[id]`

-   ISR (revalidate 3600)
-   Fallback: blocking
-   Open Graph
-   Twitter Cards
-   JSON-LD Article

------------------------------------------------------------------------

# DevOps

## Docker

Сервисы:

-   wordpress
-   mysql
-   nextjs
-   nginx

Реализовано:

-   Общая сеть
-   Volumes
-   Переменные окружения
-   Health checks
-   Next.js ждёт готовности WordPress API

------------------------------------------------------------------------

# Развёртывание

## Требования

-   Docker
-   Docker Compose

## Запуск

``` bash
docker compose up --build
```

## Доступ

Frontend: http://localhost

WordPress: http://localhost/wp/wp-admin

REST API: http://localhost/wp-json/content-sync/v1/posts

------------------------------------------------------------------------

# Проверка

``` bash
docker exec -it content_wordpress wp content-sync sync --force
```

------------------------------------------------------------------------

# Заключение

Проект реализует полноценную headless-архитектуру с изолированной
системой хранения контента, REST API, SSR/ISR фронтендом и
Docker-инфраструктурой.
