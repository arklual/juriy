import CategoryWrapper from '../CategoryWrapper/CategoryWrapper';

import Unauthorized from '../Unauthorized/Unauthorized';

const Favorite = () => {
    const isLoggedIn = localStorage.getItem("jwt") != undefined;

    return (
        <>
            {isLoggedIn ? <CategoryWrapper type="Favorite" cat_name="Избранное" isFavoriteState={true} canSubscribe={false}/> : <Unauthorized target={"избранным"}/>}
        </>
    )
}

export default Favorite;