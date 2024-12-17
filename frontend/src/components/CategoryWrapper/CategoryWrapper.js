import { FilterContext } from "../../context/FilterContext";
import { FilterConfContext } from "../../context/FilterConfContext";

import { useState } from "react";

import Category from "./Category/Category";

const CategoryWrapper = (props) => {
    const [FilterGetter, FilterSetter] = useState({
        sort: "recent"
    })
    const [filterConf, setFilterConf] = useState({
        canChangeCat: false,
        extFiltration: false,
    })

    return (
        <FilterConfContext.Provider value={[filterConf, setFilterConf]}>
            <FilterContext.Provider value={[FilterGetter, FilterSetter]}>
                <Category
                    cat_name={props.cat_name}
                    isFavoriteState={props.isFavoriteState}
                    canSubscribe={props.canSubscribe}
                    createButton={props.createButton}
                    canFilter={props.canFilter}
                    type={props.type}
                />
            </FilterContext.Provider>
        </FilterConfContext.Provider>
    )
}

CategoryWrapper.defaultProps = {
    cat_name: "Новинки",
    isFavoriteState: false,
    canSubscribe: true,
    createButton: true,
    canFilter: true,
    type: "New"
}

export default CategoryWrapper;