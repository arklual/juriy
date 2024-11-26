import "./Empty.css";

import { Link } from "react-router-dom";

const Empty = (props) => {
    return (
        <div className="unauthed_wrapper">
            <>
                <h1>Тут пусто</h1>
                <p>Возможно вам нужно вернуться <a href="/">На Главную</a></p>
            </>
        </div>
    )
}

export default Empty;