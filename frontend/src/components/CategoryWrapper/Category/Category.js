import './category.css';

import Card from './Card/Card';
import Topbar from './Topbar/Topbar';
import Requests_API from '../../../logic/req';
import Empty from '../../Empty/Empty';

import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePromise from 'react-use-promise';

import { FilterContext } from "../../../context/FilterContext";
import { ErrorContext } from '../../../context/ErrorContext';
import { FilterConfContext } from '../../../context/FilterConfContext';

const Category = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    let search_param = searchParams.get("src");
    let category_param = searchParams.get("cat");
    useEffect(
      () => {
        search_param = searchParams.get("src");
        category_param = searchParams.get("cat");
      }
    )


    let [req_type, set_req_type] = useState(props.type);

    if (category_param !== null && category_param !== ""){ req_type = "Category"}
    else if (search_param !== null && search_param !== ""){ req_type = "Search"}

    const [[FilterGetter, FilterSetter], [filterConf, setFilterConf]] = [useContext(FilterContext), useContext(FilterConfContext)];
    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    useEffect(() => {

      if (req_type === "Search" || req_type === "New"){
        setFilterConf({
          canChangeCat: true,
          extFiltration: true
        })
      }
      else if (req_type === "Favorite" || req_type === "Category") {
        setFilterConf({
          canChangeCat: false,
          extFiltration: true
        })
      }
      else { // favorite
        console.log("f")
        setFilterConf({
          canChangeCat: false,
          extFiltration: false
        })
      }
    }, [])
      
    
    const cards_array = (start = 0, count = 20) => {
      let params_cache = FilterGetter;

      params_cache.start = start;
      params_cache.count = count;

      if (req_type === "Category"){ params_cache.category = category_param; }
      else if (req_type === "Search"){ params_cache.req = search_param; }

      let config = {}

      if (req_type === "Category" || req_type === "New"){
        config = {
          method: "GET",
          sub_url: "get_cards",
          params: params_cache
        }
      }
      else if (req_type === "Search"){
        config = {
          method: "GET",
          sub_url: "search",
          params: params_cache
        }
      }
      else { // favorite
        config = {
          method: "GET",
          sub_url: "get_favorite",
          params: params_cache,
          headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
          }
        }
      }
      console.log(config);
      return Requests_API(
        config
      ).then((res)=>{
        if (res.code === 200) {
          return res
        }
        else {ErrorDataSetter(res.code, "Ошибка при загрузке карточек!")}
      })
    }

    const [card_arr, card_err, card_arr_state] = usePromise(
      () => cards_array(), [FilterGetter]
    )
    console.log(card_arr)
    const [addMenu, addMenuVisibilitySetter] = useState(false);

    return (
      <div className='category_wrapper'>
        
        <Topbar
          search_mode={req_type==="Search"}
          cat_name={category_param == null ? props.cat_name : category_param}
          canSubscribe={(props.canSubscribe || req_type==="Category")}
          canFilter={props.canFilter}
        />
        {
          (card_arr_state==="resolved" && card_arr.data.length === 0) ? <Empty/>: null
        }
        <div className='cards_wrapper'>
          {
              card_arr_state==="resolved" ? 
                card_arr.data.map((elem, idx) => {
                  return <Card id={elem.id} name={elem.name} cost={elem.price} image={elem.image} link={elem.url} isFavoriteState={props.isFavoriteState}/>
                })
              : null
          }
          {/*<div className='more_cards_wrapper'>
            <div className='more_label'>
              <p>Ещё...</p>
            </div>
            <div className='more_cards_gray'></div>
            <div className='more_cards'>
              <Card/>
            </div>
          </div>*/}
        </div>
      </div>
    )
}
// <a href="https://www.flaticon.com/free-icons/filter" title="filter icons">Filter icons created by joalfa - Flaticon</a>
// <a target="_blank" href="https://icons8.com/icon/24717/add">add button</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
Category.defaultProps = {
    cat_name: "Новинки",
    isFavoriteState: false,
    canSubscribe: true,
    canFilter: true,
    search_mode: false,
    type: "New"
}

export default Category;