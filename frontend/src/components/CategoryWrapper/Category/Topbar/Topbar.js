import "./topbar.css";

import filterIcon from "./filter.svg";
import addIcon from "./add.svg";
import bellIcon from "./bell.svg";
import closeIcon from "./close.png";
import settingsIcon from "./settings.svg";

import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";

import Requests_API from "../../../../logic/req";

import { FilterContext } from "../../../../context/FilterContext";
import { FilterConfContext } from "../../../../context/FilterConfContext";
import { ErrorContext } from "../../../../context/ErrorContext";

const Topbar = (props) => {
  const [, setError] = useContext(ErrorContext);
  const [filter, setFilter] = useContext(FilterContext);
  const [filterConf] = useContext(FilterConfContext);

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("recent");

  const [categories, setCategories] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);

  // Состояния для фильтрации по категории, цене и датам
  const [activeCategory, setActiveCategory] = useState([]);
  const [floorPrice, setFloorPrice] = useState(0);
  const [topPrice, setTopPrice] = useState(0);
  const [timeStart, setTimeStart] = useState("");
  const [formattedTimeStart, setFormattedTimeStart] = useState("");
  const [timeFinish, setTimeFinish] = useState("");
  const [formattedTimeFinish, setFormattedTimeFinish] = useState("");

  const [isSubscribed, setIsSubscribed] = useState(false);

  // Функция форматирования даты из "YYYY-MM-DD" в "MM-DD-YYYY"
  const formatDate = (dateStr) => {
    const parts = dateStr.split("-");
    return parts.length === 3 ? `${parts[1]}-${parts[2]}-${parts[0]}` : dateStr;
  };

  // Обновление отформатированных дат при изменении исходных
  useEffect(() => {
    if (timeStart) {
      setFormattedTimeStart(formatDate(timeStart));
    }
  }, [timeStart]);

  useEffect(() => {
    if (timeFinish) {
      setFormattedTimeFinish(formatDate(timeFinish));
    }
  }, [timeFinish]);

  // Получение списка категорий
  const getCategories = () => {
    return Requests_API({
      method: "GET",
      sub_url: "categories",
    }).then((res) => {
      if (res.code === 200) {
        return res;
      } else {
        setError({
          code: res.code,
          res,
          upd_time: Date.now(),
          descr: "Ошибка при получении списка категорий!",
        });
        throw new Error("Ошибка запроса категорий");
      }
    });
  };

  useEffect(() => {
    getCategories()
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        setCategoriesError(err);
      });
  }, []);

  // Функция для применения фильтров
  const applyFilter = () => {
    const filterData = {
      sort: sortOrder,
      ...(activeCategory.length > 0 && filterConf.canChangeCat && { category: activeCategory[0] }),
      ...(formattedTimeStart && { time_start: formattedTimeStart }),
      ...(formattedTimeFinish && { time_finish: formattedTimeFinish }),
      ...(floorPrice && { price_floor: Number(floorPrice) }),
      ...(topPrice && { price_top: Number(topPrice) }),
    };

    setFilter(filterData);
  };

  // Функция для подписки/отписки
  const handleSubscribe = () => {
    Requests_API({
      method: "POST",
      sub_url: "follow_category",
      body: { category_name: props.cat_name },
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    }).then((res) => {
      if (res.code === 201) {
        setIsSubscribed(!isSubscribed);
      } else {
        setError({
          code: res.code,
          res,
          upd_time: Date.now(),
          descr: "Авторизуйтесь для подписки!",
        });
      }
    });
  };

  return (
    <>
      <div className="categoty_header">
        {/* Скрываем заголовок в режиме поиска */}
        <h1 style={{ display: props.search_mode ? "none" : "block" }}>{props.cat_name}</h1>

        <div className={`filter_and_subscribe${props.search_mode ? " fns_src_mode" : ""}`}>
          {/* Пример использования иконок (закомментированный код для добавления, если понадобится) */}
          {/* <img className="fns_icon" src={addIcon} onClick={() => {}} alt="Добавить" /> */}
          <img
            className={`fns_icon${isFilterVisible ? " filter_img_active" : ""}`}
            src={settingsIcon}
            onClick={() => setFilterVisible(!isFilterVisible)}
            alt="Настройки"
          />
          {props.canSubscribe && !props.search_mode && (
            <button
              className={`${isSubscribed ? "gray" : ""}`}
              onClick={handleSubscribe}
            >
              <img src={bellIcon} className="subscribe_btn_img" alt="Подписка" />
              <p className="subscribe_btn_text">
                {isSubscribed ? "Отписаться" : "Подписаться"}
              </p>
            </button>
          )}
        </div>
      </div>

      <div className={isFilterVisible ? "filter_container" : "filter_container_hidden"}>
        <div className="filter_head">
          <p className="filter_title">Фильтры</p>
          <img
            className="filter_close"
            src={closeIcon}
            onClick={() => setFilterVisible(!isFilterVisible)}
            alt="Закрыть"
          />
        </div>
        <div className="filter_category">
          <h3>Сортировка</h3>
          <div className="cat_wrapper">
            <button
              onClick={() => setSortOrder("recent")}
              className={`cat_wrapper_btn${sortOrder === "recent" ? " cat_wrapper_btn_clicked" : ""}`}
            >
              Сначала новое
            </button>
            <button
              onClick={() => setSortOrder("oldest")}
              className={`cat_wrapper_btn${sortOrder === "oldest" ? " cat_wrapper_btn_clicked" : ""}`}
            >
              Сначала старое
            </button>
            <button
              onClick={() => setSortOrder("price_upscending")}
              className={`cat_wrapper_btn${sortOrder === "price_upscending" ? " cat_wrapper_btn_clicked" : ""}`}
            >
              По возрастанию цены
            </button>
            <button
              onClick={() => setSortOrder("price_descending")}
              className={`cat_wrapper_btn${sortOrder === "price_descending" ? " cat_wrapper_btn_clicked" : ""}`}
            >
              По убыванию цены
            </button>
          </div>
        </div>
        {filterConf.extFiltration && (
          <div className="filter_category">
            <h3>Цена, ₽</h3>
            <div className="price_wrapper">
              <div className="price_elem">
                <p>От</p>
                <input type="number" onChange={(e) => setFloorPrice(e.target.value)} />
              </div>
              <div className="price_elem">
                <p>До</p>
                <input type="number" onChange={(e) => setTopPrice(e.target.value)} />
              </div>
            </div>
          </div>
        )}
        {filterConf.canChangeCat && (
          <div className="filter_category">
            <h3>Категории</h3>
            <div className="cat_wrapper">
              <button
                onClick={() => setActiveCategory([])}
                className={`cat_wrapper_btn${activeCategory.length === 0 ? " cat_wrapper_btn_clicked" : ""}`}
              >
                Все
              </button>
              {categories ? (
                categories.map((elem, idx) => {
                  const isActive = activeCategory.includes(elem.title);
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        setActiveCategory(isActive ? [] : [elem.title])
                      }
                      className={`cat_wrapper_btn${isActive ? " cat_wrapper_btn_clicked" : ""}`}
                    >
                      {elem.title}
                    </button>
                  );
                })
              ) : (
                <p>нету категори</p>
              )}
            </div>
          </div>
        )}
        {filterConf.extFiltration && (
          <div className="filter_category">
            <h3>Время добавления</h3>
            <div className="price_wrapper">
              <div className="price_elem">
                <p>От</p>
                <input type="date" onChange={(e) => setTimeStart(e.target.value)} />
              </div>
              <div className="price_elem">
                <p>До</p>
                <input type="date" onChange={(e) => setTimeFinish(e.target.value)} />
              </div>
            </div>
          </div>
        )}
        <div className="filter_submit_wrapper">
          <button
            className="filter_submit"
            onClick={() => {
              applyFilter();
              setFilterVisible(false);
            }}
          >
            Применить
          </button>
        </div>
      </div>
    </>
  );
};

export default Topbar;
