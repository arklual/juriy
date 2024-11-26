import './register.css';
import logo from './logo.svg';

import { useState } from 'react';
import { useContext } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { ErrorContext } from '../../context/ErrorContext';

import Requests_API from '../../logic/req';

const Register = (props) => {
    const navigate = useNavigate();

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");

    const registerUser = () => {
      Requests_API(
        {
          method: "POST",
          sub_url: "confirm_email",
          body: {
            "login": email,
            "password": password,
            "code": code
          }
        }
      ).then((res) => {
        if (res.code === 200 || res.code === 201 || res.code === 202){}
        else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при подтверждении почты!"}); }
      }).then(
        Requests_API(
          {
            method: "POST",
            sub_url: "sign-in",
            body: {
              "login": email,
              "password": password
            }
          }
        ).then((res) => {
          if (res.code === 200 || res.code === 201 || res.code === 202){
              localStorage.setItem("jwt", res.data.token); // non-safe! but... no XSS in our site!
              navigate("/");
          }
          else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при входе!"}); }
        })
      )
    }

    const sendCode = () => {
      // regiser account 
      Requests_API(
        {
          method: "POST",
          sub_url: "register",
          body: {
            "login": email,
            "password": password
          }
        }
      ).then((res) => {
        if (res.code === 200 || res.code === 201 || res.code === 409){}
        else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка во время регистрации!"}) }
      }).then((res) => {
          // send code 
          Requests_API(
            {
              method: "POST",
              sub_url: "send_code_to_email",
              body: {
                "login": email,
                "password": password
              }
            }
          ).then((res) => {
            if (res.code === 200 || res.code === 201 || res.code === 202){}
            else {  ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при отправке кода на почту!"}); }
          })
        }
      )
    }

    return (
      <div className='register_wrapper'>
        <div className='register_box'>
          <div className='reg_head'>
            <img src={logo}></img>
          </div>
          <div className='content_container'>
            <h2>Регистрация</h2>
            <input placeholder='Почта' required onChange={e => setEmail(e.target.value)}></input>
            <input placeholder='Пароль' required onChange={e => setPassword(e.target.value)}></input>
            
            <div className='reg_code'>
              <input placeholder="Код из письма" required onChange={e => setCode(e.target.value)}></input>
              <button className='decor_btn' onClick={sendCode}>Отправить код</button>
            </div>

            <button className='decor_btn submit_btn' onClick={registerUser}>Зарегистрироваться</button>
            
            <div className='other_way'>
              <hr/>
              <p>
                Уже есть аккаунт?
                <Link to="/sign-in">
                  Войти
                </Link>
              </p>
              <hr/>
            </div>

          </div>
        </div>
      </div>
    )
}

export default Register;