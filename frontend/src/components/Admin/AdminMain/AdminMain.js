import "./admin.css";

import AddCatMenu from "./AddCatMenu/AddCatMenu";
import AddCardMenu from "./AddCardMenu/AddCardMenu";
import DelCardMenu from "./DelCardMenu/DelCardMenu";
import DelCatMenu from "./DelCatMenu/DelCatMenu";

import { AdminContext } from "../../../context/AdminContext";

const AdminMain = () => {

    return (
        <div className="admin_wrapper">
            <AddCatMenu/>
            <AddCardMenu/>
            <DelCardMenu/>
            <DelCatMenu/>
        </div>   
    )
}

export default AdminMain;