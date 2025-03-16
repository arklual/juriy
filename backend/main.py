from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, users, social_auth
from database import engine, Base

# Создаем таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(social_auth.router, prefix="/api", tags=["social_auth"]) 