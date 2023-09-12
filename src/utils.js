import { jsPDF } from "jspdf";

class utils {
    constructor() {
        this.maxHeight = 297;
        this.maxWidth = 215;
    };

    shortenFileName = (name) => {
        if (name.length > 15) {
          return name.substr(0, 8) + '...' + name.substr(-7);
        };

        return name;
    };

    nearlyEqual(a, b, targetDiff = 1) {
        return Math.abs(a - b) < targetDiff;
    };

    isElementXPercentInViewport = (el, parent,  percentVisible) => {
        let rect = el.getBoundingClientRect();
        let offsetLeft = el.offsetParent.offsetParent.offsetLeft;
        let windowWidth = parent.clientWidth+offsetLeft;

        return !(
            Math.floor(100 - (((rect.left-offsetLeft >= 0 ? 0 : rect.left-offsetLeft) / +-rect.width) * 100)) < percentVisible ||
            Math.floor(100 - ((rect.right - windowWidth) / rect.width) * 100) < percentVisible
        );
    };

    howManyImagesVisible = (parent) => {
        let nos = 0;
        if (parent.children.length > 0) {
            let images = [...parent.children];
            images.map((image) => {
                let bool = this.isElementXPercentInViewport(image, parent, 50);
                if (bool) {
                    nos+=1;
                };
            });

            return nos;
        };
    };
    
    fitImage = (height, width) => {
        let imgRatio = width/height;
        let pageRatio = this.maxWidth/this.maxHeight;
    
        if (imgRatio >= 1) {
            const wc = width / this.maxWidth;
            if (imgRatio >= pageRatio) {
                width = this.maxWidth;
                height = height/wc;
            }
            else {
                const pi = pageRatio / imgRatio;
                width = this.maxWidth/pi;
                height = (height/pi)/wc;
            };
        }
        else {
            const wc = width / this.maxHeight;
            if (1 / imgRatio > pageRatio) {
                let ip = (1 / imgRatio);
                if (ip <= 1.34) ip=ip/0.9;
                if (ip <= 1.24) ip=ip/0.85;
                if (ip <= 1.14) ip=ip/0.8;
                if (ip <= 1.04) ip=ip/0.75;
                width = this.maxHeight/ip;
                height = (height/ip)/wc;
            }
            else {
                width = this.maxHeight;
                height = height/wc;
            };
        };
    
        return [height, width];
    };
    
    generatePDF = (files) => {
        return new Promise(async (resolve) => {
            const pdf = new jsPDF();
            let filesArray = [...files];
    
            const imgOnLoad = (img, format) => {
                return new Promise((resolve) => {
                    img.onload = () => {
                        let [height, width] = this.fitImage(Math.floor(img.height), Math.floor(img.width));
                        pdf.addImage(img.src, format, (this.maxWidth/2)-(width/2)-3, (this.maxHeight/2)-(height/2), width, height);
                        resolve();
                    };
                });
            };
    
            let index = 0;
            for (let file of filesArray) {
                let img = document.createElement("img");
                img.src = URL.createObjectURL(file);
                let format = file.type.substr(6).toUpperCase();
                await imgOnLoad(img, format);
    
                if (index === files.length - 1) {
                    pdf.save("image2pdf");
                    resolve();
                } else {
                    pdf.addPage();
                };
                index +=1;
            };
        });
    };
};

export default utils;
