const rootSvg = document.getElementById("rootSvg");
let offsetX = 0, offsetY = 0;
function resizeViewBox() {
    rootSvg.setAttribute("viewBox", [-offsetX, -offsetY, window.innerWidth, window.innerHeight].join(" "));
}
resizeViewBox();
window.addEventListener("resize", resizeViewBox);

const cursor = document.getElementById("cursor");

const paths = [];
let currentPath = [];

const lines = document.getElementById("lines");
function vis() {
    let pathString = paths.map(path => "M" + path.map(point => point.join(",")).join("L")).join(" ");
    lines.setAttribute("d", pathString);
}

let panning = false;

function panStart(e) {
    panning = [e.clientX, e.clientY];
}

function pan(e) {
    if (e.touches) e = e.touches[0];
    offsetX += e.clientX - panning[0];
    offsetY += e.clientY - panning[1];
    panning = [e.clientX, e.clientY];
    resizeViewBox();
}

window.addEventListener("pointerdown", e => {
    log(e.pointerType);
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
    if (e.pointerType == "pen") {
        if (e.touches) e = e.touches[0];
        let position = [e.pageX - offsetX, e.pageY - offsetY];
        currentPath.push(position);
        vis();
    } else {
        pan(e);
        return;
    }
}
window.addEventListener("pointermove", cursorMove);

window.addEventListener("pointerup", e => {
    currentPath = [];
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
