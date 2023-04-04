import { useEffect } from "react";

const Popup = (props) => {

    useEffect(() => {
        let timeout = setTimeout(() => {
            props.setPopup(() => { return {show: false, message: ""}});
        }, 5000);

        return () => {
            clearTimeout(timeout);
        };
    }, [props.show, props.children]);

    return (
            <div className="popup_container">
                <div className="popup" style={{borderBottom: "5px solid #24d654"}}>{props.children}</div>
            </div>
    );
};

export default Popup;