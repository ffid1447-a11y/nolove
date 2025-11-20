const canvas = document.getElementById("bgCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 60;

let particles, particlePositions = [];
const particleCount = 12000;

function createSpherePoints() {
    const positions = [];
    const radius = 20;

    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions.push(new THREE.Vector3(x, y, z));
    }
    return positions;
}

particlePositions = createSpherePoints();

const geometry = new THREE.BufferGeometry();
const positionsArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    positionsArray[i * 3 + 0] = particlePositions[i].x;
    positionsArray[i * 3 + 1] = particlePositions[i].y;
    positionsArray[i * 3 + 2] = particlePositions[i].z;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positionsArray, 3));

const material = new THREE.PointsMaterial({
    color: 0x7a6fff,
    size: 0.12,
});

particles = new THREE.Points(geometry, material);
scene.add(particles);

// TEXT → PARTICLE TARGETS
function textToParticles(str) {
    const canvasText = document.createElement("canvas");
    const ctx = canvasText.getContext("2d");

    canvasText.width = 600;
    canvasText.height = 250;

    ctx.fillStyle = "white";
    ctx.font = "180px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(str, 300, 120);

    const imgData = ctx.getImageData(0, 0, 600, 250).data;
    const points = [];

    for (let y = 0; y < 250; y += 3) {
        for (let x = 0; x < 600; x += 3) {
            const index = (y * 600 + x) * 4;
            if (imgData[index + 3] > 200) {
                const vx = (x - 300) / 10;
                const vy = (120 - y) / 10;
                const vz = 0;
                points.push(new THREE.Vector3(vx, vy, vz));
            }
        }
    }

    return points;
}

document.getElementById("typeBtn").addEventListener("click", () => {
    const text = document.getElementById("morphText").value.trim();
    if (!text) return;

    const targetPoints = textToParticles(text);

    const posAttr = particles.geometry.attributes.position;

    gsap.to({}, {
        duration: 1.8,
        onUpdate: () => {
            for (let i = 0; i < particleCount; i++) {
                const target = targetPoints[i % targetPoints.length];
                posAttr.array[i * 3 + 0] += (target.x - posAttr.array[i * 3 + 0]) * 0.06;
                posAttr.array[i * 3 + 1] += (target.y - posAttr.array[i * 3 + 1]) * 0.06;
                posAttr.array[i * 3 + 2] += (target.z - posAttr.array[i * 3 + 2]) * 0.06;
            }
            posAttr.needsUpdate = true;
        }
    });
});

function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0015;
    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});