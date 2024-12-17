import "./delCardMenu.css";

import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";

import Requests_API from "../../../../logic/req";

import { ErrorContext } from "../../../../context/ErrorContext";

const DelCatMenu = (props) => {
    const [catName, setCatName] = useState("");

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    return (
        <div className="DelCardMenu_container">
            <h3>Удалить карточку</h3>
            <input placeholder="Введите ID карточки" required onChange={e => setCatName(e.target.value)}></input>
            <button disabled>
                <p>Удалить</p>
            </button>
        </div>
    )
}
export default DelCatMenu;