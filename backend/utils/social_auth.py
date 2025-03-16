import hashlib
import hmac
import json
import requests
from typing import Optional, Dict, Any
from urllib.parse import urlencode

from config.social_auth import (
    VK_CLIENT_ID,
    VK_CLIENT_SECRET,
    VK_API_VERSION,
    VK_REDIRECT_URI,
    TELEGRAM_BOT_TOKEN
)

class VKAuth:
    @staticmethod
    async def get_access_token(code: str) -> Optional[Dict[str, Any]]:
        """Получает access token от VK по коду авторизации"""
        try:
            params = {
                'client_id': VK_CLIENT_ID,
                'client_secret': VK_CLIENT_SECRET,
                'code': code,
                'redirect_uri': VK_REDIRECT_URI,
                'v': VK_API_VERSION
            }
            
            response = requests.get('https://oauth.vk.com/access_token', params=params)
            data = response.json()
            
            if 'access_token' not in data:
                return None
                
            return data
        except Exception:
            return None

    @staticmethod
    async def get_user_info(access_token: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о пользователе VK"""
        try:
            params = {
                'access_token': access_token,
                'v': VK_API_VERSION,
                'fields': 'id,first_name,last_name,email'
            }
            
            response = requests.get('https://api.vk.com/method/users.get', params=params)
            data = response.json()
            
            if 'response' not in data or not data['response']:
                return None
                
            return data['response'][0]
        except Exception:
            return None

class TelegramAuth:
    @staticmethod
    def verify_telegram_data(data: Dict[str, Any]) -> bool:
        """Проверяет подлинность данных от Telegram"""
        if 'hash' not in data:
            return False

        received_hash = data.pop('hash')
        
        # Сортируем параметры
        data_check_list = []
        for key in sorted(data.keys()):
            if data[key] is not None:
                data_check_list.append(f"{key}={data[key]}")
        
        # Формируем строку для проверки
        data_check_string = '\n'.join(data_check_list)
        
        # Создаем секретный ключ на основе токена бота
        secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
        
        # Вычисляем хэш
        hmac_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac_hash == received_hash

    @staticmethod
    def get_user_info(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Извлекает информацию о пользователе из данных Telegram"""
        try:
            return {
                'id': str(data.get('id')),
                'first_name': data.get('first_name', ''),
                'last_name': data.get('last_name', ''),
                'username': data.get('username', ''),
                'photo_url': data.get('photo_url', '')
            }
        except Exception:
            return None 