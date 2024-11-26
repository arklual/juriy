import { useContext } from "react";
import { ErrorContext } from "../context/ErrorContext";


const ErrorProvider = (OriginalComponent) => {
    const NewComponent = () => {
        const [ErrorDataGetter, ErrorDataSetter] = useContext(ErrorContext)
        return (
            <ErrorContext.Provider value={[ErrorDataGetter, ErrorDataSetter]}>
                <OriginalComponent/>
            </ErrorContext.Provider>
        )
    }
    return NewComponent;
}
export default ErrorProvider;