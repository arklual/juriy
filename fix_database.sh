#!/bin/bash

# Скрипт для улучшения работы PgBouncer и восстановления базы данных
echo "Applying PgBouncer optimizations and fixing database..."

# 1. Создаем резервную копию текущей конфигурации PgBouncer
cp /root/juriy/pgbouncer/pgbouncer.ini /root/juriy/pgbouncer/pgbouncer.ini.backup

# 2. Обновляем настройки PgBouncer
cat > /root/juriy/pgbouncer/pgbouncer.ini << 'EOF'
[databases]
* = host=postgres port=5432

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 50
max_user_connections = 50
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
verbose = 1
pidfile = /tmp/pgbouncer.pid
server_reset_query = DISCARD ALL
server_check_delay = 10       # Уменьшаем до 10 секунд для более частой проверки
server_check_query = select 1
server_lifetime = 7200        # Увеличиваем до 2 часов
server_idle_timeout = 600
client_idle_timeout = 60
idle_transaction_timeout = 600
query_timeout = 60
ignore_startup_parameters = extra_float_digits
tcp_keepalive = 1             # Включаем keepalive
tcp_keepidle = 30             # Начинаем проверку после 30 секунд простоя
tcp_keepintvl = 10            # Интервал проверок 10 секунд
tcp_keepcnt = 10              # Количество проверок до разрыва
EOF

# 3. Улучшаем watchdog скрипт для автоматической проверки и восстановления таблиц
cat > /root/juriy/db_watchdog.sh << 'EOF'
#!/bin/bash

LOG_FILE="/root/juriy/db_watchdog.log"

echo "$(date): Database watchdog started" >> $LOG_FILE

while true; do
    # Проверяем доступность PostgreSQL
    if ! docker-compose exec -T postgres pg_isready -U postgres &>/dev/null ; then
        echo "$(date): PostgreSQL is not responsive. Restarting container..." >> $LOG_FILE
        docker-compose restart postgres
        sleep 30
    fi

    # Проверяем наличие критических таблиц
    table_check=$(docker-compose exec -T postgres psql -U postgres -d postgres -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards_card');")
    
    if [[ $table_check != *"t"* ]]; then
        echo "$(date): Critical table 'cards_card' is missing. Running migrations..." >> $LOG_FILE
        docker-compose exec -T backend python manage.py migrate
        sleep 10
        
        # Проверяем, помогли ли миграции
        table_check=$(docker-compose exec -T postgres psql -U postgres -d postgres -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards_card');")
        
        if [[ $table_check != *"t"* ]]; then
            echo "$(date): CRITICAL ERROR: Migration did not fix missing tables!" >> $LOG_FILE
            # Отправляем уведомление (можно настроить отправку email)
        else
            echo "$(date): Database tables successfully restored" >> $LOG_FILE
        fi
    else
        echo "$(date): Database check passed, all critical tables exist" >> $LOG_FILE
    fi
    
    # Проверяем состояние PgBouncer
    if ! docker-compose exec -T pgbouncer pg_isready -h localhost -p 6432 -U postgres &>/dev/null; then
        echo "$(date): PgBouncer is not responsive. Restarting..." >> $LOG_FILE
        docker-compose restart pgbouncer
        sleep 15
    fi

    # Проверка каждые 5 минут
    sleep 300
done
EOF

chmod +x /root/juriy/db_watchdog.sh

# 4. Создаем скрипт для проверки и автоматического восстановления Django миграций
cat > /root/juriy/backend/check_migrations.py << 'EOF'
#!/usr/bin/env python
"""
Скрипт для проверки и восстановления Django миграций
"""
import os
import django
import logging
import sys
import time
import subprocess
from django.db import connection
from django.db.utils import OperationalError, ProgrammingError

# Настраиваем Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "web2_backend.settings")
django.setup()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def check_critical_tables():
    """Проверяет наличие критических таблиц в базе данных"""
    critical_tables = ['cards_card', 'categories_category', 'profiles_profile']
    missing_tables = []
    
    try:
        with connection.cursor() as cursor:
            for table in critical_tables:
                cursor.execute(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = %s
                    );
                """, [table])
                result = cursor.fetchone()
                if not result[0]:
                    missing_tables.append(table)
                    
        if missing_tables:
            logger.warning(f"Missing tables: {missing_tables}")
            return False
        return True
                    
    except (OperationalError, ProgrammingError) as e:
        logger.error(f"Database error: {e}")
        return False

def run_migrations():
    """Применяет миграции Django"""
    try:
        logger.info("Running Django migrations...")
        result = subprocess.run(
            ["python", "manage.py", "migrate", "--noinput"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("Migrations applied successfully")
            return True
        else:
            logger.error(f"Failed to apply migrations: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"Exception during migrations: {e}")
        return False

if __name__ == "__main__":
    # Даем время на подключение к базе данных
    time.sleep(5)
    
    # Проверяем таблицы
    if not check_critical_tables():
        logger.info("Missing critical tables, attempting to run migrations")
        success = run_migrations()
        
        if success:
            logger.info("Database restored successfully")
        else:
            logger.error("Failed to restore database")
            sys.exit(1)
    else:
        logger.info("All critical tables exist")
        
    sys.exit(0)
EOF

# 5. Обновляем скрипт запуска бэкенда, чтобы он запускал проверку миграций
cat > /root/juriy/backend/start.sh << 'EOF'
#!/bin/bash

# Ждем, пока база данных будет доступна
echo "Waiting for database to be ready..."
for i in {1..60}; do
  if pg_isready -h postgres -p 5432 -U postgres; then
    echo "Database is ready!"
    break
  fi
  echo "Waiting for database... ${i}/60"
  sleep 2
done

# Запускаем проверку и восстановление миграций
echo "Checking and repairing database if necessary..."
python check_migrations.py

if [ $? -ne 0 ]; then
  echo "ERROR: Database check failed. Applying migrations..."
  python manage.py migrate
fi

# Запускаем приложение
echo "Starting the Django application..."
python manage.py runserver 0.0.0.0:8080
EOF

chmod +x /root/juriy/backend/start.sh

# 6. Запускаем DB Watchdog в фоне
nohup /root/juriy/db_watchdog.sh > /dev/null 2>&1 &

echo "PgBouncer optimized and database watchdog started."
echo "Now restart your Docker containers to apply changes:"
echo "docker-compose down"
echo "docker-compose up -d"
