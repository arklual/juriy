import AdminMain from "./AdminMain/AdminMain";
import Unauthorized from "../Unauthorized/Unauthorized";

const Admin = () => {
    const isLoggedIn = localStorage.getItem("jwt") != undefined;
    return (
        <>
            {isLoggedIn ? <AdminMain/> : <Unauthorized target={"админ-панелью"}/>}
        </>
    )
}

export default Admin;