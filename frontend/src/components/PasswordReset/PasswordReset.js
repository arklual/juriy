import './passwordReset.css';
import logo from '../Login/logo.svg';

import { useState, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ErrorContext } from '../../context/ErrorContext';
import Requests_API from '../../logic/req';

const PasswordReset = () => {
    const navigate = useNavigate();
    const [ErrorData, setErrorData] = useContext(ErrorContext);

    const [formData, setFormData] = useState({
        email: "",
        code: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 - email, 2 - код и новый пароль

    const validateForm = () => {
        const newErrors = {};
        
        if (step === 1) {
            // Валидация email
            if (!formData.email) {
                newErrors.email = "Email обязателен";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Некорректный формат email";
            }
        } else {
            // Валидация кода
            if (!formData.code) {
                newErrors.code = "Введите код подтверждения";
            }

            // Валидация нового пароля
            if (!formData.newPassword) {
                newErrors.newPassword = "Введите новый пароль";
            } else if (formData.newPassword.length < 6) {
                newErrors.newPassword = "Пароль должен быть не менее 6 символов";
            }

            // Валидация подтверждения пароля
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Подтвердите пароль";
            } else if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = "Пароли не совпадают";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку поля при изменении
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            if (step === 1) {
                // Запрос на отправку кода для сброса пароля
                const res = await Requests_API({
                    method: "POST",
                    sub_url: "reset-password-request",
                    body: {
                        "email": formData.email
                    }
                });

                if ([200, 201, 202].includes(res.code)) {
                    setStep(2);
                    setErrorData({
                        code: 200,
                        res: res,
                        upd_time: Date.now(),
                        descr: "Код отправлен на вашу почту"
                    });
                } else if (res.code === 404) {
                    setErrors(prev => ({
                        ...prev,
                        email: "Email не найден"
                    }));
                } else {
                    setErrorData({
                        code: res.code,
                        res: res,
                        upd_time: Date.now(),
                        descr: "Ошибка при отправке кода"
                    });
                }
            } else {
                // Сброс пароля с использованием кода
                const res = await Requests_API({
                    method: "POST",
                    sub_url: "reset-password",
                    body: {
                        "email": formData.email,
                        "code": formData.code,
                        "new_password": formData.newPassword
                    }
                });

                if ([200, 201, 202].includes(res.code)) {
                    setErrorData({
                        code: 200,
                        res: res,
                        upd_time: Date.now(),
                        descr: "Пароль успешно изменен"
                    });
                    // Перенаправляем на страницу входа
                    navigate("/sign-in");
                } else if (res.code === 403) {
                    setErrors(prev => ({
                        ...prev,
                        code: "Неверный код подтверждения"
                    }));
                } else {
                    setErrorData({
                        code: res.code,
                        res: res,
                        upd_time: Date.now(),
                        descr: "Ошибка при сбросе пароля"
                    });
                }
            }
        } catch (error) {
            setErrorData({
                code: error.code || 500,
                res: error,
                upd_time: Date.now(),
                descr: "Ошибка сервера, попробуйте позже"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resendCode = async () => {
        setIsLoading(true);
        try {
            const res = await Requests_API({
                method: "POST",
                sub_url: "reset-password-request",
                body: {
                    "email": formData.email
                }
            });

            if ([200, 201, 202].includes(res.code)) {
                setErrorData({
                    code: 200,
                    res: res,
                    upd_time: Date.now(),
                    descr: "Код успешно отправлен"
                });
            } else {
                setErrorData({
                    code: res.code,
                    res: res,
                    upd_time: Date.now(),
                    descr: "Ошибка при отправке кода"
                });
            }
        } catch (error) {
            setErrorData({
                code: error.code || 500,
                res: error,
                upd_time: Date.now(),
                descr: "Ошибка сервера, попробуйте позже"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='register_wrapper'>
            <div className='register_box'>
                <div className='reg_head'>
                    <img src={logo} alt="Logo" />
                </div>
                <div className='content_container'>
                    <h2>{step === 1 ? 'Восстановление пароля' : 'Новый пароль'}</h2>
                    <form onSubmit={handleSubmit} noValidate>
                        {step === 1 ? (
                            <>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Введите email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'error' : ''}
                                        required
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <button
                                    type="submit"
                                    className='decor_btn submit_btn'
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Отправка...' : 'Отправить код'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="code"
                                        placeholder="Код из письма"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className={errors.code ? 'error' : ''}
                                        required
                                    />
                                    {errors.code && <span className="error-message">{errors.code}</span>}
                                </div>

                                <div className="input-group">
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="Новый пароль"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className={errors.newPassword ? 'error' : ''}
                                        required
                                    />
                                    {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                                </div>

                                <div className="input-group">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Подтвердите пароль"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={errors.confirmPassword ? 'error' : ''}
                                        required
                                    />
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>

                                <button
                                    type="submit"
                                    className='decor_btn submit_btn'
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                                </button>

                                <button
                                    type="button"
                                    className='decor_btn resend_btn'
                                    onClick={resendCode}
                                    disabled={isLoading}
                                >
                                    Отправить код повторно
                                </button>
                            </>
                        )}
                    </form>

                    <div className='other_way'>
                        <hr />
                        <p>
                            Вспомнили пароль?
                            <Link to="/sign-in">Войти</Link>
                        </p>
                        <hr />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset; 