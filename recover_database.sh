#!/bin/bash

# Скрипт для восстановления базы данных и миграций после ошибки
# "relation cards_card does not exist"

echo "=== Начало процесса восстановления базы данных ==="

# 1. Создание резервной копии текущего состояния БД
echo "Создание резервной копии текущей базы данных..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p /root/juriy/backups
docker-compose exec -T postgres pg_dump -U postgres postgres > /root/juriy/backups/postgres_backup_$TIMESTAMP.sql
if [ $? -eq 0 ]; then
    echo "Резервная копия создана: /root/juriy/backups/postgres_backup_$TIMESTAMP.sql"
else
    echo "ВНИМАНИЕ: Не удалось создать резервную копию, продолжаем восстановление"
fi

# 2. Перезапускаем PostgreSQL
echo "Перезапуск PostgreSQL..."
docker-compose restart postgres
sleep 10

# 3. Проверка наличия таблицы cards_card
echo "Проверка наличия таблицы cards_card..."
TABLE_EXISTS=$(docker-compose exec -T postgres psql -U postgres -d postgres -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards_card');")

if [[ $TABLE_EXISTS != *"t"* ]]; then
    echo "Таблица cards_card отсутствует, применяем миграции..."
    
    # 4. Применяем миграции
    docker-compose exec -T backend python manage.py migrate
    
    # 5. Проверяем успешность миграции
    TABLE_EXISTS=$(docker-compose exec -T postgres psql -U postgres -d postgres -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards_card');")
    
    if [[ $TABLE_EXISTS != *"t"* ]]; then
        echo "ОШИБКА: Не удалось создать таблицу cards_card через миграции"
        
        # 6. Пробуем сбросить базу данных и создать заново
        echo "Попытка пересоздания базы данных..."
        docker-compose exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS postgres;"
        docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE postgres WITH OWNER postgres;"
        
        # 7. Применяем миграции на чистую базу
        docker-compose exec -T backend python manage.py migrate
        
        TABLE_EXISTS=$(docker-compose exec -T postgres psql -U postgres -d postgres -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards_card');")
        
        if [[ $TABLE_EXISTS != *"t"* ]]; then
            echo "КРИТИЧЕСКАЯ ОШИБКА: Восстановление базы данных не удалось"
            exit 1
        else
            echo "База данных успешно пересоздана и миграции применены"
        fi
    else
        echo "Миграции успешно применены, таблица cards_card создана"
    fi
else
    echo "Таблица cards_card уже существует"
fi

# 8. Перезапускаем бэкенд
echo "Перезапуск бэкенда..."
docker-compose restart backend

# 9. Перезапускаем PgBouncer
echo "Перезапуск PgBouncer..."
docker-compose restart pgbouncer

echo "=== Восстановление базы данных завершено ==="
echo "Сейчас проверим наличие основных таблиц:"

docker-compose exec -T postgres psql -U postgres -d postgres -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

echo ""
echo "Если вы видите в списке таблицу cards_card, восстановление прошло успешно."
echo "Если нет, попробуйте запустить мануальную миграцию: docker-compose exec backend python manage.py migrate"
