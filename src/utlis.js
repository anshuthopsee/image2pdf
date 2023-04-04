export function dragToMove(div, handle) {
    const isTouch = window.ontouchstart !== undefined;
    
    let handleOrDiv = handle;

    if (!handle) handleOrDiv = div;

    let mousedown = false;
    let offsetX;
    let offsetY;
    let startX;
    let startY;

    handleOrDiv.addEventListener(isTouch ? "touchstart" : "mousedown", (e) => {
        e.stopPropagation()
        mousedown = true;
        offsetX = e.touches ? e.touches[0].clientX - e.target.getBoundingClientRect().left: e.offsetX;
        offsetY = e.touches ? e.touches[0].clientY - e.target.getBoundingClientRect().top : e.offsetY;
    });

    document.addEventListener(isTouch ? "touchmove" : "mousemove", (e) => {
        if (mousedown) {
            e.preventDefault();
            e = e.touches ? e.touches[0] : e;
            startX = e.clientX-offsetX;
            startY = e.clientY-offsetY;
            
            div.style.left = startX+"px";
            div.style.top = startY+"px";
        };
    }, {passive: false});

    window.addEventListener(isTouch ? "touchend" : "mouseup", () => {
        mousedown = false;
        if (startX < 0) div.style.left = 0+"px";
        if (startX > window.screen.width-div.clientWidth) div.style.left = window.screen.width-div.clientWidth+"px";
        if (startY < 0) div.style.top = 0+"px";
        if (startY > window.innerHeight-div.clientHeight) div.style.top = window.innerHeight-div.clientHeight+"px";
    });
};