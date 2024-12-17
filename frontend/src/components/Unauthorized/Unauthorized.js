import "./Unauthorized.css";

import { Link } from "react-router-dom";

const Unauthorized = (props) => {
    return (
        <div className="unauthed_wrapper">
            <>
                <h1>Ooops...</h1>
                <p>Для работы с {props.target} нужно <Link to="/sign-in">войти</Link> в аккаунт</p>
            </>
        </div>
    )
}

export default Unauthorized;