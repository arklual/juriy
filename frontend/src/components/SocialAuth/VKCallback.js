import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorContext } from '../../context/ErrorContext';
import Requests_API from '../../logic/req';

const VKCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorData, ErrorDataSetter] = useContext(ErrorContext);

    useEffect(() => {
        const handleVKCallback = async () => {
            const code = searchParams.get('code');
            
            if (!code) {
                ErrorDataSetter({
                    code: 400,
                    descr: "Ошибка авторизации через ВКонтакте"
                });
                navigate('/login');
                return;
            }

            try {
                const response = await Requests_API({
                    method: 'POST',
                    sub_url: 'auth/vk/callback',
                    params: { code },
                });

                if (response.code === 200) {
                    localStorage.setItem('jwt', response.data.token);
                    navigate('/');
                } else {
                    ErrorDataSetter({
                        code: response.code,
                        descr: "Ошибка авторизации через ВКонтакте"
                    });
                    navigate('/login');
                }
            } catch (error) {
                ErrorDataSetter({
                    code: 500,
                    descr: "Ошибка при обработке авторизации через ВКонтакте"
                });
                navigate('/login');
            }
        };

        handleVKCallback();
    }, [searchParams, navigate, ErrorDataSetter]);

    return (
        <div className="loading">
            Выполняется вход через ВКонтакте...
        </div>
    );
};

export default VKCallback; 