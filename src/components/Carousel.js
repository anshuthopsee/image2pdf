import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { GeneralContext } from "../GeneralContextProvider.js";
import utils from "../utils.js";
import Canvas from "./Canvas.js";

const Utils = new utils();

const Carousel = () => {

    // Cloned image position on screen
    const imagePosRef = useRef({x: 0, y: 0});

    // Mouse/Touch position on screen
    const mousePosRef = useRef({x: 0, y: 0});

    // Reference to the image, cloned image is being dragged over
    const imageUnderMouseRef = useRef(null);

    // Is the cloned element being animated?
    const animateRef = useRef(false);

    // Is the mouse/touch on the left button?
    const onLeftBtnRef = useRef(false);

    // Is the mouse/touch on the right button?
    const onRightBtnRef = useRef(false);

    // Is the scrollLeft func in the midst of calling itself recursively?
    const scrollingLeftRef = useRef(false);

    // Is the scrollRight func in the midst of calling itself recursively?
    const scrollingRightRef = useRef(false);

    // Index of the image chosen
    const chosenImageIndexRef = useRef(null);

    // Index of the first image visible in the carousel at any time
    const indexOfFirstRef = useRef(0);

    // Number of images visible in the carousel at any time
    const numberOfImagesVisibleRef = useRef(0);

    // Reference to the element that holds all the images
    const selectedFilesRef = useRef();

    // Reference to the cloned image
    const clonedElementRef = useRef();

    // Is user on mobile?
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Retrieving state variables and functions from the GeneralContext provider
    const { files, setFiles, setPopup } = useContext(GeneralContext);

    // Stores information about the chosen image, it's 'left', 'top' properties and more
    const [chosen, setChosen] = useState({element: null, offsetX: null, offsetY: null, left: null, top: null});

    // Handle mousedown and touchstart events
    const onMouseDown = (e, index) => {
        if (e.target.tagName !== "BUTTON") {
            let chosenImage = e.target.getBoundingClientRect();
            let left = e.touches ? chosenImage.left : e.clientX - e.nativeEvent.offsetX;
            let top = e.touches ? chosenImage.top + window.scrollY : e.clientY - e.nativeEvent.offsetY + window.scrollY;

            let offsetX = e.touches ? e.touches[0].pageX - e.touches[0].target.offsetLeft : chosenImage.left + e.nativeEvent.offsetX;
            let offsetY = e.touches ? e.touches[0].pageY - e.touches[0].target.offsetTop : chosenImage.top + e.nativeEvent.offsetY;

            chosenImageIndexRef.current = index;

            setChosen(() => {
                return {element: e.target, offsetX: offsetX, offsetY: offsetY, left: left, top: top};
            });
        };
    };

    // Move the cloned image along with the mouse/touch
    const moveClone = () => {

        // If cloned image dosen't exist stop animation
        if (!clonedElementRef.current) {
            animateRef.current = false;
            return;
        };

        if (isMobile) {
            let swapWith = document.elementsFromPoint(mousePosRef.current.x, mousePosRef.current.y)[3]?.parentNode;
            if (swapWith) imageUnderMouseRef.current = swapWith;
        } else {
            let swapWith = document.elementsFromPoint(mousePosRef.current.x, mousePosRef.current.y)[1]?.parentNode;
            if (swapWith) imageUnderMouseRef.current = swapWith;
        };

        clonedElementRef.current.style.transform = `translate(${imagePosRef.current.x}px, ${imagePosRef.current.y}px)`;
        let element = document.getElementById(chosenImageIndexRef.current);

        // Swap the position and id's of the cloned image and the image it was dragged over
        if (Number.isInteger(parseInt(imageUnderMouseRef.current.id)) && parseInt(imageUnderMouseRef.current.id) !== parseInt(element.id)) {
            let pos1 = 10;
            imageUnderMouseRef.current.style.transform = `translateX(${pos1+=145*(parseInt(element.id))}px)`;
            let pos2 = 10;
            element.style.transform = `translateX(${pos2+=145*parseInt(imageUnderMouseRef.current.id)}px)`;
            let id = element.id;
            element.id = imageUnderMouseRef.current.id;
            chosenImageIndexRef.current = imageUnderMouseRef.current.id;
            imageUnderMouseRef.current.id = id;
        };

        requestAnimationFrame(moveClone);
    };

    // Handle mousemove and touchmove events
    const onMouseMove = useCallback((e) => {

        // Update image, mouse position variables only if cloned element exists
        const helper = () => {
            if (clonedElementRef.current) {
                e.preventDefault();
                let target = e.target;
    
                if (e.touches) {
                    target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                    mousePosRef.current.x = e.touches[0].clientX;
                    mousePosRef.current.y = e.touches[0].clientY;
                    clonedElementRef.current.style.pointerEvents = "all";
                } else {
                    mousePosRef.current.x = e.clientX;
                    mousePosRef.current.y = e.clientY;
                };
                
                if (target?.id === "left_btn") {
                    if (!onLeftBtnRef.current) {
                        onLeftBtnRef.current = true;
                        onRightBtnRef.current = false;
                        scrollingRightRef.current = false;
                        scrollingLeftRef.current = false;
                        scrollLeft(e, false);
                    };
                } else if (target?.id === "right_btn") {
                    if (!onRightBtnRef.current) {
                        onLeftBtnRef.current = false;
                        onRightBtnRef.current = true;
                        scrollingRightRef.current = false;
                        scrollingLeftRef.current = false;
                        scrollRight(e, false);
                    }
                } else {
                    onLeftBtnRef.current = false;
                    onRightBtnRef.current = false;
                    scrollingRightRef.current = false;
                    scrollingLeftRef.current = false;
                };
    
                let offsetOnScroll = e.touches ? window.scrollY : 0;
                
                e = e.touches ? e.touches[0] : e;
                let startX = e.clientX-chosen.offsetX;
                let startY = e.clientY-chosen.offsetY;
                imagePosRef.current.x = startX;
                imagePosRef.current.y = startY+offsetOnScroll;
    
                // If animation has been stopped, start it again
                if (!animateRef.current) {
                    moveClone();
                    animateRef.current = true;
                };
            };
        };
        helper();

    }, [chosen]);

    // Handle mouseup and touchend events
    const onMouseUp = useCallback((e) => {

        const helper = () => {
            onLeftBtnRef.current = false;
            onRightBtnRef.current = false;
            scrollingLeftRef.current = false;
            scrollingRightRef.current = false;
            chosenImageIndexRef.current = null;

            if (chosen.element && e.target.tagName && files.length > 0) {
                if (e.target.tagName !== "INPUT") {
                    let filesArray = [...files];
                    let obj = {};

                    if (files.length > 0) {
                        [...selectedFilesRef.current.children].forEach((file, index) => {
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
        helper();

    }, [chosen]);

    // Function to delay subsequent scroll for a certain amount of time
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Scroll carousel to the left
    const scrollLeft = (e, onClick=true) => {
        if (Math.abs(selectedFilesRef.current.scrollLeft) !== 0) {
            const scrollFunc = () => {
                if (Math.abs(selectedFilesRef.current.scrollLeft) === 0) {
                    return;
                };

                let children = [...selectedFilesRef.current.children];
                let numberOfImages = Utils.howManyImagesVisible(selectedFilesRef.current);

                if (numberOfImagesVisibleRef.current !==0 && indexOfFirstRef.current+numberOfImagesVisibleRef.current-1 === children.length-1) {
                    if (numberOfImages > numberOfImagesVisibleRef.current) {
                        indexOfFirstRef.current-=numberOfImages-numberOfImagesVisibleRef.current;
                    };
                };

                numberOfImagesVisibleRef.current = numberOfImages;

                if (indexOfFirstRef.current-numberOfImages < 0) {
                    if (indexOfFirstRef.current !==0) indexOfFirstRef.current = 0;
                    
                } else {
                    indexOfFirstRef.current-=numberOfImages;
                };

                let offset = 22;
                let el = children.filter((child) => parseInt(child.id) === indexOfFirstRef.current)[0];
                let rect = el.getBoundingClientRect();
                let left = rect.left - el.offsetParent.offsetParent.offsetLeft - offset;
                selectedFilesRef.current.scrollLeft+=left;
            };
    
            if (!onClick) {
                if (onLeftBtnRef.current) {
                    scrollingLeftRef.current = true;
                    const func = async () => {
                        if (!scrollingLeftRef.current || scrollingRightRef.current) {
                            console.log("left-stop")
                            scrollingLeftRef.current = false;
                            return;
                        };
                        
                        scrollingLeftRef.current = true;
                        console.log("left-running")
                        scrollFunc();

                        // Pause 1.5 seconds after each scroll while the mouse hovers over the button
                        await sleep(1500);
                        func()
                    };
        
                    func();
                };
            } else scrollFunc();
        };
    };

    // Scroll carousel to the right
    const scrollRight = (e, onClick=true) => {
        let containerWidth = selectedFilesRef.current.clientWidth;
        if (Math.abs(selectedFilesRef.current.scrollLeft) - (selectedFilesRef.current.scrollWidth - containerWidth) < -8) {
            const scrollFunc = () => {
                let numberOfImages = Utils.howManyImagesVisible(selectedFilesRef.current);
                numberOfImagesVisibleRef.current = numberOfImages;
                let children = [...selectedFilesRef.current.children];

                if (Math.abs(selectedFilesRef.current.scrollLeft) - (selectedFilesRef.current.scrollWidth - containerWidth) >= -8) { 
                    return;
                };

                if (indexOfFirstRef.current+(2*numberOfImages) > children.length-1) {
                    indexOfFirstRef.current=children.length-numberOfImages;
                } else {
                    indexOfFirstRef.current+=numberOfImages;
                };

                let offset = 22;
                let el = children.filter((child) => parseInt(child.id) === indexOfFirstRef.current)[0];
                let rect = el.getBoundingClientRect();
                let left = rect.left - el.offsetParent.offsetParent.offsetLeft - offset;
                selectedFilesRef.current.scrollLeft+=left
            };
    
            if (!onClick) {
                if (onRightBtnRef.current) {
                    scrollingRightRef.current = true;
                    const func = async () => {
                        if (!scrollingRightRef.current || scrollingLeftRef.current) {
                            console.log("right-stop")
                            scrollingRightRef.current = false;
                            return;
                        };
                        
                        scrollingRightRef.current = true;
                        console.log("right-running")
                        scrollFunc();

                        // Pause 1.5 seconds after each scroll while the mouse hovers over the button
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
        if (indexOfFirstRef.current > 0) {
            if (index === filesArray.length-1) {
                indexOfFirstRef.current-=1;
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
            indexOfFirstRef.current = 0;
            numberOfImagesVisibleRef.current = 0;
            return <p className="no_files">No images uploaded</p>
        };
    };

    const renderClone = ({ element, left, top }) => {

        // Renders clone, if an element has been chosen
        if (element) {
            return (
                <div className="pos-abs z6" ref={clonedElementRef} style={{left: `${left}px`, top: `${top}px`}}>
                    <div className="image_box z6">
                        <span className="file_name z6">{element.children[0].textContent}</span>
                    </div>
                </div>
            );
        };
    };

    useEffect(() => {

        // Mouse/Touch event listeners
        document.addEventListener((isMobile ? "touchend" : "mouseup"), onMouseUp);
        document.addEventListener((isMobile ? "touchmove" : "mousemove"), onMouseMove, {passive: false});

        return () => {
            document.removeEventListener((isMobile ? "touchend" : "mouseup"), onMouseUp);
            document.removeEventListener((isMobile ? "touchmove" : "mousemove"), onMouseMove, {passive: false});
        };

    }, [chosen, isMobile, onMouseUp, onMouseMove]);

    return (
        <>
            {renderClone(chosen)}
            <div className="selected_files_container">
                <button id="left_btn" onClick={scrollLeft}> {"<"} </button>
                <div className="selected_files" ref={selectedFilesRef}>{renderImages(files)}</div>
                <button id="right_btn" onClick={scrollRight}>{">"}</button>
            </div>
        </>
    );
};

export default Carousel;
