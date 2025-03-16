from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict

from database import get_db
from models.user import User
from schemas.user import UserCreate
from utils.social_auth import VKAuth, TelegramAuth
from utils.auth import create_access_token

router = APIRouter()

@router.post("/auth/vk/callback")
async def vk_callback(code: str, db: Session = Depends(get_db)):
    """Обработка колбэка от VK OAuth"""
    # Получаем access token
    token_data = await VKAuth.get_access_token(code)
    if not token_data:
        raise HTTPException(status_code=400, detail="Failed to get VK access token")

    # Получаем информацию о пользователе
    user_info = await VKAuth.get_user_info(token_data['access_token'])
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to get VK user info")

    # Проверяем, существует ли пользователь
    email = token_data.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by VK")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Создаем нового пользователя
        user = User(
            email=email,
            vk_id=str(user_info['id']),
            first_name=user_info.get('first_name', ''),
            last_name=user_info.get('last_name', ''),
            is_verified=True  # Пользователь верифицирован через VK
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Создаем JWT токен
    access_token = create_access_token(data={"sub": user.email})
    
    return {"token": access_token, "token_type": "bearer"}

@router.post("/auth/telegram/callback")
async def telegram_callback(hash: str, db: Session = Depends(get_db)):
    """Обработка колбэка от Telegram Login Widget"""
    # Декодируем данные из хэша
    try:
        import base64
        import json
        data = json.loads(base64.b64decode(hash).decode())
    except:
        raise HTTPException(status_code=400, detail="Invalid data format")

    # Проверяем подлинность данных
    if not TelegramAuth.verify_telegram_data(data):
        raise HTTPException(status_code=400, detail="Invalid Telegram data")

    # Получаем информацию о пользователе
    user_info = TelegramAuth.get_user_info(data)
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to get Telegram user info")

    # Проверяем, существует ли пользователь
    user = db.query(User).filter(User.telegram_id == user_info['id']).first()

    if not user:
        # Создаем нового пользователя
        username = user_info.get('username', '')
        email = f"{username}@telegram.user" if username else f"user_{user_info['id']}@telegram.user"
        
        user = User(
            email=email,
            telegram_id=user_info['id'],
            first_name=user_info.get('first_name', ''),
            last_name=user_info.get('last_name', ''),
            is_verified=True  # Пользователь верифицирован через Telegram
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Создаем JWT токен
    access_token = create_access_token(data={"sub": user.email})
    
    return {"token": access_token, "token_type": "bearer"} 