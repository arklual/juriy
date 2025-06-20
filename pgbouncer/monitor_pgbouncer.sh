#!/bin/bash

# Скрипт для мониторинга и перезапуска PgBouncer при необходимости
# Запускать в фоновом режиме в контейнере с PgBouncer или настроить контейнер на его использование

LOG_FILE="/var/log/pgbouncer_monitor.log"

echo "$(date): PgBouncer monitoring started" >> $LOG_FILE

while true; do
    # Проверяем, работает ли PgBouncer
    if ! pg_isready -h localhost -p 6432 -U postgres &>/dev/null; then
        echo "$(date): PgBouncer is not responding. Attempting restart..." >> $LOG_FILE
        
        # Мягкая перезагрузка PgBouncer (перечитываем конфигурацию)
        pgbouncer -R
        sleep 5
        
        # Проверяем, помог ли перезапуск
        if ! pg_isready -h localhost -p 6432 -U postgres &>/dev/null; then
            echo "$(date): Soft restart failed. Attempting hard restart..." >> $LOG_FILE
            
            # Пытаемся убить и перезапустить PgBouncer
            pkill pgbouncer
            sleep 5
            pgbouncer -d -u postgres /etc/pgbouncer/pgbouncer.ini
        fi
    else
        echo "$(date): PgBouncer is running correctly" >> $LOG_FILE
    fi
    
    # Проверяем каждые 5 минут
    sleep 300
done
