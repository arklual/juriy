import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import './category.css';
import Card from './Card/Card';
import Topbar from './Topbar/Topbar';
import Empty from '../../Empty/Empty';
import Requests_API from '../../../logic/req';

import { FilterContext } from '../../../context/FilterContext';
import { ErrorContext } from '../../../context/ErrorContext';
import { FilterConfContext } from '../../../context/FilterConfContext';

const PORTION_OF_ITEMS = 160;

// Функция для извлечения ID товара из URL
const extractIdFromUrl = (url) => {
  const match = url.match(/\/catalog\/(\d+)\//);
  return match ? match[1] : null;
};

const Category = (props) => {
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pos, setPos] = useState(0);

  // Фильтры и ошибки
  const [[FilterGetter], [filterConf, setFilterConf]] = [useContext(FilterContext), useContext(FilterConfContext)];
  const [, ErrorDataSetter] = useContext(ErrorContext);

  let search_param = searchParams.get("src");
  let category_param = searchParams.get("cat");
  let req_type = props.type;

  if (category_param) req_type = "Category";
  else if (search_param) req_type = "Search";

  // Установка конфигурации фильтров
  useEffect(() => {
    if (req_type === "Search" || req_type === "New") {
      setFilterConf({ canChangeCat: true, extFiltration: true });
    } else if (req_type === "Favorite" || req_type === "Category") {
      setFilterConf({ canChangeCat: false, extFiltration: true });
    } else {
      setFilterConf({ canChangeCat: false, extFiltration: false });
    }
  }, [req_type, setFilterConf]);

  // Функция загрузки товаров
  const fetchCards = useCallback(async (start, count) => {
    setIsLoading(true);
    let params_cache = { ...FilterGetter, start, count };

    if (req_type === "Category") params_cache.category = category_param;
    else if (req_type === "Search") params_cache.req = search_param;

    let config = {
      method: "GET",
      sub_url: req_type === "Search" ? "search" : "get_cards",
      params: params_cache,
    };

    const res = await Requests_API(config);

    if (res.code === 200) {
      return res.data;
    } else {
      setHasMore(false);
      ErrorDataSetter({ code: res.code, res, upd_time: Date.now(), descr: "Ошибка при загрузке карточек!" });
      return [];
    }
  }, [req_type, FilterGetter, search_param, category_param, ErrorDataSetter]);

  // Функция загрузки при скролле
  const loadMoreItems = async () => {
    if (isLoading || !hasMore) return;
    const newCards = await fetchCards(pos, PORTION_OF_ITEMS);

    setCards(prev => {
      // Фильтрация дубликатов
      const uniqueCards = newCards.filter(newItem =>
        !prev.some(existingItem => extractIdFromUrl(existingItem.url) === extractIdFromUrl(newItem.url))
      );
      return [...prev, ...uniqueCards];
    });

    setPos(prev => prev + PORTION_OF_ITEMS);
    if (newCards.length < PORTION_OF_ITEMS) setHasMore(false);
    setIsLoading(false);
  };

  // Первичная загрузка
  useEffect(() => {
    loadMoreItems();
  }, []);

  return (
    <div className="category_wrapper">
      <Topbar
        search_mode={req_type === "Search"}
        cat_name={category_param ?? props.cat_name}
        canSubscribe={props.canSubscribe || req_type === "Category"}
        canFilter={props.canFilter}
      />

      {cards.length === 0 && !isLoading && <Empty />}

      <InfiniteScroll
        dataLength={cards.length}
        next={loadMoreItems}
        hasMore={hasMore}
        loader={<div className="loading">Загрузка...</div>}
        endMessage={<p style={{ textAlign: 'center' }}>Больше товаров нет</p>}
      >
        <div className="cards_wrapper">
          {cards.map((elem) => (
            <Card
              key={elem.id}
              id={elem.id}
              name={elem.name}
              cost={elem.price}
              image={elem.image}
              link={elem.url}
              isFavoriteState={props.isFavoriteState}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

Category.defaultProps = {
  cat_name: "Новинки",
  isFavoriteState: false,
  canSubscribe: true,
  canFilter: true,
  search_mode: false,
  type: "New",
};

export default Category;
