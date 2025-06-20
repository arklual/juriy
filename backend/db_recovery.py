#!/usr/bin/env python
"""
Скрипт для проверки и восстановления соединения с базой данных
и автоматического применения миграций при необходимости.
"""

import os
import time
import logging
import subprocess
import sys
from django.db import connection, connections
from django.db.utils import OperationalError, ProgrammingError

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def check_database_connection():
    """Проверяет соединение с базой данных"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            return result[0] == 1
    except (OperationalError, ProgrammingError) as e:
        logger.error(f"Failed to connect to database: {e}")
        return False

def run_migrations():
    """Применяет миграции Django"""
    try:
        logger.info("Running Django migrations...")
        result = subprocess.run(
            ["python", "manage.py", "migrate"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            logger.info("Migrations applied successfully")
            logger.info(result.stdout)
            return True
        else:
            logger.error(f"Failed to apply migrations: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"Exception during migrations: {e}")
        return False

def check_table_exists(table_name):
    """Проверяет существование таблицы в базе данных"""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, [table_name])
            result = cursor.fetchone()
            return result[0]
    except (OperationalError, ProgrammingError) as e:
        logger.error(f"Error checking if table exists: {e}")
        return False

def fix_database():
    """Проверяет и восстанавливает базу данных"""
    # Проверяем соединение с БД
    if not check_database_connection():
        logger.error("Database connection failed")
        return False
    
    # Проверяем наличие критических таблиц
    critical_tables = ['cards_card', 'categories_category', 'profiles_profile']
    missing_tables = [table for table in critical_tables if not check_table_exists(table)]
    
    if missing_tables:
        logger.warning(f"Missing tables detected: {missing_tables}")
        # Применяем миграции для восстановления таблиц
        return run_migrations()
    else:
        logger.info("All critical tables exist")
        return True

if __name__ == "__main__":
    # Небольшая задержка для уверенности, что БД готова к подключению
    time.sleep(5)
    
    max_attempts = 5
    attempt = 0
    success = False
    
    while attempt < max_attempts and not success:
        attempt += 1
        logger.info(f"Database recovery attempt {attempt}/{max_attempts}")
        success = fix_database()
        
        if not success and attempt < max_attempts:
            logger.info(f"Waiting before next attempt...")
            time.sleep(10)  # Ждем перед следующей попыткой
    
    if success:
        logger.info("Database recovery successful!")
        sys.exit(0)
    else:
        logger.error("Database recovery failed after multiple attempts")
        sys.exit(1)
