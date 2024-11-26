import "./error.css";

import { useEffect, useState } from "react";

import { useContext } from "react";
import { ErrorContext } from "../../context/ErrorContext";

const Error = (props) => {
    const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext);
    const [isVisible, setVisibility] = useState(" err_hidden");

    useEffect(() => {
        const timeout = props.visible_time*1000

        if (Date.now() - ErrorDataGetter.upd_time < timeout){
            setVisibility(" err_visible");
            console.log(ErrorDataGetter.descr, ErrorDataGetter.res)
            setTimeout(() => {setVisibility(" err_hidden");}, timeout);
        }
    }, [ErrorDataGetter.upd_time]);

    return (
        <div className={"error_container" + isVisible}>
            <h1>{ErrorDataGetter.code || "500"}</h1>
            <h2>{ErrorDataGetter.descr || "Что-то пошло не так!"}</h2>
        </div>
    );
}

export default Error;