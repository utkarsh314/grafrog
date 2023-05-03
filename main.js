import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// create a new scene
const scene = new THREE.Scene(); 
scene.background = new THREE.Color(0xa8def0);

// add a camera and adjust its position
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 10);

// create a renderer and set its size to fit the device window
const renderer = new THREE.WebGLRenderer({
	antialias: true
}); 
renderer.setSize(window.innerWidth, window.innerHeight); 
// enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

// add an orbit controller
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// add a <canvas> tag to the HTML
document.body.appendChild(renderer.domElement); 

//add lighting
var ambient = new THREE.AmbientLight(0xffffff, 0.5);  // ambient light source
//ambient.castShadow=true;
scene.add(ambient);

var dLight=new THREE.DirectionalLight(0xffffff,1); // directional light source
dLight.position.set(0,300,0)
scene.add(dLight);
dLight.castShadow=true;

// load the frog model
var frog;

// //Load Texture
// const textureLoader=new THREE.TextureLoader();
// const frogTexture=textureLoader.load('assets/skin.jpg');
// const mat=new THREE.MeshPhongMaterial();
// mat.map=frogTexture;

// add the ground plane
const geometryP = new THREE.PlaneGeometry(50, 50);
const materialP = new THREE.MeshStandardMaterial({color:0xffffff})
const plane = new THREE.Mesh(geometryP, materialP);
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// shaders
const newShader = new THREE.ShaderMaterial({
	uniforms:{
	  	texture:{ 
		//value: new THREE.TextureLoader().load('assets/skin.jpg')
		value: new THREE.Color(0x00ff00)
		},
		lightPosition:{ value: dLight.position},
		/*ambientColor: { value: new THREE.Color() },
      	diffuseColor: { value: new THREE.Color() }*/
	
	},
	//lights:true,
	vertexShader: `
		varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
	void main() {
		vNormal=normal;
        vPosition=position;
        vUv=uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	  }
	`,
	fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vUv;
        uniform vec3 lightPosition;
        uniform vec3 texture;
      void main() {
        vec3 viewDirection=normalize(lightPosition-vPosition);
        float fresnel=dot(viewDirection, vNormal);
		gl_FragColor=vec4(0.f,fresnel,0.f, 1.0);
		//gl_FragColor=vec4(texture,1.0);
	  }
	`,
  });

//rightLegValues
var rTibia; var rFoot;

//leftLegValues
var lTibia; var lFoot;

//ArmValues
var Humerus;

//Skull
var skull;

// loading the frog model
const loader = new GLTFLoader();
loader.load(
	'assets/frog.glb',
	function(gltf){	
		frog = gltf.scene;
		frog.traverse(function(node){
			if(node.isMesh){
				node.material=newShader;
				node.castShadow=true;
			}
		});
        frog.position.y+=2;
		frog.rotation.y+=Math.PI/2;
		frog.getObjectByName('skull').rotation.z+=0.2;
        frog.castShadow=true;
        frog.receiveShadow=true;

		// store the original positions of the frog's limbs
		rTibia=frog.getObjectByName('righttibia').rotation.z; 
		rFoot=frog.getObjectByName('rightfoot').rotation.z;
		lTibia=frog.getObjectByName('lefttibia').rotation.z;
		lFoot=frog.getObjectByName('leftfoot').rotation.z;
		Humerus=frog.getObjectByName('righthumerus').rotation.z; 
		skull=frog.getObjectByName('skull').rotation.x;

		scene.add(frog);
		console.log(scene.children);
	},
	undefined,
	function(error){
		console.error(error);
	}
);

// set up some constants for movement
const xSpeed = 10;
const ySpeed = 10;
const xAngle = 0.1;
const yAngle = 0.1;
const smoothness= 0.01;

//add an event listener and trigger movements for respective keypresses
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
    else if(event.shiftKey && keyCode == "ArrowLeft") frog.rotation.y -= xAngle;
    else if(event.shiftKey && keyCode == "ArrowRight") frog.rotation.y += xAngle;
	else if (keyCode=="s") {
		if(frog.getObjectByName('righttibia').rotation.z==rTibia){
			frog.getObjectByName('righttibia').rotation.z-=0.2;
			frog.getObjectByName('rightfoot').rotation.z-=1;
			frog.getObjectByName('lefttibia').rotation.z-=0.2;
			frog.getObjectByName('leftfoot').rotation.z-=1;
		}
	}
	else if (keyCode=="w") {
		if(frog.getObjectByName('righthumerus').rotation.z==Humerus){
			frog.getObjectByName('righthumerus').rotation.z+=1;
			frog.getObjectByName('lefthumerus').rotation.z+=1;
		}
	}
	else if (keyCode=="a"){
		if(frog.getObjectByName('skull').rotation.x==skull){
			frog.getObjectByName('skull').rotation.x+=0.4;
		}
	}
	else if (keyCode=="d"){
		if(frog.getObjectByName('skull').rotation.x==skull){
			frog.getObjectByName('skull').rotation.x-=0.4;
		}
	}

	if(!event.shiftKey) frog.position.lerp(targetPosition, smoothness); // make translations smooth using linear interpolations
};
 
// bring the frog back to its original position on key up
document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
    var keyCode = event.key;
	const targetPosition = frog.position.clone();
	const targetRotation = frog.rotation.clone();
	if (keyCode=="s") {
		frog.getObjectByName('righttibia').rotation.z=rTibia;
		frog.getObjectByName('rightfoot').rotation.z=rFoot;
		frog.getObjectByName('lefttibia').rotation.z=lTibia;
		frog.getObjectByName('leftfoot').rotation.z=lFoot;
	}
	else if(keyCode=="w"){
		frog.getObjectByName('righthumerus').rotation.z=Humerus;
		frog.getObjectByName('lefthumerus').rotation.z=Humerus;
	}
	else if(keyCode=="a"||keyCode=="d"){
		frog.getObjectByName('skull').rotation.x=skull;
	}
};

// render loop
function animate(){
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}
animate();