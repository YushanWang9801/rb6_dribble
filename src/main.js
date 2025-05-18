import * as THREE from 'three';
import gsap from 'gsap';
import '../index.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const FILEPATH = 'rb6.glb';

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 1000);
function setCameraPosition() {
    if (window.innerWidth <= 768) {
        camera.position.set(10, 10, 15);
    } else {
        camera.position.set(20, 20, 30);
    }
    camera.lookAt(0, 0, 0);
}
setCameraPosition();

const canvas = document.querySelector('.webcanvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio || 2);

// 灯光
const lightxz = new THREE.PointLight(0xffffff, 0.8);
scene.add(lightxz);

const lightxy = new THREE.PointLight(0xffffff, 0.4);
scene.add(lightxy);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// 加载模型
const assetLoader = new GLTFLoader();
let mixer, model;

assetLoader.load(
    FILEPATH,
    (gltf) => {
        model = gltf.scene.children[0];
        mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });

        // ✅ 恢复你原本设置的坐标和旋转
        model.position.y += 3.5;
        model.position.x += 5;
        model.position.z += 3;
        model.rotation.x = Math.PI / 2 - 0.05;
        model.rotation.y = 0;
        model.rotation.z -= Math.PI / 2;

        const scaleFactor = window.innerWidth <= 768 ? 0.7 : 1.0;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        scene.add(model);

        // 动画
        gsap.fromTo(model.scale, { x: 0, y: 0, z: 0 }, {
            x: scaleFactor,
            y: scaleFactor,
            z: scaleFactor,
            duration: 1,
            ease: 'power2.out',
        });
    },
    undefined,
    (error) => {
        console.error('Error loading model:', error);
    }
);

// ✅ 保留你原来的地板设置
const planeGeometry = new THREE.PlaneGeometry(400, 12);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xc6c6c6, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2 - 0.05;
plane.position.z += 3;
plane.position.y += 0.5;
plane.receiveShadow = true;
scene.add(plane);

// 地板缩放动画
gsap.fromTo(plane.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 1 });

// 控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = window.innerWidth <= 768 ? 0.5 : 1;

const clock = new THREE.Clock();
function loop() {
    const t = Date.now() / 480;

    lightxz.position.set(5 + 50 * Math.sin(t), camera.position.y, 3 + 50 * Math.cos(t));
    lightxy.position.set(5 + 60 * Math.sin(t + 240), 5 + 60 * Math.cos(t + 240), 3);

    if (mixer) mixer.update(clock.getDelta());
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}
loop();

// 自适应窗口大小
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    setCameraPosition();
});
