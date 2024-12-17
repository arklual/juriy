import "./topbar.css"

import filter from "./filter.svg"
import add from "./add.svg"
import bell from "./bell.svg"
import close from "./close.png"
import settings from "./settings.svg"

import { useEffect, useState } from "react"
import { useContext } from "react"
import usePromise from "react-use-promise"
import { useSearchParams } from "react-router-dom"

import Requests_API from "../../../../logic/req"

import { FilterContext } from "../../../../context/FilterContext";
import { FilterConfContext } from "../../../../context/FilterConfContext"
import { ErrorContext } from "../../../../context/ErrorContext";

const Topbar = (props) => {
    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const [[FilterGetter, FilterSetter], [filterConf, setFilterConf]] = [useContext(FilterContext), useContext(FilterConfContext)];

    const [filterImg, activeFilterImg] = useState(false);

    const [sortGetter, sortSetter] = useState("recent");

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
    const [cat_arr, cat_err, cat_arr_state] = usePromise(
      () => get_cat_arr(), []
    );
    const [activeCatArray, setActiveCatArray] = useState([]);

    const [[floorPriceGetter, floorPriceSetter], [topPriceGetter, topPriceSetter]] = [useState(0), useState(0)];

    const [timeStart, setTimeStart] = useState("");
    let [timeStartCache, [timeStartUpdGetter, timeStartUpdSetter]] = [timeStart, useState("")];
    useEffect( () => {
        if (timeStartCache != ""){
            timeStartCache = timeStartCache.split("-");
            timeStartUpdSetter(timeStartCache[1]+"-"+timeStartCache[2]+"-"+timeStartCache[0]);
        }
    })

    const [timeFinish, setTimeFinish] = useState("");
    let [timeFinishCache, [timeFinishUpdGetter, timeFinishUpdSetter]] = [timeFinish, useState("")];
    useEffect( () => {
        if (timeFinishCache != ""){
            timeFinishCache = timeFinishCache.split("-");
            timeFinishUpdSetter(timeFinishCache[1]+"-"+timeFinishCache[2]+"-"+timeFinishCache[0]);
        }
    })

    const [subGetter, subSetter] = useState(false);

    const apply_filter = () => {
      let cache = {};

      cache.sort = sortGetter;
      if (activeCatArray != [] && filterConf.canChangeCat){cache.category = activeCatArray[0]}
      if (timeStartUpdGetter != ""){cache.time_start = timeStartUpdGetter}
      if (timeFinishUpdGetter != ""){cache.time_finish = timeFinishUpdGetter}
      if (floorPriceGetter != 0){cache.price_floor = Number(floorPriceGetter)}
      if (topPriceGetter != 0){cache.price_top = Number(topPriceGetter)}

      FilterSetter(
        cache
      )
    }

    const subscruibe = (name) => {
        return Requests_API(
            {
              method: "POST",
              sub_url: "follow_category",
              body: {
                category_name: name
              },
              headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
              }
            }
        ).then((res)=>{
            if (res.code === 201){ return true }
            else { ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Авторизуйтесь для подписки!"}); return false }
        })
    }

    return (
        <>
          <div className='categoty_header'>
            <h1 style={{display: props.search_mode ? "none" : "block"}}>{props.cat_name}</h1>

            <div className={'filter_and_subscribe' + (props.search_mode ? " fns_src_mode": "")}>
              {/*<img className="fns_icon" src={add} onClick={() => {addMenuVisibilitySetter(!addMenu); console.log(addMenu)}}></img>*/}
              <img className={"fns_icon" + (filterImg ? " filter_img_active" : "")} src={settings} onClick={() => {activeFilterImg(!filterImg)}}></img>
              <button
                className={(subGetter ? 'gray': "") + ((props.canSubscribe && !props.search_mode) ? "": " hide_btn")}
                onClick={() => {subscruibe(props.cat_name).then((res) => {if (res) {subSetter(!subGetter)}})}}
              >
                <img src={bell} className="subscribe_btn_img"></img>
                <p className='subscribe_btn_text'>{subGetter ? "Отписаться" : "Подписаться"}</p>
              </button>
            </div>
          </div>

          <div className={(filterImg ? "filter_container" : "filter_container_hidden")}>
            <div className="filter_head">
              <p className="filter_title">Фильтры</p>
              <img className="filter_close" src={close} onClick={() => {activeFilterImg(!filterImg)}}></img>
            </div>
            <div className="filter_category">
              <h3>Сортировка</h3>
              <div className="cat_wrapper">
                <button onClick={()=>{sortSetter("recent")}} className={"cat_wrapper_btn" + (sortGetter==="recent" ? " cat_wrapper_btn_clicked" : "")}>Сначала новое</button>
                <button onClick={()=>{sortSetter("oldest")}} className={"cat_wrapper_btn" + (sortGetter==="oldest" ? " cat_wrapper_btn_clicked" : "")} >Сначала старое</button>
                <button onClick={()=>{sortSetter("price_upscending")}} className={"cat_wrapper_btn" + (sortGetter==="price_upscending" ? " cat_wrapper_btn_clicked" : "")}>По возрастанию цены</button>
                <button onClick={()=>{sortSetter("price_descending")}} className={"cat_wrapper_btn" + (sortGetter==="price_descending" ? " cat_wrapper_btn_clicked" : "")}>По убыванию цены</button>
              </div>
            </div>
            <div className="filter_category" style={{display: filterConf.extFiltration ? "block" : "none"}}>
              <h3>Цена, ₽</h3>
              <div className="price_wrapper">
                <div className="price_elem">
                  <p>От</p>
                  <input onChange={e => floorPriceSetter(e.target.value)}/>
                </div>
                <div className="price_elem">
                  <p>До</p>
                  <input onChange={e => topPriceSetter(e.target.value)}/>
                </div>
              </div>
            </div>
            <div className="filter_category" style={{display: filterConf.canChangeCat ? "block" : "none"}}>
              <h3>Категории</h3>
              <div className="cat_wrapper">
                <button onClick={()=>{setActiveCatArray([])}} className={"cat_wrapper_btn" + (activeCatArray.length===0 ? " cat_wrapper_btn_clicked" : "")}>Все</button>
                {
                    cat_arr_state==="resolved" ? cat_arr.data.map((elem, idx) =>{
                        const isActive = activeCatArray.includes(elem.title);
                        return (<button 
                          key={idx}
                          onClick={() => setActiveCatArray(isActive
                            ? activeCatArray = []
                            : [elem.title]
                          )} 
                          className={"cat_wrapper_btn" + (isActive ? " cat_wrapper_btn_clicked" : "")}>
                            {elem.title}
                          </button>
                        )
                    }
                    ) : null
                }
                {/*
                    cat_arr_state==="resolved" ? cat_arr.data.map((elem, idx) =>{
                        const isActive = activeCatArray.includes(elem.title);
                        return (<button 
                          key={idx}
                          onClick={() => setActiveCatArray(isActive
                            ? activeCatArray.filter(current => current !== elem.title)
                            : [...activeCatArray, elem.title]
                          )} 
                          className={"cat_wrapper_btn" + (isActive ? " cat_wrapper_btn_clicked" : "")}>
                            {elem.title}
                          </button>
                        )
                    }
                    ) : null
                */}
              </div>
            </div>
            <div className="filter_category" style={{display: filterConf.extFiltration ? "block" : "none"}}>
              <h3>Время добавления</h3>
              <div className="price_wrapper">
                <div className="price_elem">
                  <p>От</p>
                  <input type='date' inputMode="numeric" onChange={e => setTimeStart(e.target.value)} />
                </div>
                <div className="price_elem">
                  <p>До</p>
                  <input type='date' inputMode="numeric" onChange={e => setTimeFinish(e.target.value)}/>
                </div>
              </div>
            </div>
            <div className="filter_submit_wrapper">
              <button className="filter_submit" onClick={() => {apply_filter(); activeFilterImg(!filterImg)}}>
                Применить
              </button>
            </div>
          </div>
        </>
    )
}

Topbar.defaultProps = {
  cat_name: "Новинки",
  canSubscribe: true,
  canFilter: false
}

export default Topbar;