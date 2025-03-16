from os import getenv

# VK OAuth Configuration
VK_CLIENT_ID = getenv('VK_CLIENT_ID')
VK_CLIENT_SECRET = getenv('VK_CLIENT_SECRET')
VK_API_VERSION = '5.131'
VK_REDIRECT_URI = getenv('VK_REDIRECT_URI', 'http://localhost:3000/auth/vk/callback')

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_BOT_USERNAME = getenv('TELEGRAM_BOT_USERNAME') 