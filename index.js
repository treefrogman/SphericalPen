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
function svgPolyLine(paths) {
    return paths.map(path => "M" + path.map(point => point.join(",")).join("L")).join(" ");
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

// touches.length = 0: static, 1: pan, 2: zoom
let touches = {};
let panAnchor = [0, 0];
let zoomAnchors = [[0, 0], [0, 0]];
let navState = 0;

const navStateHandlers = [
    {},{
        start: () => {
            log("1start");
            panAnchor = Object.values(touches)[0];
        },
        move: () => {
            log("1move");
            const [anchorX, anchorY] = panAnchor;
            const [updateX, updateY] = Object.values(touches)[0];
            offsetX += updateX - anchorX;
            offsetY += updateY - anchorY;
            resizeViewBox();
            panAnchor = [updateX, updateY];
        },
        stop: () => {},
    },{
        start: () => {
            log("2start");
            zoomAnchors = Object.values(touches);
        },
        move: () => {},
        stop: () => {},
    }
];

function startLine(x, y) {
    const position = [x - offsetX, y - offsetY];
    currentPath = [];
    currentPath.push(position);
    paths.push(currentPath);
}

function drawLine(x, y) {
    const position = [x - offsetX, y - offsetY];
    currentPath.push(position);
    lines.setAttribute("d", svgPolyLine(paths));
}

window.addEventListener("pointerdown", e => {
    switch (e.pointerType) {
        case "touch":
            log(`dn: ${e.pointerId}`);
            touches[e.pointerId] = [e.clientX, e.clientY];
            navStateHandlers[Object.entries(touches).length].start();
            break;
        case "pen":
            touches = {};
            startLine(e.pageX, e.pageY);
            break;
    }
});

window.addEventListener("pointermove", e => {
    switch (e.pointerType) {
        case "touch":
            touches[e.pointerId] = [e.clientX, e.clientY];
            navStateHandlers[Object.entries(touches).length].move();
            break;
        case "pen":
            touches = {};
            drawLine(e.pageX, e.pageY);
            break;
    }
});

window.addEventListener("pointerup", e => {
    if (e.pointerType == "touch") {
        log(`up: ${e.pointerId}`);
        delete touches[e.pointerId];
        navStateHandlers[Object.entries(touches).length].start();
    }
    
    currentPath = [];
});

// Stylus button hack
history.pushState(null, null, 'forward-entry');
history.back();
window.addEventListener("popstate", e => {
    if (e.state === null && location.href.endsWith('forward-entry')) {
        e.preventDefault();
        log("switch");
        history.back();
    }
});

// Logging
const logBox = document.getElementById("log");
function log(text) {
    const entry = document.createElement("pre");
    entry.textContent = text;
    logBox.prepend(entry);
}
