import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import './category.css';
import Card from './Card/Card';
import Topbar from './Topbar/Topbar';
import Empty from '../../Empty/Empty';
import Requests_API from '../../../logic/req';

import { FilterContext } from '../../../context/FilterContext';
import { ErrorContext } from '../../../context/ErrorContext';
import { FilterConfContext } from '../../../context/FilterConfContext';

const PORTION_OF_ITEMS = 18; // Количество товаров на одной странице

// Функция для извлечения ID товара из URL (если нужна фильтрация дубликатов)
const extractIdFromUrl = (url) => {
  const match = url.match(/\/catalog\/(\d+)\//);
  return match ? match[1] : null;
};

const Category = (props) => {
  const [searchParams] = useSearchParams();

  // Стейты для карточек, загрузки и пагинации
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  // Если полученная порция меньше PORTION_OF_ITEMS, это последняя страница
  const [lastPage, setLastPage] = useState(null);

  // Получаем фильтры и ошибки из контекста
  const [[FilterGetter], [filterConf, setFilterConf]] = [
    useContext(FilterContext),
    useContext(FilterConfContext)
  ];
  const [errorData, ErrorDataSetter] = useContext(ErrorContext);

  let search_param = searchParams.get("src");
  let category_param = searchParams.get("cat");
  let req_type = props.type;
  if (category_param) req_type = "Category";
  else if (search_param) req_type = "Search";

  // Настройка фильтров в зависимости от типа запроса
  useEffect(() => {
    if (req_type === "Search" || req_type === "New") {
      setFilterConf({ canChangeCat: true, extFiltration: true });
    } else if (req_type === "Favorite" || req_type === "Category") {
      setFilterConf({ canChangeCat: false, extFiltration: true });
    } else {
      setFilterConf({ canChangeCat: false, extFiltration: false });
    }
  }, [req_type, setFilterConf]);

  // Функция загрузки карточек
  const fetchCards = useCallback(
    async (start, count) => {
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
        // Если возвращается меньше товаров, чем ожидалось – отмечаем последнюю страницу
        if (res.data.length < PORTION_OF_ITEMS) {
          setLastPage(page);
        }
        setIsLoading(false);
        window.scrollTo(0, 0);
        return res.data;
      } else {
        ErrorDataSetter({
          code: res.code,
          res,
          upd_time: Date.now(),
          descr: "Ошибка при загрузке карточек!"
        });
        setIsLoading(false);
        return [];
      }
    },
    [req_type, FilterGetter, search_param, category_param, ErrorDataSetter, page]
  );

  // При изменении номера страницы загружаем данные
  useEffect(() => {
    (async () => {
      const startIndex = (page - 1) * PORTION_OF_ITEMS;
      const newCards = await fetchCards(startIndex, PORTION_OF_ITEMS);
      setCards(newCards);
    })();
  }, [page, fetchCards]);
  //
  // if (errorData) {
  //   return <div className="loading">Загрузка...</div>;
  // }

  // Логика формирования блока номеров страниц:
  // Для страниц 1–7 – кнопки 1,2,...,7; для страниц 8–15 – кнопки 8–15; и т.д.
  let blockStart, blockEnd;
  if (page <= 7) {
    blockStart = 1;
    blockEnd = 7;
  } else {
    // Для страниц от 8 и далее блок вычисляется как:
    // blockStart = (floor((page-8)/8) * 8) + 8, blockEnd = blockStart + 7
    blockStart = Math.floor((page - 8) / 8) * 8 + 8;
    blockEnd = blockStart + 7;
  }
  // Если известна последняя страница, ограничиваем блок
  if (lastPage !== null) {
    blockEnd = Math.min(blockEnd, lastPage);
  }

  // Стили для кнопок (круглые, фиолетовые, с отступом 4px, без дефолтных стилей)
  const buttonStyle = {
    margin: "4px",
    border: "none",
    outline: "none",
    backgroundColor: "purple",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    color: "white",
    cursor: "pointer",
    padding: "0",
    fontSize: "14px",
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none"
  };

  const ellipsisStyle = {
    margin: "4px",
    display: "inline-block",
    color: "purple",
    fontSize: "16px",
    lineHeight: "32px"
  };

  // Формируем кнопки для текущего блока
  const pageButtons = [];

  let prevBlock = null;
  if(page > 1) {
    prevBlock = (
      <>
        <button
          onClick={() => setPage(page - 1)}
          style={{...buttonStyle,
            padding: "0 16px",
            width: "auto",
            borderRadius: "20px"
          }}
        >
          Предыдущая страница
        </button>
      </>
    );
  }

  for (let p = blockStart; p <= blockEnd; p++) {
    pageButtons.push(
      <button
        key={p}
        onClick={() => setPage(p)}
        style={{
          ...buttonStyle,
          opacity: p === page ? 1 : 0.8
        }}
      >
        {p}
      </button>
    );
  }

  // Если данные ещё могут быть, показываем три точки и кнопку для перехода к следующему блоку
  let nextBlock = null;
  if (lastPage === null || blockEnd < lastPage) {
    nextBlock = (
      <>
        <span style={ellipsisStyle}>...</span>
        <button
          onClick={() => setPage(page + 1)}
          style={{...buttonStyle,
            padding: "0 16px",
            width: "auto",
            borderRadius: "20px"
          }}
        >
          Следующая страница
        </button>
      </>
    );
  }

  return (
    <div className="category_wrapper">
      <Topbar
        search_mode={req_type === "Search"}
        cat_name={category_param ?? props.cat_name}
        canSubscribe={props.canSubscribe || req_type === "Category"}
        canFilter={props.canFilter}
      />

      {cards.length === 0 && !isLoading && <Empty />}

      {isLoading && <div className="loading">Загрузка...</div>}

      <div className="cards_wrapper">
        {cards.map((elem) => (
          <Card
            key={elem.id}
            id={elem.id}
            name={elem.name}
            cost={elem.price}
            image={elem.image}
            category={elem.category}
            link={elem.url}
            isFavoriteState={props.isFavoriteState}
          />
        ))}
      </div>

      <div className="pagination" style={{ textAlign: "center", marginTop: "20px" }}>
        {prevBlock}
        {pageButtons}
        {nextBlock}
      </div>
    </div>
  );
};

Category.defaultProps = {
  cat_name: "Новинки",
  isFavoriteState: false,
  canSubscribe: true,
  canFilter: true,
  search_mode: false,
  type: "New"
};

export default Category;
