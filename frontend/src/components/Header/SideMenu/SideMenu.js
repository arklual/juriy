import "./sidemenu.css";
import add from "./add.svg"

import Requests_API from '../../../logic/req';

import usePromise from 'react-use-promise';
import { useState } from "react";
import {useContext} from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import CategoryWrapper from "../../CategoryWrapper/CategoryWrapper";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";

import { ErrorContext } from "../../../context/ErrorContext";

const SideMenu = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const category_param = searchParams.get("cat");

    const [burgerMenu, activeBurgerMenu] = useState(false);

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const get_cat_arr = () => {
        return Requests_API(
            {
              method: "GET",
              sub_url: "categories",
            }
        ).then((res)=>{
            if (res.code === 200){ return res }
            else { return ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при получении списка категорий!"}); }
        })
    }
    const [cat_arr, cat_err, cat_arr_state] = usePromise(
        () => get_cat_arr(), []
    );

    return (
        <>
            <button className='header_item header-btn' onClick={() => {activeBurgerMenu(!burgerMenu)}}>
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div className={"gray_screen" + (burgerMenu ? " nonhidden_gray_screen" : " hidden_gray_screen")} onClick={() => {activeBurgerMenu(!burgerMenu)}}></div>
            <div className={'side_menu' + (burgerMenu ? " nonhidden_side_menu" : " hidden_side_menu")}>
                <a href="/" onClick={() => {activeBurgerMenu(!burgerMenu)}} className="remove_a_decor">
                    <li className='side_menu_category main_pg_side_category'>
                        <p>На Главную</p>
                    </li>
                </a>
                <a href="/profile" onClick={() => {activeBurgerMenu(!burgerMenu)}} className="remove_a_decor">
                    <li className='side_menu_category'>
                        <p>Профиль</p>
                    </li>
                </a>
                <a href="/favorite" onClick={() => {activeBurgerMenu(!burgerMenu)}} className="remove_a_decor">
                    <li className='side_menu_category'>
                        <p>Избранное</p>
                    </li>
                </a>

                <li className='remove_a_decor side_menu_category_big'>
                    <p>Категории</p>
                    {/*<img src={add} onClick={() => {AddCatMenuSetter(!AddCatMenuGetter)}} className="side_menu_category_big_img"></img>*/}
                </li>
                
                {
                    cat_arr_state==="resolved" ? cat_arr.data.map((elem, idx) =>
                        <a href={"/?cat="+elem.title}>
                            <li className='side_menu_subcategory' key={idx} onClick={() => {activeBurgerMenu(!burgerMenu)}}>
                                <p>{elem.title}</p>
                            </li>
                        </a>
                    ) : null
                }
            </div>

            </>
    )
}

export default SideMenu;