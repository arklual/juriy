import './profileMain.css';

import CategoryWrapper from '../../CategoryWrapper/CategoryWrapper';

import Requests_API from '../../../logic/req';
import { useContext } from 'react';
import usePromise from 'react-use-promise';

import Empty from '../../Empty/Empty';

import { ErrorContext } from '../../../context/ErrorContext';

const ProfileMain = (props) => {
    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const get_cat_arr = () => {
      return Requests_API(
          {
            method: "GET",
            sub_url: "get_followed_categories",
            headers: {
              'Content-Type': 'application/json',
              'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
            }
          }
      ).then((res)=>{
          if (res.code === 200){ return res }
          else { return ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при получении списка подписок!"}); }
      })
    }
    const unsub = (cat) => {
      return Requests_API(
          {
            method: "DELETE",
            sub_url: "unfollow_category",
            body: {
              category_name: cat
            },
            headers: {
              'Content-Type': 'application/json',
              'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
            }
          }
      ).then((res)=>{
          if (res.code === 201){ return res }
          else { return ErrorDataSetter({code: res.code, res: res, upd_time: Date.now(), descr: "Ошибка при отписке от категории!"}); }
      })
    }
    const [cat_arr, cat_err, cat_arr_state] = usePromise(
        () => get_cat_arr(), []
    );

    console.log(cat_arr)
    return(
        <>
            <div className='profile_block'>
              <h1>Мои подписки</h1>
              <div className='profile_body'>
                {
                  cat_arr_state==="resolved" ? cat_arr.data.map((elem, idx) =>
                    <div className='profile_item'>
                      <p>{elem.title}</p>
                      <button onClick={() => unsub(elem.title)}>
                        <p>Отписаться</p>
                      </button>
                    </div>
                  ) : null
                }
                {
                  (cat_arr_state==="resolved" && cat_arr.data.length === 0) ? <Empty/>: null
                }
              </div>
            </div>
            <CategoryWrapper cat_name="Избранное" isFavoriteState={true} canSubscribe={false} type="Favorite" />
        </>
    )
}

export default ProfileMain