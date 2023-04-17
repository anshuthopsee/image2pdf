import { useEffect } from "react";

const Popup = (props) => {

    useEffect(() => {
        let timer = setTimeout(() => {
            props.setPopup(() => { return {show: false, message: "", timeout: 0}});
        }, props.timeout*1000);

        return () => {
            clearTimeout(timer);
        };

    }, [props.show, props.children]);

    return (
        <div className="popup_container">
            <div className="popup" style={{borderBottom: "5px solid #24d654"}}>{props.children}</div>
        </div>
    );
};

export default Popup;
