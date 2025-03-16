from os import getenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Получаем параметры подключения из переменных окружения
DB_USER = getenv("DB_USER", "postgres")
DB_PASSWORD = getenv("DB_PASSWORD", "postgres")
DB_HOST = getenv("DB_HOST", "localhost")
DB_PORT = getenv("DB_PORT", "6432")  # Порт PgBouncer
DB_NAME = getenv("DB_NAME", "postgres")

# Формируем URL для подключения
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Создаем движок с настройками для работы с PgBouncer
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,  # Максимальное количество соединений в пуле
    max_overflow=10,  # Максимальное количество дополнительных соединений
    pool_timeout=30,  # Тайм-аут ожидания доступного соединения
    pool_recycle=1800,  # Пересоздание соединений каждые 30 минут
    pool_pre_ping=True,  # Проверка соединения перед использованием
    connect_args={
        "application_name": "wildberries_tracker",  # Имя приложения для мониторинга
        "options": "-c statement_timeout=60000"  # Тайм-аут запросов 60 секунд
    }
)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Функция для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 