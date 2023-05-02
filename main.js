import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// create a new scene
const scene = new THREE.Scene(); 

// add a camera and adjust its position
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

// create a renderer and set its size to fit the device window
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(window.innerWidth, window.innerHeight); 

// add a <canvas> tag to the HTML
document.body.appendChild(renderer.domElement); 

//add lighting
var ambient = new THREE.AmbientLight(0xffffff, 0.5);  // ambient light source
scene.add(ambient);
var point = new THREE.PointLight(0xffffff, 0.8);      // point light source
scene.add(point);

// load the frog model
var frog;

const newShader = new THREE.ShaderMaterial({
	uniforms:{
	  texture:{ 
		//value: new THREE.TextureLoader().load('assets/skin.jpg')
		value: new THREE.Color(0x00ff00)
	}
	},
	vertexShader: `
		//varying vec2 vertexUV;
	  void main() {
		//vertexUV=uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	  }
	`,
	fragmentShader: `
	  //uniform sampler2D texture;
	  //varying vec2 vertexUV;
	  uniform vec3 texture;
  
	  void main() {
		//gl_FragColor = texture2D(texture,vertexUV);
		gl_FragColor=vec4(texture,1.0);
	  }
	`,
  });
  

const loader = new GLTFLoader();
loader.load(
	'assets/frog.glb',
	function(gltf){	
		frog = gltf.scene;
		gltf.scene.traverse(function(node){
			if(node.isMesh){
				node.material=newShader;
			}
		});
		scene.add(gltf.scene);
		console.log(scene.children);
	},
	undefined,
	function(error){
		console.error(error);
	}
);



const xSpeed = 10;
const ySpeed = 10;
const xAngle = 0.1;
const yAngle = 0.1;
const smoothness= 0.01;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.key;
	const targetPosition = frog.position.clone();
	const targetRotation = frog.rotation.clone();

    if(!event.shiftKey && keyCode == "ArrowUp") targetPosition.y += ySpeed; 
	else if(!event.shiftKey && keyCode == "ArrowDown") targetPosition.y -= ySpeed;
    else if(!event.shiftKey && keyCode == "ArrowLeft") targetPosition.x -= xSpeed;
    else if(!event.shiftKey && keyCode == "ArrowRight") targetPosition.x += xSpeed;
	else if(event.shiftKey && keyCode == "ArrowUp") frog.rotation.x -= yAngle; 
	else if(event.shiftKey && keyCode == "ArrowDown") frog.rotation.x += yAngle;
    else if(event.shiftKey && keyCode == "ArrowLeft") frog.rotation.z -= xAngle;
    else if(event.shiftKey && keyCode == "ArrowRight") frog.rotation.z += xAngle;

	if(!event.shiftKey) frog.position.lerp(targetPosition, smoothness);
};
 
function animate(){
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();