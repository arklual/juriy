/*
Следующему программисту:
  Предыдущий фронт устал и приуныл
  Он искренне просим прощения за столь плохое качество кода и его сильную связанность.
*/
import Header from './components/Header/Header';
import Profile from "./components/Profile/Profile";
import Register from "./components/Register/Register";
import Login from './components/Login/Login';
import Admin from './components/Admin/Admin';
import Favorite from './components/Favorite/Favorite';
import Error from './components/Error/Error';
import CategoryWrapper from './components/CategoryWrapper/CategoryWrapper';
import PasswordReset from './components/PasswordReset/PasswordReset';
import VKCallback from './components/SocialAuth/VKCallback';
import TelegramCallback from './components/SocialAuth/TelegramCallback';

import { Link } from 'react-router-dom';

import './App.css';
import logo from "./icon.svg";
import favicon from "./favicon.ico"

import { Helmet } from "react-helmet";
import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from 'react';
import { useContext } from 'react';

import { ErrorContext } from './context/ErrorContext';

const App = () => {
  const [AddCatMenuGetter, AddCatMenuSetter] = useState(false);

  const [ErrorDataGetter, ErrorDataSetter] = useState({res: undefined, code: 0, descr: "", upd_time: 0})

  document.documentElement.lang = "ru"; 
  document.documentElement.translate = "no"; 

  return (
    <div className='footer_wrapper'>

    
      <div className='app_container'>
         <Helmet>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>

            <link rel="manifest" href="/manifestv2.json"></link>
            <title>Wildberries Tracker</title>
            <link rel="icon" href={favicon}></link>
            <link rel="icon" href="https://static-basket-01.wbbasket.ru/vol0/i/wb-og-win.jpg" type="image/svg+xml"></link>

            <meta property="og:type" content="website"></meta>
            <meta property="og:url" content="https://www.wildberries.ru"></meta>
            <meta property="og:image" content="https://static-basket-01.wbbasket.ru/vol0/i/wb-og-win.jpg"></meta>
            <meta property="og:title" content="Интернет-магазин Wildberries: широкий ассортимент товаров - скидки каждый день!"></meta>
            <meta property="og:description" content="Коллекции женской, мужской и детской одежды, обуви, а также товары для дома и спорта. Информация о доставке и оплате. Таблицы размеров, советы по уходу за вещами."></meta>

            <meta name="description" content="Коллекции женской, мужской и детской одежды, обуви, а также товары для дома и спорта. Информация о доставке и оплате. Таблицы размеров, советы по уходу за вещами."></meta>
         </Helmet>

        <ErrorContext.Provider value={[ErrorDataGetter, ErrorDataSetter]}>
          <Header/>
          <Routes>
            <Route path="/" element={
                <CategoryWrapper canSubscribe={false}/>
            }/>
            <Route path="/profile" element={
                <Profile/>
            }/>
            <Route path="/favorite" element={
                <Favorite/>
            }/>

            <Route path="/register" element={
                <Register/>
            }/>
            <Route path="/sign-in" element={
                <Login/>
            }/>
            <Route path="/reset-password" element={
                <PasswordReset/>
            }/>

            <Route path="/admin" element={
                <Admin/> 
            }/>
            <Route path="/auth/vk/callback" element={<VKCallback />} />
            <Route path="/auth/telegram/callback" element={<TelegramCallback />} />
          </Routes>
          
          <Error visible_time={3} reset={() => this.forceUpdate()}/>
        </ErrorContext.Provider>
      </div>

      <footer>
        <div className='footer_container'>
          <div className='footer_item'>
            <h3 className='footer_item_head'>Пользователь</h3>
            <a className="footer_item_elem footer_item_text a_sign_out" onClick={() => {localStorage.removeItem("jwt")}} href=''>Выйти</a>
            <Link className="footer_item_elem footer_item_text a_sign_out" to="/sign-in" >Войти</Link>
            <Link className="footer_item_elem footer_item_text a_sign_out" to="/register">Регистрация</Link>
          </div>
          <div className='footer_item'>
            <h3 className='footer_item_head'>Администрирование</h3>
            <Link className="footer_item_elem footer_item_text a_sign_out" to='/admin'>Админ-панель</Link>
          </div>
          <div className='footer_item'>
            <h3 className='footer_item_head'>О нас</h3>
            <div className="footer_item_elem a_sign_out footer_item_text">
              <p>Что-то</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App;
