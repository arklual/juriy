#!/bin/bash

# Ждем готовности базы данных
echo "Waiting for database to become available..."
attempts=0
max_attempts=30
while ! pg_isready -h postgres -U postgres -d postgres > /dev/null 2>&1 && [ $attempts -lt $max_attempts ]; do
    attempts=$((attempts+1))
    echo "Waiting for PostgreSQL ($attempts/$max_attempts)..."
    sleep 2
done

if [ $attempts -eq $max_attempts ]; then
    echo "Database connection timed out after $max_attempts attempts!"
    exit 1
fi

echo "Database is available, checking tables..."

# Запуск проверки и восстановления базы данных
echo "Checking and repairing database if necessary..."
python db_recovery.py

# Применяем миграции в любом случае для уверенности
echo "Applying Django migrations..."
python manage.py migrate

# Запуск основного приложения
echo "Starting the main application..."
python main.py
