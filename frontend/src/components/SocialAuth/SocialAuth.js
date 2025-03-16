import React from 'react';
import './SocialAuth.css';

const SocialAuth = () => {
    const handleVKAuth = () => {
        // Параметры для OAuth VK
        const vkClientId = process.env.REACT_APP_VK_CLIENT_ID;
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/vk/callback`);
        const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${vkClientId}&display=popup&redirect_uri=${redirectUri}&scope=email&response_type=code&v=5.131`;
        
        // Открываем окно авторизации VK
        window.open(vkAuthUrl, 'vk-auth', 'width=600,height=600');
    };

    const handleTelegramAuth = () => {
        // Параметры для Telegram Login Widget
        const botName = process.env.REACT_APP_TELEGRAM_BOT_NAME;
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/telegram/callback`);
        const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${botName}&origin=${redirectUri}&request_access=write`;
        
        // Открываем окно авторизации Telegram
        window.open(telegramAuthUrl, 'telegram-auth', 'width=600,height=600');
    };

    return (
        <div className="social-auth">
            <div className="social-auth-divider">
                <span>или войдите через</span>
            </div>
            <div className="social-buttons">
                <button 
                    className="social-button vk-button"
                    onClick={handleVKAuth}
                >
                    <svg className="vk-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.576-1.496c.588-.19 1.341 1.26 2.14 1.818.605.422 1.064.33 1.064.33l2.137-.03s1.117-.071.587-.964c-.043-.073-.308-.661-1.588-1.87-1.34-1.264-1.16-1.059.453-3.246.983-1.332 1.376-2.145 1.253-2.493-.117-.332-.84-.244-.84-.244l-2.406.015s-.178-.025-.31.056c-.13.079-.212.262-.212.262s-.382 1.03-.89 1.907c-1.07 1.85-1.499 1.948-1.674 1.832-.407-.267-.305-1.075-.305-1.648 0-1.793.267-2.54-.521-2.733-.262-.065-.454-.107-1.123-.114-.858-.009-1.585.003-1.996.208-.274.136-.485.44-.356.457.159.022.519.099.71.363.246.341.237 1.107.237 1.107s.142 2.11-.33 2.371c-.325.18-.77-.187-1.725-1.865-.489-.859-.859-1.81-.859-1.81s-.07-.176-.198-.272c-.154-.115-.37-.151-.37-.151l-2.286.015s-.343.01-.469.161C3.94 7.721 4.043 8 4.043 8s1.79 4.258 3.817 6.403c1.858 1.967 3.968 1.838 3.968 1.838h.957z"/>
                    </svg>
                    <span>ВКонтакте</span>
                </button>
                <button 
                    className="social-button telegram-button"
                    onClick={handleTelegramAuth}
                >
                    <svg className="telegram-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.417 15.181l-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931l3.622-16.972.001-.001c.321-1.496-.541-2.081-1.527-1.714l-21.29 8.151c-1.453.564-1.431 1.374-.247 1.741l5.443 1.693 12.643-7.911c.595-.394 1.136-.176.691.218z"/>
                    </svg>
                    <span>Telegram</span>
                </button>
            </div>
        </div>
    );
};

export default SocialAuth; 