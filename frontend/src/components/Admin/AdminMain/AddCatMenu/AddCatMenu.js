import "./addCatMenu.css";

import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";

import Requests_API from "../../../../logic/req";

import { ErrorContext } from "../../../../context/ErrorContext";

const AddCatMenu = (props) => {
    const [catName, setCatName] = useState("");

    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);

    const cat_create = () => {
        Requests_API(
            {
              method: "POST",
              sub_url: "add_category",
              body: {
                category_name: catName
              },
              headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(localStorage.getItem("jwt"))
              }
            }
        ).then((res)=>{
            setCatName("");
            
            if (res.code === 200) {}
            else {ErrorDataSetter(res.code, "Ошибка при создании категории!"); }
        })
    }

    return (
        <div className="AddCatMenu_container">
            <h3>Создать категорию</h3>
            <input placeholder="Введите название категории" required onChange={e => setCatName(e.target.value)} value={catName}></input>
            <button onClick={cat_create}>
                <p>Создать</p>
            </button>
        </div>
    )
}
export default AddCatMenu;