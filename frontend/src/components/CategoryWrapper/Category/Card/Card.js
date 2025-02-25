import './card.css';
import product from "./1.webp";
import cart from "./cart.svg";

import { useState, useContext } from 'react';
import Requests_API from '../../../../logic/req';
import { ErrorContext } from '../../../../context/ErrorContext';

const Card = (props) => {
  const [isFavorite, setFavorite] = useState(props.isFavoriteState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

  const card_fav = (id, fav) => {
    if (fav === true) {
      return Requests_API({
        method: "POST",
        sub_url: "add_favorite",
        body: { card_id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(localStorage.getItem("jwt"))
        },
      }).then((res) => {
        if (res.code === 201) {
          return res;
        } else {
          ErrorDataSetter({
            code: res.code,
            res: res,
            upd_time: Date.now(),
            descr: "Ошибка при добавлении в избранное!"
          });
        }
      });
    } else {
      return Requests_API({
        method: "DELETE",
        sub_url: "del_favorite",
        params: { card_id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(localStorage.getItem("jwt"))
        },
      }).then((res) => {
        if (res.code === 201) {
          return res;
        } else {
          ErrorDataSetter({
            code: res.code,
            res: res,
            upd_time: Date.now(),
            descr: "Ошибка при удалении из избранного!"
          });
        }
      });
    }
  };

  // Расчет старой цены
  const oldPrice = Math.min(
    props.cost + 5000,
    Math.floor(props.cost * (Math.random() / 2 + 1))
  );

  return (
    <>
      <div className='card_frame'>
        <div className='id'>
          <p>{props.id}</p>
        </div>

        <div className='fav_ico_area' onClick={() => {
          card_fav(props.id, !isFavorite);
          setFavorite(!isFavorite);
        }}></div>
        <div className={"fav_ico" + (isFavorite ? " fav_ico_active" : "")}></div>

        {/* Клик по изображению открывает модальное окно */}
        <div onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
          <img src={props.image} alt="product_img" className='product_img' />
        </div>

        <div className='card_cost_container'>
          <p className='card_cost'>{props.cost} ₽</p>
          <p className='card_cost_sell'>{oldPrice} ₽</p>
        </div>

        <div className='card_name_wrapper'>
          <p className='card_name'>{props.name}</p>
        </div>

        <a href={props.link}>
          <button className='buy_card_btn'>
            <img src={cart} alt="cart_img" />
            <p>Купить</p>
          </button>
        </a>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setIsModalOpen(false)}>
              ×
            </span>
            <img src={props.image} alt="Large product" className="modal-image" />
            <div className="modal-details">
              <h2>{props.name}</h2>
              <p className="modal-price">{props.cost} ₽
              <span className="modal-old-price">{oldPrice} ₽</span>
              </p>
              <p className="modal-category">{props.category}</p>
              <a href={props.link} target="_blank" rel="noopener noreferrer">
                <button className='buy_card_btn'>
                  <img src={cart} alt="cart_img" />
                  <p>Купить</p>
                </button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

Card.defaultProps = {
  id: 1,
  name: "MARRAKECH ROYAL SPA",
  cost: 557,
  image: product,
  isFavoriteState: false,
  link: "#",
  category: "Категория товара" // Добавили свойство категории
};

export default Card;
