const onDragStart = (e) => {
    // e.stopPropagation();
    // e.preventDefault();
};

let count= 0
const onDragOver = (e) => {
    e.preventDefault();

    if (!e.target.draggable && count===0) {
        console.log(e.target)
        count++
    };
};

const onMouseDown = (e) => {
    // e.preventDefault();
    e.target.draggable = true
}

const onDragStop = (e) => {
    console.log("dropped")
};

const showFiles = (files) => {
    if (files.length > 0) {
        return [...files].map((file, index) => {
            return (
                <div className="image_container" key={file.name+index} draggable={true}
                    onDragStart={onDragStart} 
                    onDragOver={onDragOver} 
                    onDrop={onDragStop}
                    onTouchStart={onMouseDown}
                    onMouseDown={onMouseDown}
                    onDragLeave={(e) => e.target.draggable = false}
                 >
                    <div className="image_box">
                        <span className="file_name">{shortenFileName(file.name)}</span>
                        <button className="remove" onClick={() => removeFile(index)}>remove</button>
                    </div>
                    <img className="image" src={URL.createObjectURL(file)}></img>
                </div>
            );
        });

    } else {
        return <p className="no_files">No files uploaded</p>
    };
};

const rippleEffect = (e) => {
    const x = e.pageX - e.target.offsetLeft;
    const y = e.pageY - e.target.offsetTop;
    const w = e.target.offsetWidth;
    
    const ripple = document.createElement('span');
    
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top  = y + 'px';
    ripple.style.setProperty('--scale', w);

    e.target.appendChild(ripple);

    setTimeout(() => {
        ripple.parentNode.removeChild(ripple);
    }, 500);
};


const scrollRight = (e, onClick=true) => {
    let containerWidth = selectedFiles.current.clientWidth;

    if (Math.abs(selectedFiles.current.scrollLeft) !== selectedFiles.current.scrollWidth - containerWidth) {
        const scrollFunc = (distance, cummulative) => {
            if (cummulative > containerWidth) {
                return;
            };
            
            selectedFiles.current.scrollLeft+=distance;

            setTimeout(() => {
                scrollFunc(distance, cummulative+distance);
            }, 0);
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