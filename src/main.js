import * as THREE from 'three';
import gsap from "gsap";
import "../index.css";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const FILEPATH = 'rb6.glb';
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera( 45, sizes.width/sizes.height, 1, 1000 );
camera.rotation.y = 45/180*Math.PI;
camera.position.x = 20;
camera.position.y = 20;
camera.position.z = 30;


const canvas = document.querySelector(".webcanvas");
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);

const lightxz = new THREE.PointLight(0xffffff, 0.8);
lightxz.position.copy(camera.position);
scene.add(lightxz);

const lightxy = new THREE.PointLight(0xffffff, 0.4);
lightxz.position.copy(camera.position);
scene.add(lightxz);

const ambient_light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambient_light );

// import RB6
const assetLoader = new GLTFLoader();
let mixer, model;
assetLoader.load(FILEPATH, function ( gltf ) {
    model = gltf.scene.children[0];
    mixer = new THREE.AnimationMixer( model );

    const animations = gltf.animations;
    animations.forEach( function (clip) {
        const action = mixer.clipAction(clip);
        action.play();
    });

    const skeleton = new THREE.SkeletonHelper( model );
    skeleton.visible = false;
    scene.add( skeleton );
    scene.add(model);
    model.position.y += 3.5;
    model.position.x += 5;
    model.position.z += 3;
    model.rotation.x = Math.PI/2-0.05 ;
    model.rotation.y = 0;
    model.rotation.z -= Math.PI/2;
} ,
    undefined,
    (error) => {
    console.error(error);
    }
);

const planeGemometry = new THREE.PlaneGeometry(400, 12);
const planeMaterial  = new THREE.MeshStandardMaterial({color: 0xC6C6C6, side: THREE.DoubleSide});
const plane = new THREE.Mesh(planeGemometry, planeMaterial);
plane.rotation.x = Math.PI/2-0.05;
plane.position.z += 3;
plane.position.y += 0.5;
plane.receiveShadow = true;
scene.add(plane);

// const axesHelper = new THREE.AxesHelper(500);
// scene.add(axesHelper);
// const gridHelper = new THREE.GridHelper(500);
// scene.add(gridHelper);

let control = new OrbitControls(camera, canvas);
control.enableDamping = true;
control.enablePan = false;
control.enableZoom = false;
control.autoRotate = false;
// control.autoRotate = false;
control.autoRotateSpeed = 1;

const clock = new THREE.Clock();
const loop = () => {
    lightxz.position.x = 5 + 50 * Math.sin(Date.now() / 480);
    lightxz.position.z = 3 + 50 * Math.cos(Date.now() / 480);

    lightxy.position.x = 5 + 60 * Math.sin(Date.now()+240 / 480);
    lightxy.position.y = 5 + 60 * Math.cos(Date.now()+240 / 480);

    if(mixer)
        mixer.update(clock.getDelta());
    control.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
}

loop();

// var textureFiles = ["rb6_textures/Body21_diff.png",
//                     "rb6_textures/Chassis1_diff.png", 
//                     "rb6_textures/Meshpart1_diff.png",
//                     "rb6_textures/Meshpart3_diff.png",
//                     "rb6_textures/Meshpart4_diff.png",];
// // Create an array to hold the loaded textures
// var textures = [];
// // Load the textures
// for (var i = 0; i < textureFiles.length; i++) {
//   textures[i] = new THREE.TextureLoader().load(textureFiles[i]);
// }
// // Create an array of materials using the loaded textures
// var materials = [];
// for (var i = 0; i < textures.length; i++) {
//   materials[i] = new THREE.MeshStandardMaterial({ map: textures[i] });
// }

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width/ sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
})

const t1 = gsap.timeline({defaults: {duration: 1}});
t1.fromTo(model.scale, {z:0, x:0, y:0}, {z:1, x:1, y:1});
t1.fromTo(plane.scale, {z:0, x:0, y:0}, {z:1, x:1, y:1});
