import './register.css';
import logo from './logo.svg';

import { useState, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";

import { ErrorContext } from '../../context/ErrorContext';
import SocialAuth from '../SocialAuth/SocialAuth';
import Requests_API from '../../logic/req';

const Register = () => {
    const navigate = useNavigate();

    const [ErrorData, setErrorData] = useContext(ErrorContext);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        code: ""
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 - регистрация, 2 - подтверждение кода

    const validateForm = () => {
        const newErrors = {};
        
        // Валидация email
        if (!formData.email) {
            newErrors.email = "Email обязателен";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Некорректный формат email";
        }

        // Валидация пароля
        if (!formData.password) {
            newErrors.password = "Пароль обязателен";
        } else if (formData.password.length < 6) {
            newErrors.password = "Пароль должен быть не менее 6 символов";
        }

        // Валидация подтверждения пароля
        if (step === 1) {
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Подтвердите пароль";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Пароли не совпадают";
            }
        }

        // Валидация кода
        if (step === 2 && !formData.code) {
            newErrors.code = "Введите код подтверждения";
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

    const handleRegister = async () => {
        try {
            const registerRes = await Requests_API({
                method: "POST",
                sub_url: "register",
                body: {
                    "login": formData.email,
                    "password": formData.password
                }
            });

            if (![200, 201, 409].includes(registerRes.code)) {
                setErrorData({
                    code: registerRes.code,
                    res: registerRes,
                    upd_time: Date.now(),
                    descr: "Ошибка при регистрации"
                });
                return false;
            }

            if (registerRes.code === 409) {
                setErrors(prev => ({
                    ...prev,
                    email: "Email уже зарегистрирован"
                }));
                return false;
            }

            // Отправка кода подтверждения
            const sendCodeRes = await Requests_API({
                method: "POST",
                sub_url: "send_code_to_email",
                body: {
                    "login": formData.email,
                    "password": formData.password
                }
            });

            if (![200, 201, 202].includes(sendCodeRes.code)) {
                setErrorData({
                    code: sendCodeRes.code,
                    res: sendCodeRes,
                    upd_time: Date.now(),
                    descr: "Ошибка при отправке кода"
                });
                return false;
            }

            return true;
        } catch (error) {
            setErrorData({
                code: error.code || 500,
                res: error,
                upd_time: Date.now(),
                descr: "Ошибка сервера, попробуйте позже"
            });
            return false;
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
                const success = await handleRegister();
                if (success) {
                    setStep(2);
                }
            } else {
                // Подтверждение email с кодом
                const confirmRes = await Requests_API({
                    method: "POST",
                    sub_url: "confirm_email",
                    body: {
                        "login": formData.email,
                        "password": formData.password,
                        "code": formData.code
                    }
                });

                if (![200, 201, 202].includes(confirmRes.code)) {
                    if (confirmRes.code === 403) {
                        setErrors(prev => ({
                            ...prev,
                            code: "Неверный код подтверждения"
                        }));
                    } else {
                        setErrorData({
                            code: confirmRes.code,
                            res: confirmRes,
                            upd_time: Date.now(),
                            descr: "Ошибка при подтверждении email"
                        });
                    }
                    return;
                }

                // Автоматический вход после подтверждения
                const signInRes = await Requests_API({
                    method: "POST",
                    sub_url: "sign-in",
                    body: {
                        "login": formData.email,
                        "password": formData.password
                    }
                });

                if ([200, 201, 202].includes(signInRes.code)) {
                    localStorage.setItem("jwt", signInRes.data.token);
                    navigate("/");
                } else {
                    setErrorData({
                        code: signInRes.code,
                        res: signInRes,
                        upd_time: Date.now(),
                        descr: "Ошибка при входе"
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
                sub_url: "send_code_to_email",
                body: {
                    "login": formData.email,
                    "password": formData.password
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
                    <h2>{step === 1 ? 'Регистрация' : 'Подтверждение email'}</h2>
                    {!step ? (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="input-group">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Почта"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    required
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="input-group">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Пароль"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? 'error' : ''}
                                    required
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
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
                                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </button>

                            <SocialAuth />

                            <div className='other_way'>
                                <hr />
                                <p>
                                    Уже есть аккаунт?
                                    <Link to="/sign-in">Войти</Link>
                                </p>
                                <hr />
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
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

                            <button
                                type="submit"
                                className='decor_btn submit_btn'
                                disabled={isLoading}
                            >
                                {isLoading ? 'Подтверждение...' : 'Подтвердить'}
                            </button>

                            <button
                                type="button"
                                className='decor_btn resend_btn'
                                onClick={resendCode}
                                disabled={isLoading}
                            >
                                Отправить код повторно
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
