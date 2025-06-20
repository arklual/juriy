#!/bin/bash

# Создаем директорию для бэкапов, если её нет
mkdir -p /root/juriy/backups

# Получаем текущую дату и время
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Создаем бэкап базы данных
echo "Creating database backup..."
docker-compose exec -T postgres pg_dump -U postgres postgres > /root/juriy/backups/postgres_$TIMESTAMP.sql

# Проверяем успешность бэкапа
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: /root/juriy/backups/postgres_$TIMESTAMP.sql"
    
    # Удаляем старые бэкапы (оставляем только 7 последних)
    echo "Cleaning up old backups..."
    ls -t /root/juriy/backups/postgres_*.sql | tail -n +8 | xargs --no-run-if-empty rm
    
    echo "Done."
else
    echo "Error: Backup failed!"
    exit 1
fi
