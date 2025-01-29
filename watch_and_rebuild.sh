#!/bin/bash

# Файл для отслеживания
FILE="parser/scheduler.py"

# Функция для удаления контейнера, образа и пересборки
rebuild() {
  echo "Changes detected in $FILE. Rebuilding..."
  docker-compose down --rmi all -v # Останавливает контейнеры и удаляет образы
  docker-compose up --build       # Пересобирает и запускает контейнеры
}

# Инициализация хэша файла
previous_hash=$(md5sum "$FILE")

# Основной цикл отслеживания
while true; do
  current_hash=$(md5sum "$FILE")
  if [[ "$current_hash" != "$previous_hash" ]]; then
    previous_hash="$current_hash"
    rebuild
  fi
  sleep 1
done