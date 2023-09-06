const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const toolButtons = document.querySelectorAll(".tool");
const fillColor = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorButtons = document.querySelectorAll(".drawtool-colors .drawtool-option");
const colorPicker = document.querySelector("#drawtool-color-picker");
const clearCanvas = document.querySelector(".drawtool-clear-canvas");
const saveImg = document.querySelector(".drawtool-save-img");

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});

let snapshot, prevMouseX, prevMouseY;
let isDrawing = false;
let selectedTool = 'brush';
let brushWidth = 5;
let selectedColor = "#000";

//  glossary
//
//  set offsetWidth/offsetHeight to canvas width/height -> returns viewable w/h of an element
//  canvas.context.beginPath() -> create a new start path to draw, if not, the line start from previous click position
//  canvas.context.lineTo(offX, offY) -> create a new line according to the mouse pointer
//  canvas.context.stroke() -> fill line with color
//  canvas.context.lineWidth -> brushSize as line width

const drawtool_helper = (
{
    drawConfigs : (
        {
            stopDraw : function () { isDrawing = false; },
            startDraw : function (e) 
            {
                isDrawing = true;
                prevMouseX = e.offsetX;
                prevMouseY = e.offsetY;

                ctx.beginPath();
                ctx.lineWidth = brushWidth;
                ctx.strokeStyle = selectedColor;
                ctx.fillStyle = selectedColor;

                snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            },
            'line' : (
                {   
                    doDraw : function (e) 
                    {
                        ctx.putImageData(snapshot, 0, 0);

                        ctx.beginPath();

                        ctx.moveTo(prevMouseX, prevMouseY);
                        ctx.lineTo(e.offsetX, e.offsetY);
                        ctx.stroke();
                    },
                }
            ),
            'brush' : (
                {
                    doDraw : function (e) 
                    {
                        ctx.lineTo(e.offsetX, e.offsetY); 
                        ctx.stroke();
                    },
                }
            ),
            'rectangle' : (
                {
                    doDraw : function (e) 
                    {
                        ctx.putImageData(snapshot, 0, 0);
                        
                        if (fillColor.checked) ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
                        else ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
                    },
                }
            ),
            'circle' : (
                {
                    doDraw : function (e)
                    {
                        ctx.putImageData(snapshot, 0, 0);
                        
                        ctx.beginPath();

                        let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
                        ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
                        
                        if (fillColor.checked) ctx.fill();
                        else ctx.stroke();
                    }  
                }
            ),
            'triangle' : (
                {
                    doDraw : function (e)
                    {
                        ctx.putImageData(snapshot, 0, 0);

                        ctx.beginPath();

                        ctx.moveTo(prevMouseX, prevMouseY);
                        ctx.lineTo(e.offsetX, e.offsetY);
                        ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
                        ctx.closePath();
                        
                        if (fillColor.checked) ctx.fill();
                        else ctx.stroke();
                    }
                }
            ),
            'eraser' : (
                {
                    doDraw : function (e)
                    {
                        ctx.strokeStyle = "#fff";

                        ctx.lineTo(e.offsetX, e.offsetY); 
                        ctx.stroke();
                    }
                }
            )
        }
    )
}
);

//
// handlers
//
toolButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".drawtool-options .drawtool-active")?.classList.remove("drawtool-active");

        btn.classList.add("drawtool-active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => { brushWidth = sizeSlider.value; });

colorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".drawtool-options .selected").classList.remove("selected");
        
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.backgroundColor = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    if (confirm("Limpar o quadro?")) ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = prompt("Nome para a picture:") + '.png';

    if (link.download.startsWith('null')) return;

    link.href = canvas.toDataURL();

    link.click();
});

canvas.addEventListener("mouseout", drawtool_helper.drawConfigs.stopDraw);
canvas.addEventListener("mouseup", drawtool_helper.drawConfigs.stopDraw);
canvas.addEventListener("mousedown", drawtool_helper.drawConfigs.startDraw);
canvas.addEventListener("mousemove", (e) => {if(isDrawing === true) {drawtool_helper.drawConfigs[selectedTool].doDraw(e)}}); 

