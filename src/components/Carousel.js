import { useState, useEffect, useContext, useRef } from "react";
import { GeneralContext } from "../GeneralContextProvider.js";
import utils from "../utils.js";
import Canvas from "./Canvas.js";

const Utils = new utils();

const Carousel = () => {
    const imagePos = {x: 0, y: 0};
    const mousePos = {x: 0, y: 0};

    let image = null;
    let animate = false;
    let onLeftBtn = false;
    let onRightBtn = false;
    let scrollingLeft = false;
    let scrollingRight = false;

    const chosenIndex = useRef(null);
    const firstImageVisible = useRef(0);
    const numberOfImagesVisible = useRef(0);
    const selectedFiles = useRef();
    const clonedElement = useRef();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const { files, setFiles, setPopup } = useContext(GeneralContext);
    const [chosen, setChosen] = useState({element: null, offsetX: null, offsetY: null, left: null, top: null});

    const onMouseDown = (e, index) => {
        if (e.target.tagName !== "BUTTON") {
            let chosenImage = e.target.getBoundingClientRect();
            let left = e.touches ? chosenImage.left : e.clientX - e.nativeEvent.offsetX;
            let top = e.touches ? chosenImage.top + window.scrollY : e.clientY - e.nativeEvent.offsetY + window.scrollY;

            let offsetX = e.touches ? e.touches[0].pageX - e.touches[0].target.offsetLeft : chosenImage.left + e.nativeEvent.offsetX;
            let offsetY = e.touches ? e.touches[0].pageY - e.touches[0].target.offsetTop : chosenImage.top + e.nativeEvent.offsetY;

            chosenIndex.current = index;

            setChosen(() => {
                return {element: e.target, offsetX: offsetX, offsetY: offsetY, left: left, top: top};
            });
        };
    };

    const moveClone = () => {
        if (!clonedElement.current) {
            animate = false;
            return;
        };

        if (isMobile) {
            let swapWith = document.elementsFromPoint(mousePos.x, mousePos.y)[3]?.parentNode;
            if (swapWith) image = swapWith;
        } else {
            let swapWith = document.elementsFromPoint(mousePos.x, mousePos.y)[1]?.parentNode;
            if (swapWith) image = swapWith;
        };

        clonedElement.current.style.transform = `translate(${imagePos.x}px, ${imagePos.y}px)`;
        let element = document.getElementById(chosenIndex.current);

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

        requestAnimationFrame(moveClone);
    };

    const onMouseMove = (e) => {
        if (clonedElement.current) {
            e.preventDefault();
            let target = e.target;

            if (e.touches) {
                target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                mousePos.x = e.touches[0].clientX;
                mousePos.y = e.touches[0].clientY;
                clonedElement.current.style.pointerEvents = "all";
            } else {
                mousePos.x = e.clientX;
                mousePos.y = e.clientY;
            };
            
            if (target?.id === "left_btn") {
                if (!onLeftBtn) {
                    onLeftBtn = true;
                    onRightBtn = false;
                    scrollingRight = false;
                    scrollingLeft = false;
                    scrollLeft(e, false);
                };
            } else if (target?.id === "right_btn") {
                if (!onRightBtn) {
                    onLeftBtn = false;
                    onRightBtn = true;
                    scrollingRight = false;
                    scrollingLeft = false;
                    scrollRight(e, false);
                }
            } else {
                onLeftBtn = false;
                onRightBtn = false;
                scrollingRight = false;
                scrollingLeft = false;
            };

            let offsetOnScroll = e.touches ? window.scrollY : 0;
            
            e = e.touches ? e.touches[0] : e;
            let startX = e.clientX-chosen.offsetX;
            let startY = e.clientY-chosen.offsetY;
            imagePos.x = startX;
            imagePos.y = startY+offsetOnScroll;

            if (!animate) {
                moveClone();
                animate = true;
            };
        };
    };

    const onMouseUp = (e) => {
        onLeftBtn = false;
        onRightBtn = false;
        scrollingLeft = false;
        scrollingRight = false;
        chosenIndex.current = null;

        if (chosen.element && e.target.tagName && files.length > 0) {
            if (e.target.tagName !== "INPUT") {
                let filesArray = [...files];
                let obj = {};

                if (files.length > 0) {
                    [...selectedFiles.current.children].forEach((file, index) => {
                        obj[parseInt(file.id)] = filesArray[index];
                    });

                    filesArray = [];
                    let orderedKeys = Object.keys(obj).sort((a, b) => a - b);

                    orderedKeys.forEach((key) => {
                        filesArray.push(obj[parseInt(key)]);
                    });
                
                    setFiles(() => [...filesArray]);
                };
            };
        };

        setChosen({element: null, offsetX: null, offsetY: null, left: null, top: null});
    };

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const scrollLeft = (e, onClick=true) => {
        if (Math.abs(selectedFiles.current.scrollLeft) !== 0) {
            const scrollFunc = () => {
                if (Math.abs(selectedFiles.current.scrollLeft) === 0) {
                    return;
                };

                let children = [...selectedFiles.current.children];
                let numberOfImages = Utils.howManyImagesVisible(selectedFiles.current);

                if (numberOfImagesVisible.current !==0 && firstImageVisible.current+numberOfImagesVisible.current-1 === children.length-1) {
                    if (numberOfImages > numberOfImagesVisible.current) {
                        firstImageVisible.current-=numberOfImages-numberOfImagesVisible.current;
                    };
                };

                numberOfImagesVisible.current = numberOfImages;

                if (firstImageVisible.current-numberOfImages < 0) {
                    if (firstImageVisible.current !==0) firstImageVisible.current = 0;
                    
                } else {
                    firstImageVisible.current-=numberOfImages;
                };

                let offset = 22;
                let el = children.filter((child) => parseInt(child.id) === firstImageVisible.current)[0];
                let rect = el.getBoundingClientRect();
                let left = rect.left - el.offsetParent.offsetParent.offsetLeft - offset;
                selectedFiles.current.scrollLeft+=left;
            };
    
            if (!onClick) {
                if (onLeftBtn) {
                    scrollingLeft = true;
                    const func = async () => {
                        if (!scrollingLeft || scrollingRight) {
                            console.log("left-stop")
                            scrollingLeft = false;
                            return;
                        };
                        
                        scrollingLeft = true;
                        console.log("left-running")
                        scrollFunc();
                        await sleep(1500);
                        func()
                    };
        
                    func();
                };
            } else scrollFunc();
        };
    };

    const scrollRight = (e, onClick=true) => {
        let containerWidth = selectedFiles.current.clientWidth;
        if (Math.abs(selectedFiles.current.scrollLeft) - (selectedFiles.current.scrollWidth - containerWidth) < -8) {
            const scrollFunc = () => {
                let numberOfImages = Utils.howManyImagesVisible(selectedFiles.current);
                numberOfImagesVisible.current = numberOfImages;
                let children = [...selectedFiles.current.children];

                if (Math.abs(selectedFiles.current.scrollLeft) - (selectedFiles.current.scrollWidth - containerWidth) >= -8) { 
                    return;
                };

                if (firstImageVisible.current+(2*numberOfImages) > children.length-1) {
                    firstImageVisible.current=children.length-numberOfImages;
                } else {
                    firstImageVisible.current+=numberOfImages;
                };

                let offset = 22;
                let el = children.filter((child) => parseInt(child.id) === firstImageVisible.current)[0];
                let rect = el.getBoundingClientRect();
                let left = rect.left - el.offsetParent.offsetParent.offsetLeft - offset;
                selectedFiles.current.scrollLeft+=left
            };
    
            if (!onClick) {
                if (onRightBtn) {
                    scrollingRight = true;
                    const func = async () => {
                        if (!scrollingRight || scrollingLeft) {
                            console.log("right-stop")
                            scrollingRight = false;
                            return;
                        };
                        
                        scrollingRight = true;
                        console.log("right-running")
                        scrollFunc();
                        await sleep(1500);
                        func();
                    };
        
                    func();
                };
            } else scrollFunc();
        };
    };

    const removeFile = (e, index) => {
        let filesArray = [...files];
        let fileName = Utils.shortenFileName(filesArray[index].name);
        if (firstImageVisible.current > 0) {
            if (index === filesArray.length-1) {
                firstImageVisible.current-=1;
            };
        };
        filesArray.splice(index, 1);
        setFiles(filesArray);
        setPopup({show: true, message: `IMG: ${fileName} removed.`, timeout: 5})
    };

    const renderImages = (files) => {
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
                            <span className="file_name">{Utils.shortenFileName(file.name)}</span>
                            <button className="remove" onClick={(e) => removeFile(e, index)}>X</button>
                        </div>
                        <Canvas height={140} width={120} file={file}></Canvas>
                    </div>
                );
            });
        } else {
            firstImageVisible.current = 0;
            numberOfImagesVisible.current = 0;
            return <p className="no_files">No images uploaded</p>
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
            {renderClone(chosen)}
            <div className="selected_files_container">
                <button id="left_btn" onClick={scrollLeft}> {"<"} </button>
                <div className="selected_files" ref={selectedFiles}>{renderImages(files)}</div>
                <button id="right_btn" onClick={scrollRight}>{">"}</button>
            </div>
        </>
    );
};

export default Carousel;
