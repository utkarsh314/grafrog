import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene(); // create a new scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); // add camera

const renderer = new THREE.WebGLRenderer(); // create a renderer 
renderer.setSize(window.innerWidth, window.innerHeight); // and set its size to fit your window

document.body.appendChild(renderer.domElement); // add a <canvas> tag to the HTML
camera.position.z = 5; // adjust camera position

const loader = new GLTFLoader();

loader.load('assets/frog.glb',
	function(gltf){	
		gltf.scene.scale.set(.001*gltf.scene.scale.x, .001*gltf.scene.scale.y, .001 * gltf.scene.scale.z);
		scene.add(gltf.scene);
	},
	undefined,
	function(error){
		console.error(error);
	});

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();