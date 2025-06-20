#!/bin/bash
# Скрипт для регулярного резервного копирования базы данных

# Создаем директорию для бэкапов, если еще не существует
mkdir -p /root/juriy/backups

# Текущая дата и время для имени файла
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/root/juriy/backups/postgres_$TIMESTAMP.sql"

# Создаем бэкап
echo "Creating database backup..."
docker-compose exec -T postgres pg_dump -U postgres postgres > $BACKUP_FILE

# Проверяем успешность выполнения
if [ $? -eq 0 ]; then
    echo "Backup successfully created: $BACKUP_FILE"
    
    # Удаляем старые бэкапы (оставляем только последние 7)
    ls -t /root/juriy/backups/postgres_*.sql | tail -n +8 | xargs --no-run-if-empty rm
    
    echo "Old backups cleaned up"
else
    echo "Error: Backup failed!"
    exit 1
fi
