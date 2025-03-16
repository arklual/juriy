import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorContext } from '../../context/ErrorContext';
import Requests_API from '../../logic/req';

const TelegramCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorData, ErrorDataSetter] = useContext(ErrorContext);

    useEffect(() => {
        const handleTelegramCallback = async () => {
            // Telegram передает данные в виде хэша после #
            const hash = window.location.hash.substring(1);
            if (!hash) {
                ErrorDataSetter({
                    code: 400,
                    descr: "Ошибка авторизации через Telegram"
                });
                navigate('/login');
                return;
            }

            try {
                const response = await Requests_API({
                    method: 'POST',
                    sub_url: 'auth/telegram/callback',
                    params: { hash },
                });

                if (response.code === 200) {
                    localStorage.setItem('jwt', response.data.token);
                    navigate('/');
                } else {
                    ErrorDataSetter({
                        code: response.code,
                        descr: "Ошибка авторизации через Telegram"
                    });
                    navigate('/login');
                }
            } catch (error) {
                ErrorDataSetter({
                    code: 500,
                    descr: "Ошибка при обработке авторизации через Telegram"
                });
                navigate('/login');
            }
        };

        handleTelegramCallback();
    }, [navigate, ErrorDataSetter]);

    return (
        <div className="loading">
            Выполняется вход через Telegram...
        </div>
    );
};

export default TelegramCallback; 