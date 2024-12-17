import "./delCatMenu.css";

import usePromise from 'react-use-promise';
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";

import Requests_API from "../../../../logic/req";

import { ErrorContext } from "../../../../context/ErrorContext";

const DelCatMenu = (props) => {
    const [catName, setCatName] = useState("Категория");

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
    const del_cat = () => {
        return Requests_API(
            {
                method: "DELETE",
                sub_url: "del_category",
                body: {
                    "category_name": catName
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
                }
            }
        ).then((res)=>{
            setCatName("Категория");

            if (res.code === 201){ return res }
            else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при удалении категории!"}); }
        })
    }
    const [cat_arr, cat_err, cat_arr_state] = usePromise(
        () => get_cat_arr(), []
    );

    return (
        <div className="AddCatMenu_container">
            <h3>Удалить категорию</h3>
            <select onChange={e => setCatName(e.target.value)} defaultValue="Категория" value={catName}>
                <option disabled>Категория</option>
                {
                    cat_arr_state==="resolved" ? cat_arr.data.map((elem, idx) =>
                        <option key={idx} value={elem.title}>{elem.title}</option>
                    ) : null
                }
            </select>
            <button onClick={del_cat}>
                <p>Удалить</p>
            </button>
        </div>
    )
}
export default DelCatMenu;