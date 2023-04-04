import { useEffect, useRef, useState, createElement } from "react";
import { jsPDF } from "jspdf";
import Canvas from "./Canvas.js";
import Popup from "./Popup.js";
import Info from "./Info.js";

const Home = ({ setFiles, files, popup, setPopup }) => {
    let chosenIndex = useRef(null);
    let imagePos = {x: 0, y: 0};
    let currentPos = {x: 0, y: 0};
    let image = null;
    let animate = false;
    let onLeftBtn = false;
    let onRightBtn = false;
    let scroll = false;

    const selectedFiles = useRef();
    const clonedElement = useRef();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [chosen, setChosen] = useState({element: null, offsetX: null, offsetY: null, left: null, top: null});

    const handleFile = (e) => {
        let filesArray = [...files];

        [...e.target.files].map((file) => {
            filesArray.push(file);
        });

        e.target.value = "";
        setFiles(filesArray);
    };

    const shortenFileName = (name) => {
        if (name.length > 15) {
          return name.substr(0, 8) + '...' + name.substr(-7);
        }
      
        return name;
    };

    const removeFile = (e, index) => {
        let filesArray = [...files];
        let fileName = shortenFileName(filesArray[index].name);
        filesArray.splice(index, 1);
        setFiles(filesArray);
        setPopup({show: true, message: `IMG: ${fileName} removed.`})
    };

    const clearQueue = () => {
        if (files.length > 0) {
            setFiles(() => []);
            setPopup({show: true, message: "Queue cleared."});
        };
    };

    const generatePDF = (e) => {
        if (files.length > 0) {
            const pdf = new jsPDF();
            let filesArray = [...files];

            filesArray.map((file, index) =>  {
                let format = file.type.substr(6).toUpperCase();
                pdf.addImage(URL.createObjectURL(file), format, 0, 0, 210, 297);

                if (index < filesArray.length-1) {
                    pdf.addPage();
                };
            });

            pdf.save("image2pdf");
            setPopup({show: true, message: "Download completed!"});
        } else {
            setPopup({show: true, message: "Please upload images!"});
        };
    };

    const onMouseDown = (e, index) => {
        if (e.target.tagName.toLowerCase() !== "button") {
            let chosenImage = e.target.getBoundingClientRect();
            let left = e.touches ? chosenImage.left : e.clientX - e.nativeEvent.offsetX;
            let top = e.touches ? chosenImage.top : e.clientY - e.nativeEvent.offsetY;

            let offsetX = e.touches ? e.touches[0].pageX - e.touches[0].target.offsetLeft : chosenImage.left + e.nativeEvent.offsetX;
            let offsetY = e.touches ? e.touches[0].pageY - e.touches[0].target.offsetTop : chosenImage.top + e.nativeEvent.offsetY;

            chosenIndex.current = index;

            setChosen(() => {
                return {element: e.target, offsetX: offsetX, offsetY: offsetY, left: left, top: top};
            });
        };
    };

    function nearlyEqual(a, b, targetDiff = 1) {
        return Math.abs(a - b) < targetDiff;
    };

    const updatePos = (e) => {
        // if (nearlyEqual(currentPos.x, imagePos.x) && nearlyEqual(currentPos.y, imagePos.y)) {
        //     console.log("not moving");
        //     animate = false;
        //     return
        // };

        if (!clonedElement.current) {
            animate = false;
            return;
        };

        clonedElement.current.style.transform = `translate(${imagePos.x}px, ${imagePos.y}px)`

        let element = document.getElementById(`${chosenIndex.current}`);

        if (Number.isInteger(parseInt(image.id)) && parseInt(image.id) !== parseInt(element.id)) {
            
            let pos1 = 10;
            image.style.transform = `translateX(${pos1+=145*(parseInt(element.id))}px)`;
            let pos2 = 10;
            element.style.transform = `translateX(${pos2+=145*parseInt(image.id)}px)`;
            let id = element.id;
            element.id = image.id;
            chosenIndex.current = image.id;
            image.id = id;
        };

        currentPos.x = imagePos.x;
        currentPos.y = imagePos.y;

        setTimeout(() => {
            requestAnimationFrame(updatePos)
        }, 0);
    };

    const onMouseMove = (e) => {
        if (clonedElement.current) {
            e.preventDefault();
            let target = e.target;

            if (e.touches) {
                target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
            }
            
            if (target.id === "left_btn") {
                onLeftBtn = true;
                onRightBtn = false;
                scrollLeft(e, false);
            } else if (target.id === "right_btn") {
                onLeftBtn = false;
                onRightBtn = true;
                scrollRight(e, false);
            } else {
                onLeftBtn = false;
                onRightBtn = false;
            };

            if (!scroll) {
                image = e.target.parentNode;

                if (e.touches) {
                    image = document.elementsFromPoint(e.touches[0].clientX, e.touches[0].clientY)[3].parentNode;
                    clonedElement.current.style.pointerEvents = "all";
                };
            };
            
            e = e.touches ? e.touches[0] : e;
            let startX = e.clientX-chosen.offsetX;
            let startY = e.clientY-chosen.offsetY;
            imagePos.x = startX;
            imagePos.y = startY;

            if (!animate) {
                updatePos();
                animate = true
            };
        };
    };

    const onMouseUp = (e) => {
        onLeftBtn = false;
        onRightBtn = false;

        if (chosen.element && e.target.tagName.toLowerCase() !== "input" && files.length > 0) {
            chosenIndex.current = null;
            let filesArray = [...files];
            let obj = {};

            if (files.length > 0) {
                [...selectedFiles.current.children].map((file, index) => {
                    obj[parseInt(file.id)] = filesArray[index];
                });

                filesArray = [];
                let orderedKeys = Object.keys(obj).sort((a, b) => a - b);

                orderedKeys.map((key) => {
                    filesArray.push(obj[parseInt(key)]);
                });
            
                setFiles(() => [...filesArray]);
            };
        };

        setChosen({element: null, offsetX: null, offsetY: null, left: null, top: null});
    };

    const scrollLeft = (e, onClick=true) => {
        let containerWidth = selectedFiles.current.clientWidth;
        console.log(containerWidth)

        if (Math.abs(selectedFiles.current.scrollLeft) !== 0 || scroll) {
            const scrollFunc = (distance, cummulative) => {
                if (cummulative > containerWidth+25) {
                    return;
                };
                
                selectedFiles.current.scrollLeft-=distance;
                requestAnimationFrame(() => scrollFunc(distance, cummulative+distance));
            };
    
            if (!onClick) {
                if (!scroll) {
                    const func = () => {
                        if (!onLeftBtn) {
                            scroll = false;
                            console.log("end")
                            return;
                        };
                        
                        scroll = true;
                        scrollFunc(10, 10);
        
                        setTimeout(() => {
                            func();
                        }, 1000);
                    };
        
                    func();
                };
            } else scrollFunc(10, 10);
        };
    };

    const scrollRight = (e, onClick=true) => {
        let containerWidth = selectedFiles.current.clientWidth;
        console.log(containerWidth)
    
        if (Math.abs(selectedFiles.current.scrollLeft) !== selectedFiles.current.scrollWidth - containerWidth) {
            const scrollFunc = (distance, cummulative) => {
                if (cummulative > containerWidth+25) {
                    console.log(cummulative)
                    return;
                };
                
                selectedFiles.current.scrollLeft+=distance;
                requestAnimationFrame(() => scrollFunc(distance, cummulative+distance));
            };
    
            if (!onClick) {
                if (!scroll) {
                    const func = () => {
                        if (!onRightBtn) {
                            scroll = false;
                            console.log("end")
                            return;
                        };
                        
                        scroll = true;
                        scrollFunc(10, 10);
        
                        setTimeout(() => {
                            func();
                        }, 1000);
                    };
        
                    func();
                };
            } else scrollFunc(10, 10);
        };
    };

    const renderClone = ({ element, left, top }) => {
        if (element) {
            return (
                <div className="pos-abs z6" ref={clonedElement} style={{left: `${left}px`, top: `${top}px`}}>
                    <div className="image_box z6">
                        <span className="file_name z6">{element.children[0].textContent}</span>
                    </div>
                </div>
            );
        };
    };

    const showFiles = (files) => {
        if (files.length > 0) {
            let offset = -135; 
            return [...files].map((file, index) => {
                offset+=145;
                return (
                    <div className="image_container" key={file.name+index} id={index}

                        onMouseDown={!isMobile ? (e) => onMouseDown(e, index) : () => {}}
                        onTouchStart={isMobile ? (e) => onMouseDown(e, index) : () => {}}
                        style={{transform: `translateX(${offset}px)`}}
            
                        >

                        <div className="image_box">
                            <span className="file_name">{shortenFileName(file.name)}</span>
                            <button className="remove" onClick={(e) => removeFile(e, index)}>X</button>
                        </div>
                        <Canvas height={140} width={120} file={file}></Canvas>
                    </div>
                );
            });
        } else {
            return <p className="no_files">No images uploaded</p>
        };
    };

    useEffect(() => {
        document.addEventListener((isMobile ? "touchend" : "mouseup"), onMouseUp);
        document.addEventListener((isMobile ? "touchmove" : "mousemove"), onMouseMove, {passive: false});

        return () => {
            document.removeEventListener((isMobile ? "touchend" : "mouseup"), onMouseUp);
            document.removeEventListener((isMobile ? "touchmove" : "mousemove"), onMouseMove, {passive: false});
        };
    }, [chosen])

    return (
        <>
            {popup.show ? <Popup show={popup.show} setPopup={setPopup}>{popup.message}</Popup> : ""}
            <div className="container">
                {renderClone(chosen)}
                <div className="box">
                    <div className="wrapper">
                        <span className="text">+</span>
                        <p className="prompt">Click or drag and drop files here to upload</p>
                        <input id="file-upload" type={"file"} multiple={"multiple"} accept={"image/png, image/jpeg"} onChange={handleFile}/>
                    </div>
                </div>
                <div className="selected_files_container">
                    <button id="left_btn" onClick={scrollLeft}> {"<"} </button>
                    <div className="selected_files" ref={selectedFiles}>{showFiles(files)}</div>
                    <button id="right_btn" onClick={scrollRight}>{">"}</button>
                </div>
                <div className="button_container">
                    <button className="action clear_queue" onClick={clearQueue}>Clear queue</button>
                    <button className="action download" onClick={generatePDF}>Download [PDF]</button>
                </div>
                <Info/>
            </div>
        </>
    );
};

export default Home;