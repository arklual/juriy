import "./addCardMenu.css";

import usePromise from 'react-use-promise';
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";

import Requests_API from "../../../../logic/req";

import { ErrorContext } from "../../../../context/ErrorContext";

const AddCardMenu = (props) => {
    const [cardName, setCardName] = useState("");
    const [catName, setCatName] = useState("Категория");
    const [cardSending, cardSendingSetter] = useState(false);

    const [cardDate, setCardDate] = useState("");
    let [cardDateCache, [cardDateUpdGetter, cardDateUpdSetter]] = [cardDate, useState("")];
    useEffect( () => {
        if (cardDateCache != ""){
            cardDateCache = cardDateCache.split("-");
            cardDateUpdSetter(cardDateCache[2]+"-"+cardDateCache[1]+"-"+cardDateCache[0]);
        }
    })

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const get_cat_arr = () => {
        return Requests_API(
            {
              method: "GET",
              sub_url: "categories",
            }
        ).then((res)=>{
            if (res.code === 200){ return res }
            else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при получении списка категорий!"}); }
        })
    }

    const card_create = () => {
        cardSendingSetter(true);
        Requests_API(
            {
              method: "POST",
              sub_url: "create_card",
              body: {
                target_url: cardName,
                category: catName,
                shutdown_time: cardDateUpdGetter
              },
              headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
              },
              timeout: 30000
            }
        ).then((res)=>{
            cardSendingSetter(false);

            setCardName("");
            setCatName("Категория");
            setCardDate("");

            if (res.code === 200) {}
            else {ErrorDataSetter(res.code, "Ошибка при создании карточки!")}
        })
    }
    const [cat_arr, cat_err, cat_arr_state] = usePromise(
        () => get_cat_arr(), []
    );
    
    return (
        <div className="AddCardMenu_container">
            <h3>Создать карту</h3>

            <input placeholder="Введите ссылку на товар" type="url" required onChange={e => setCardName(e.target.value)} value={cardName}></input>
            <div className="cat_n_date">
                <select onChange={e => setCatName(e.target.value)} defaultValue="Категория" value={catName}>
                    <option disabled>Категория</option>
                    {
                        cat_arr_state==="resolved" ? cat_arr.data.map((elem, idx) =>
                            <option key={idx} value={elem.title}>{elem.title}</option>
                        ) : null
                    }
                </select>
                <input type="date" required onChange={e => setCardDate(e.target.value)} value={cardDate}></input>
            </div>
            
            <button onClick={card_create} className={cardSending ? "AddCard_disabled_btn" : ""}>
                <p>Создать</p>
            </button>
        </div>
    )
}
export default AddCardMenu;