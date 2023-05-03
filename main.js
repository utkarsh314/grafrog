import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// create a new scene
const scene = new THREE.Scene(); 

// add a camera and adjust its position


const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 0);
camera.rotation.x-=Math.PI/2;


// create a renderer and set its size to fit the device window
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(window.innerWidth, window.innerHeight); 

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// add a <canvas> tag to the HTML
document.body.appendChild(renderer.domElement); 

//add lighting
var ambient = new THREE.AmbientLight(0xffffff, 0.5);  // ambient light source
//ambient.castShadow=true;
scene.add(ambient);
var point = new THREE.PointLight(0xffffff, 0.8);      // point light source
point.castShadow=true;
scene.add(point);

var dLight=new THREE.DirectionalLight(0xffffff,1);
dLight.position.set(0,1000,0)
scene.add(dLight);
dLight.castShadow=true;

// load the frog model
var frog;

//Koad Texture
const textureLoader=new THREE.TextureLoader();
const frogTexture=textureLoader.load('assets/skin.jpg');
const mat=new THREE.MeshPhongMaterial();
mat.map=frogTexture;


const geometryP = new THREE.PlaneGeometry(50, 50);
const materialP = new THREE.MeshStandardMaterial({color:0xffffff})
const plane = new THREE.Mesh(geometryP, materialP);
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);







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
        vec3 viewDirection=normalize(cameraPosition-vPosition);
        float fresnel=dot(viewDirection, vNormal);
		gl_FragColor=vec4(0.f,fresnel,0.f, 1.0);
		//gl_FragColor=vec4(texture,1.0);
	  }
	`,
  });


  

const loader = new GLTFLoader();
loader.load(
	'assets/frog.glb',
	function(gltf){	
		frog = gltf.scene.children[0];
		frog.traverse(function(node){
			if(node.isMesh){
				node.material=newShader;
			}
		});
        frog.position.y+=5;
        frog.castShadow=true;
        frog.receiveShadow=true;
		scene.add(frog);
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
    else if(event.shiftKey && keyCode == "ArrowLeft") frog.rotation.y -= xAngle;
    else if(event.shiftKey && keyCode == "ArrowRight") frog.rotation.y += xAngle;

	if(!event.shiftKey) frog.position.lerp(targetPosition, smoothness);
};
 
function animate(){
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}
animate();