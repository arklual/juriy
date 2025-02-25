import './header.css';
import favorite from './favorite.svg';
import profile from './profile.svg';
import cross from "./close.png"
import search from "./search.svg"

import SideMenu from './SideMenu/SideMenu';

import { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import usePromise from 'react-use-promise';
import { useSearchParams } from 'react-router-dom';
import useLocalStorage from 'use-local-storage';
import { useMemo } from 'react';
import { useRef } from 'react';
import debounce from 'lodash/debounce';
import logo from './logo.jpg';

import { ErrorContext } from '../../context/ErrorContext';

import Requests_API from '../../logic/req';

const Header = () => {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    let search_param = searchParams.get("src");
    
    const get_val = () => {
        if (search_param === null){return ""}
        else{ return search_param}
    }
    const [value, setValue] = useState(get_val);

    const [searchInp, activeSearchInp] = useState(false);

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const get_cards_arr = (val) => {
        return Requests_API(
            {
              method: "GET",
              sub_url: "search",
              params: {
                req: val,
                start: 0,
                count: 5,
                sort: "recent"
              }
            }
        ).then((res)=>{
            if (res.code === 200){ console.log("gca", val, res); return res; }
            else {return {data: null}}
        })
    }
    
    const [results, setResults] = useState([]);

    const handleInputChange = useMemo(() => debounce((str) => {
        if (str.length < 3){ setResults([]); return};

        get_cards_arr(str).then((res)=>{
            setResults(res.data)
        }
        );
    }, 100), []);

    return (
        <header>
            <div className='header_container'>
                
                <h2 className="headr_logo">IDEALPICK</h2>

                <SideMenu/>
                
                <div className='search_container'>
                    <div className='searchInput_wrapper'>
                        <div className='searchInput_n_help'>
                            <input className="searchInput"
                                placeholder='Найти товар'
                                value={value}
                                onFocus={()=>{activeSearchInp(true)}}
                                onChange={(e) => {setValue(e.target.value); handleInputChange(e.target.value); if (e.target.value !== ""){activeSearchInp(true)};}}
                                onKeyUp={(e) => {
                                    if (e.key === "Enter"){
                                        navigate("/?src="+value);
                                        activeSearchInp(false);
                                        window.location.reload();
                                    }   
                                }}
                            />
                        </div>
                        <div className='icons_container'> 
                            <img src={cross} className={(searchInp && value != "") ? 'searchInputCross' : "icons_container_item_hidden"} onClick={() => {activeSearchInp(!searchInp); setValue('')}}></img>
                            <a onClick={() => {activeSearchInp(!searchInp);} } href={"/?src="+value}>
                                <img src={search} className={(searchInp && value != "") ? 'searchInputSearch' : "icons_container_item_hidden"}></img>
                            </a>
                        </div>
                        <div className={(searchInp && value != "") ? "searchInput_help" : "searchInput_help_hidden"}>
                            <a onClick={() => {activeSearchInp(!searchInp);} } href={"/?src="+value}>
                                <div className='help_item'>
                                    <img src={search}></img>
                                    <p>{value}</p>
                                </div>
                            </a>
                        {
                            results.map((elem, idx) =>{
                                return (
                                <a href={"/?src="+elem.name}>
                                    <div className='help_item' key={idx} >
                                        <img src={search}></img>
                                        <p>{elem.name}</p>
                                    </div>
                                </a>
                                )
                            })
                        } 
                            
                        </div>
                    </div>
                    <div className={"gray_screen" + (searchInp ? " nonhidden_gray_screen" : " hidden_gray_screen")} onClick={() => {activeSearchInp(!searchInp)}}></div>
                </div>
                

                <Link to="/favorite" className='header_item_parent'>
                    <div className='header_item'>
                        <img src={favorite} alt="fav-img"/>
                        <p>Избранное</p>
                    </div>
                </Link>

                <Link to="/profile" className='header_item_parent'>
                    <div className='header_item'>
                        <img src={profile} alt="profile-img"/>
                        <p>Профиль</p>
                    </div>
                </Link>
            </div>           
        </header>
    )
}

export default Header;