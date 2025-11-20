let container = document.getElementById("container");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 160;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const particles = 15000;
const geometry = new THREE.BufferGeometry();
let positions = new Float32Array(particles * 3);

for (let i = 0; i < particles * 3; i += 3) {
    let x = (Math.random() - 0.5) * 300;
    let y = (Math.random() - 0.5) * 300;
    let z = (Math.random() - 0.5) * 300;
    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    size: 1.5,
    color: "#8d86ff",
});

const points = new THREE.Points(geometry, material);
scene.add(points);

let targetPositions = positions.slice();

function textToPoints(text) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 300;

    ctx.fillStyle = "white";
    ctx.font = "200px Inter";
    ctx.fillText(text, 50, 200);

    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let pts = [];
    for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
            let index = (y * canvas.width + x) * 4;
            if (imgData[index + 3] > 128) pts.push({ x, y });
        }
    }

    return pts;
}

function morph(text) {
    let pts = textToPoints(text);
    let newPos = positions.slice();

    for (let i = 0; i < particles; i++) {
        let p = pts[i % pts.length];
        newPos[i * 3] = p.x - 150;
        newPos[i * 3 + 1] = 150 - p.y;
    }

    targetPositions = newPos;
}

function animate() {
    requestAnimationFrame(animate);

    let pos = geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i++) {
        pos[i] += (targetPositions[i] - pos[i]) * 0.04;
    }

    geometry.attributes.position.needsUpdate = true;

    points.rotation.y += 0.002;
    renderer.render(scene, camera);
}

animate();

document.getElementById("typeBtn").addEventListener("click", () => {
    let txt = document.getElementById("morphText").value.trim();
    if (txt.length === 0) return;
    morph(txt);
});