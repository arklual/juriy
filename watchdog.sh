#!/bin/bash

# Скрипт для мониторинга и автоматического перезапуска контейнеров при необходимости
LOG_FILE="/root/juriy/watchdog.log"

echo "$(date): Container watchdog started" >> $LOG_FILE

# Функция для проверки и восстановления
check_and_rebuild() {
    # Проверяем состояние контейнеров
    echo "$(date): Checking container status..." >> $LOG_FILE
    
    # Проверяем состояние postgres
    if ! docker-compose ps postgres | grep -q "Up" ; then
        echo "$(date): Postgres container is down. Restarting..." >> $LOG_FILE
        docker-compose up -d postgres
        sleep 30  # Даем время для инициализации
    fi
    
    # Проверяем состояние pgbouncer
    if ! docker-compose ps pgbouncer | grep -q "Up" ; then
        echo "$(date): PgBouncer container is down. Restarting..." >> $LOG_FILE
        docker-compose up -d pgbouncer
        sleep 15  # Даем время для инициализации
    fi
    
    # Проверяем состояние backend
    if ! docker-compose ps backend | grep -q "Up" ; then
        echo "$(date): Backend container is down. Restarting..." >> $LOG_FILE
        docker-compose up -d backend
    fi
    
    # Проверяем связь с базой данных
    if ! docker-compose exec -T postgres pg_isready -U postgres &>/dev/null ; then
        echo "$(date): Postgres is not responding. Recreating container..." >> $LOG_FILE
        docker-compose restart postgres
        sleep 30  # Даем время для запуска
    fi
    
    # Проверяем наличие критической таблицы
    table_check=$(docker-compose exec -T postgres psql -U postgres -d postgres -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards_card');")
    
    if [[ $table_check != *"t"* ]]; then
        echo "$(date): Critical table 'cards_card' is missing. Running migrations..." >> $LOG_FILE
        docker-compose exec -T backend python manage.py migrate
    fi
}

# Выполняем проверку каждые 10 минут
while true; do
    check_and_rebuild
    sleep 600
done
