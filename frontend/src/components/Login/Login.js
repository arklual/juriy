import './login.css';
import logo from './logo.svg';

import { useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { ErrorContext } from '../../context/ErrorContext';
import Requests_API from '../../logic/req';
import SocialAuth from '../SocialAuth/SocialAuth';

const Login = () => {
    const navigate = useNavigate();
    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
            const res = await Requests_API({
                method: "POST",
                sub_url: "sign-in",
                body: {
                    "login": formData.email,
                    "password": formData.password
                }
            });

            if (res.code === 200) {
                localStorage.setItem("jwt", res.data.token);
                navigate("/");
            } else {
                let errorMessage = "Ошибка при входе";
                if (res.code === 404) {
                    errorMessage = "Неверный email или пароль";
                } else if (res.code === 403) {
                    errorMessage = "Пожалуйста, подтвердите email";
                }
                ErrorDataSetter({
                    code: res.code,
                    res: res,
                    upd_time: Date.now(),
                    descr: errorMessage
                });
            }
        } catch (error) {
            ErrorDataSetter({
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
                    <h2>Войти</h2>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder='Почта'
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
                                placeholder='Пароль'
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                required
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <button 
                            type="submit" 
                            className='decor_btn submit_btn'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <SocialAuth />

                    <div className='other_way'>
                        <hr/>
                        <p>
                            Нет аккаунта?
                            <Link to="/register">Создать</Link>
                        </p>
                        <hr/>
                    </div>

                    <div className='other_way'>
                        <hr/>
                        <p>
                            Забыли пароль?
                            <Link to="/reset-password">Восстановить</Link>
                        </p>
                        <hr/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;