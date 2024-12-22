import './register.css';
import logo from './logo.svg';

import { useState, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";

import { ErrorContext } from '../../context/ErrorContext';

import Requests_API from '../../logic/req';

const Register = () => {
    const navigate = useNavigate();

    const [ErrorData, setErrorData] = useContext(ErrorContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");

    const registerUser = async () => {
        try {
            // Подтверждение email с кодом
            const confirmRes = await Requests_API({
                method: "POST",
                sub_url: "confirm_email",
                body: {
                    "login": email,
                    "password": password,
                    "code": code
                }
            });

            if (![200, 201, 202].includes(confirmRes.code)) {
                setErrorData({
                    code: confirmRes.code,
                    res: confirmRes,
                    upd_time: Date.now(),
                    descr: "Ошибка при подтверждении почты!"
                });
                return;
            }

            // Вход после подтверждения
            const signInRes = await Requests_API({
                method: "POST",
                sub_url: "sign-in",
                body: {
                    "login": email,
                    "password": password
                }
            });

            if ([200, 201, 202].includes(signInRes.code)) {
                localStorage.setItem("jwt", signInRes.data.token); // небезопасно! но... XSS на нашем сайте отсутствует
                navigate("/");
            } else {
                setErrorData({
                    code: signInRes.code,
                    res: signInRes,
                    upd_time: Date.now(),
                    descr: "Ошибка при входе!"
                });
            }

        } catch (error) {
            setErrorData({
                code: error.code || 500,
                res: error,
                upd_time: Date.now(),
                descr: "Неизвестная ошибка при регистрации пользователя!"
            });
        }
    };

    const sendCode = async () => {
        try {
            // Регистрация аккаунта
            const registerRes = await Requests_API({
                method: "POST",
                sub_url: "register",
                body: {
                    "login": email,
                    "password": password
                }
            });

            if (![200, 201, 409].includes(registerRes.code)) {
                setErrorData({
                    code: registerRes.code,
                    res: registerRes,
                    upd_time: Date.now(),
                    descr: "Ошибка во время регистрации!"
                });
                return;
            }

            // Отправка кода на email
            const sendCodeRes = await Requests_API({
                method: "POST",
                sub_url: "send_code_to_email",
                body: {
                    "login": email,
                    "password": password
                }
            });

            if (![200, 201, 202].includes(sendCodeRes.code)) {
                setErrorData({
                    code: sendCodeRes.code,
                    res: sendCodeRes,
                    upd_time: Date.now(),
                    descr: "Ошибка при отправке кода на почту!"
                });
            }

        } catch (error) {
            setErrorData({
                code: error.code || 500,
                res: error,
                upd_time: Date.now(),
                descr: "Неизвестная ошибка при отправке кода!"
            });
        }
    };


    return (
      <div className='register_wrapper'>
          <div className='register_box'>
              <div className='reg_head'>
                  <img src={logo} alt="Logo" />
              </div>
              <div className='content_container'>
                  <h2>Регистрация</h2>
                  <input
                      type="email"
                      placeholder='Почта'
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                  />
                  <input
                      type="password"
                      placeholder='Пароль'
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                  />

                  <div className='reg_code'>
                      <input
                          placeholder="Код из письма"
                          required
                          value={code}
                          onChange={e => setCode(e.target.value)}
                      />
                      <button className='decor_btn' onClick={sendCode}>Отправить код</button>
                  </div>

                  <button className='decor_btn submit_btn' onClick={registerUser}>Зарегистрироваться</button>

                  <div className='other_way'>
                      <hr />
                      <p>
                          Уже есть аккаунт?
                          <Link to="/sign-in">
                              Войти
                          </Link>
                      </p>
                      <hr />
                  </div>

              </div>
          </div>
      </div>
  );
};

export default Register;
