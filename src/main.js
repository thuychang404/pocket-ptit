import "./style.css";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Thiết lập cơ bản
const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
const loader = new GLTFLoader();

let currentModel = null; // Biến lưu trữ model hiện tại

loader.load(
    // model URL
    "/logo-ptit-2.glb",
    // onLoad callback: what get's called once the full model has loaded
    function (gltf) {
        // gltf.scene contains the Three.js object group that represents the 3d object of the model
        currentModel = gltf.scene;
        scene.add(gltf.scene);
        console.log("Model added to scene");

        gltf.scene.scale.multiplyScalar(0.04); // áp dụng cho a1

        gltf.scene.position.z = -0.6;
        gltf.scene.position.y = -0.4;

        // gltf.scene.rotation.x = 45;
    },
    // onProgress callback: optional function for showing progress on model load
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // onError callback
    function (error) {
        console.error(error);
    }
);

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
light.position.set(0.5, 1, 0.25);
scene.add(light);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.01,
    100
);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.xr.enabled = true;

const arButton = ARButton.createButton(renderer);
document.body.appendChild(arButton);

const clock = new THREE.Clock();

// Hàm switchModel để thay đổi model
window.switchModel = (element, url, options) => {
    // Xóa model hiện tại khỏi scene (nếu có)
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }

    // Tải model mới
    loader.load(
        url,
        (gltf) => {
            currentModel = gltf.scene;

            // Áp dụng scale và position từ options
            if (options.scale) currentModel.scale.setScalar(options.scale);
            if (options.position) {
                currentModel.position.set(
                    options.position.x || 0,
                    options.position.y || 0,
                    options.position.z || 0
                );
            }
            if (options.rotation) {
                currentModel.rotation.set(
                    options.rotation.x || 0,
                    options.rotation.y || 0,
                    options.rotation.z || 0
                );
            }

            scene.add(currentModel);
            console.log(`Model ${url} loaded successfully`);
        },
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
            console.error(`Error loading model ${url}:`, error);
        }
    );

    const slides = document.querySelectorAll(".slide");
    slides.forEach((element) => {
        element.classList.remove("selected");
    });
    element.classList.add("selected");
};

// Hàm animate
function animate() {
    renderer.setAnimationLoop(update);
}

function update() {
    controls.update();
    renderer.render(scene, camera);
}

// Khởi chạy animation
animate();
