const rootSvg = document.getElementById("rootSvg");
let offsetX = 0, offsetY = 0;
function resizeViewBox() {
    rootSvg.setAttribute("viewBox", [-offsetX, -offsetY, window.innerWidth, window.innerHeight].join(" "));
}
resizeViewBox();
window.addEventListener("resize", resizeViewBox);

const cursor = document.getElementById("cursor");
// function trackCursor(x, y) {
//     cursor.setAttribute("cx", x - offsetX);
//     cursor.setAttribute("cy", y - offsetY);
// }
// window.addEventListener("mousemove", e => trackCursor(e.clientX, e.clientY));

const paths = [];
let currentPath = [];

const lines = document.getElementById("lines");
function vis() {
    let pathString = paths.map(path => "M" + path.map(point => point.join(",")).join("L")).join(" ");
    // logBox.textContent = pathString;
    
    lines.setAttribute("d", pathString);
}

// window.addEventListener("zoom", e => {
//     e.preventDefault();
// })

// window.addEventListener("touchstart", e => {
//     if(e.touches.length > 1){
//         e.preventDefault();
//     }
// });

let panning = false;

function panStart(e) {
    panning = [e.clientX, e.clientY];
}

function pan(e) {
    // if(e.touches.length > 2){
    //     return;
    // }
    if (e.touches) e = e.touches[0];
    offsetX += e.clientX - panning[0];
    offsetY += e.clientY - panning[1];
    panning = [e.clientX, e.clientY];
    resizeViewBox();
}

window.addEventListener("pointerdown", e => {
    log(e.pointerType);
    // e.preventDefault();
    if (e.pointerType == "pen") {
        let position = [e.pageX - offsetX, e.pageY - offsetY];
        currentPath = [];
        currentPath.push(position);
        paths.push(currentPath);
    } else {
        panStart(e);
        return;
    }
});
function cursorMove(e) {
    // e.preventDefault();
    if (e.pointerType == "pen") {
        if (e.touches) e = e.touches[0];
        let position = [e.pageX - offsetX, e.pageY - offsetY];
        // logBox.textContent = e.touches[0].pageX;
        currentPath.push(position);
        // trackCursor(...position);
        vis();
    } else {
        // log("hi");
        pan(e);
        return;
    }
}
// window.addEventListener("touchmove", cursorMove);
// window.addEventListener("mousemove", cursorMove);
window.addEventListener("pointermove", cursorMove);
// window.addEventListener("touchmove", e => cursorMove(e.touches[0]));

window.addEventListener("pointerup", e => {
    currentPath = [];
    // panning = false;
});

history.pushState(null, null, 'forward-entry');
history.back();
window.addEventListener("popstate", e => {
    if (e.state === null && location.href.endsWith('forward-entry')) {
        e.preventDefault();
        log("switch");
        history.back();
    }
});

const logBox = document.getElementById("log");
function log(text) {
    logBox.appendChild(document.createTextNode(text + "\n"));
}
