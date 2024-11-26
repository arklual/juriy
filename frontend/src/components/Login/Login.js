import './login.css';
import logo from './logo.svg';

import { useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useContext } from 'react';
import { ErrorContext } from '../../context/ErrorContext';

import Requests_API from '../../logic/req';

const Login = (props) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);
    

    const login = () => {
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
        if (res.code === 200){
            localStorage.setItem("jwt", res.data.token); // non-safe! but... no XSS in our site!
            navigate("/");
        }
        else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при входе!"}); }
      })
    }

    return (
      <div className='register_wrapper'>
        <div className='register_box'>
          <div className='reg_head'>
            <img src={logo}></img>
          </div>
          <div className='content_container'>
            <h2>Войти</h2>
            <input placeholder='Почта' required onChange={e => setEmail(e.target.value)}></input>
            <input placeholder='Пароль' required onChange={e => setPassword(e.target.value)}></input>

            <button className='decor_btn submit_btn' onClick={login}>Войти</button>
            
            <div className='other_way'>
              <hr/>
              <p>
                Нет аккаунта?
                <Link to="/register">
                  Создать
                </Link>
              </p>
              <hr/>
            </div>

          </div>
        </div>
        
      </div>
    )
}

export default Login;