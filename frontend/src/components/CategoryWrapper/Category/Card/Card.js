import './card.css';
import product from "./1.webp"
import cart from "./cart.svg"

import { useState } from 'react';
import usePromise from 'react-use-promise';
import { useContext } from 'react';

import Requests_API from '../../../../logic/req';

import { ErrorContext } from '../../../../context/ErrorContext';

const Card = (props) => {
    const [isFavorite, setFavorite] = useState(props.isFavoriteState);

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const card_fav = (id, fav) => {
        if (fav === true) {
            return Requests_API(
                {
                  method: "POST",
                  sub_url: "add_favorite",
                  body: {
                    card_id: id
                  },
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
                  },
                }
              ).then((res)=>{
                  if (res.code === 201){ return res }
                  else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при добавлении в избранное!"}); }
              })
        }
        else{
            return Requests_API(
                {
                  method: "DELETE",
                  sub_url: "del_favorite",
                  params: {
                    card_id: id
                  },
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
                  },
                }
              ).then((res)=>{
                  if (res.code === 201){ return res }
                  else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при удалении из избранного!"}); }
              })
        }
    }
    

    return (
        <div className='card_frame'>
            <div className='id'>
                <p>{props.id}</p>
            </div>

            <div className='fav_ico_area' onClick={() => {card_fav(props.id, !isFavorite); setFavorite(!isFavorite)}}></div>
            <div className={"fav_ico" + (isFavorite ? " fav_ico_active" : "")}></div>

            <a href={props.image}>
                <img src={props.image} alt = "product_img" className='product_img'/>
            </a>

            <div className='card_cost_container'>
                <p className='card_cost'>{props.cost} ₽</p>
                <p className='card_cost_sell'>{Math.min(props.cost+5000, Math.floor(props.cost*(Math.random()/2+1)))} ₽</p>
            </div>

            <div className='card_name_wrapper'>
                <p className='card_name'>{props.name}</p>
            </div>
            
            <a href={props.link}>
                <button className='buy_card_btn'>
                    <img src={cart} alt = "cart_img"/> 
                    <p>Купить</p>
                </button>
            </a>
        </div>
    )
}

Card.defaultProps = {
    id: 1,
    name: "MARRAKECH ROYAL SPA",
    cost: 557,
    image: product,
    isFavoriteState: false,
    link: "#"
}

export default Card;