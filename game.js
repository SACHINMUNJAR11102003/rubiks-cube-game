let scene, camera, renderer, cubeGroup;
let currentState = null;

// Convert color code (w,y,r,o,b,g) → HEX
function colorToHex(c) {
    if (c.includes("w")) return 0xffffff;
    if (c.includes("y")) return 0xffff00;
    if (c.includes("r")) return 0xff0000;
    if (c.includes("o")) return 0xffa500;
    if (c.includes("b")) return 0x0000ff;
    if (c.includes("g")) return 0x00ff00;
    return 0x000000;
}

// Load game from Flask
async function loadNewGame() {
    const r = await fetch("/new_game");
    const data = await r.json();

    document.getElementById("level").innerText = "Level: " + data.level;
    document.getElementById("scramble").innerText = "Scramble: " + data.scramble;
    document.getElementById("required").innerText = "Required moves: " + data.required_moves;

    currentState = data.state;
    buildCube();

    // Hide loading screen and show game
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("playBtn").style.display = "block";
    }, 600);
}

// Build cube visually from Flask state
function buildCube() {
    if (cubeGroup) scene.remove(cubeGroup);

    cubeGroup = new THREE.Group();
    const stickerSize = 0.98;

    let faceOrder = ["U", "R", "F", "D", "L", "B"];
    let faceRotation = {
        "U": [0, Math.PI, 0],
        "D": [0, 0, Math.PI],
        "F": [0, 0, 0],
        "B": [0, Math.PI, 0],
        "R": [0, -Math.PI/2, 0],
        "L": [0, Math.PI/2, 0]
    };

    let facePosition = {
        "U": [0, 1.5, 0],
        "D": [0, -1.5, 0],
        "F": [0, 0, 1.5],
        "B": [0, 0, -1.5],
        "R": [1.5, 0, 0],
        "L": [-1.5, 0, 0]
    };

    for (let face of faceOrder) {
        let stickers = currentState[face];

        for (let i = 0; i < 9; i++) {
            let y = 1 - Math.floor(i / 3);
            let x = (i % 3) - 1;

            let geometry = new THREE.PlaneGeometry(stickerSize, stickerSize);
            let material = new THREE.MeshBasicMaterial({
                color: colorToHex(stickers[i]),
                side: THREE.DoubleSide
            });

            let square = new THREE.Mesh(geometry, material);

            square.position.set(x, y, 0);

            let wrapper = new THREE.Group();
            wrapper.add(square);

            wrapper.position.set(
                facePosition[face][0],
                facePosition[face][1],
                facePosition[face][2]
            );

            wrapper.rotation.set(
                faceRotation[face][0],
                faceRotation[face][1],
                faceRotation[face][2]
            );

            cubeGroup.add(wrapper);
        }
    }

    scene.add(cubeGroup);
}

// Reuse existing rotation logic
function rotateCubeFace(face, direction) {
    // Call the existing rotation function you already use for mouse drag
    // For example, if your mouse logic uses rotateFace(face, CW/CCW)
    rotateFace(face, direction);

    // If you need to redraw/update the cube:
    drawCube();  // or whatever function updates the UI
}


// 3D initialization
function init3D() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Drag to rotate cube
    let isDragging = false;
    let prevX, prevY;

    renderer.domElement.addEventListener("mousedown", e => {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
    });

    renderer.domElement.addEventListener("mousemove", e => {
        if (!isDragging) return;
        let dx = e.clientX - prevX;
        let dy = e.clientY - prevY;

        cubeGroup.rotation.y += dx * 0.01;
        cubeGroup.rotation.x += dy * 0.01;

        prevX = e.clientX;
        prevY = e.clientY;
    });

    window.addEventListener("mouseup", () => isDragging = false);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}

// Play button event
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("playBtn").onclick = () => {
        document.getElementById("playBtn").style.display = "none";
    };

    init3D();
    loadNewGame();
});
