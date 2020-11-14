import * as THREE from "./three.js-dev/build/three.module.js"
import { OBJLoader } from "./three.js-dev/examples/jsm/loaders/OBJLoader.js"
import {StereoEffect} from "./three.js-dev/examples/jsm/effects/StereoEffect.js"
import { GUI } from "./three.js-dev/examples/jsm/libs/dat.gui.module.js"

export function practical2() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();
  const loader = new THREE.TextureLoader();
  const effect = new StereoEffect(renderer);
  const gui = new GUI();
  const gui_container = gui.addFolder("Animate");

  let params = {
    Morph1: 0,
  };

  let object;
  let windowHalfx = window.innerWidth/2;
  let windowHalfy = window.innerHeight/2;
  var mouseX;
  var mouseY;
  let is_key_down = false;

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const ambientLight = new THREE.AmbientLight(0xfcf3cf, 1);
  scene.add(ambientLight);

  const manager = new THREE.LoadingManager(loadModel);
  

  let uniform = {
    time: {value: 1}
};
const geometry = new setMorphTargets();
const material = new THREE.ShaderMaterial({
    uniforms: uniform,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    morphTargets: true,
});
const material2 = new THREE.MeshBasicMaterial({
    map: loader.load("./download.jpg"),
    morphTargets: true,
    //color: 0x48c9b0,
  });
const cube = new THREE.Mesh(geometry, material2);
  cube.scale.set(3, 3, 3);
  cube.position.z = -20;
  
  const object_loader = new OBJLoader(manager);
  object_loader.load('./stikla_pudele.obj', function (obj) {
    object = obj;
  }, onProgress, onError);

  gui_container
    .add(params, "Morph1", 0, 10)
    .step(0.001)
    .onChange(function (value) {
      //console.log(value);
        cube.morphTargetInfluences[0] = value;
     

    });

    scene.add(cube);
  gui_container.open();

  camera.position.z = 0;
 
  const ambient_light = new THREE.AmbientLight(0xf5f4f2,0.1);
  ambient_light.position.set(-0,0,20);
  scene.add(ambient_light);

  //Animation loop
  renderer.setAnimationLoop(function () {

    uniform['time'].value = performance.now() / 1000;
    if(is_key_down == false){
        camera.position.x -= (mouseX - camera.position.x) * 0.001;
        camera.position.y += (mouseY - camera.position.y) * 0.001;
        camera.updateProjectionMatrix();
    }else{
        mouseX = 0;
        mouseY = 0;
    }
    effect.render(scene, camera);
  });

  document.body.appendChild(renderer.domElement);

  //Functions
  function loadModel() {
    object.traverse(function (child) {
      //traverse
      if (child.isMesh) {
        child.material = material;
      }
    });

    object.position.z = -10;
    
    scene.add(object);
  }

  //On progress
  function onProgress(xhr) {
    if (xhr.lengthComputable) {
      const loading_completed = xhr.loaded / xhr.total / 100;
      console.log('Model ' + Math.round(loading_completed, 2) + '% loaded.');
    }
  }

  //On error
  function onError(err) {
    console.log(err);
  }
  function setMorphTargets() {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 32, 32, 32);
    geometry.morphAttributes.position = [];
    const positions = geometry.attributes.position.array;

    const spherePositions = [];
    const twistPositions = [];

    const direction = new THREE.Vector3(1, 0, 0).normalize();
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      spherePositions.push(
        x * Math.sqrt(1 - (y * y / 2) - (z * z / 2) + (y * y * z * z / 3)),
        y * Math.sqrt(1 - (z * z / 2) - (x * x / 2) + (z * z * x * x / 3)),
        z * Math.sqrt(1 - (x * x / 2) - (y * y / 2) + (x * x * y * y / 3))
      );

      vertex.set(x * 2, y, z);
      vertex
        .applyAxisAngle(direction, (Math.PI * x / 2))
        .toArray(twistPositions, twistPositions.length);

    }

    geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
      spherePositions,
      3
    );


    return geometry;
  }

  window.addEventListener('keydown', function(event){
    console.log('Key is down');
    let keyCode = event.which;
    let delta = 0.02;
    console.log(keyCode);
    if(keyCode == 65){
        camera.position.x += delta; 
    }
    if(keyCode == 87){
        camera.position.y -= delta;
    }
    if(keyCode == 83){
        camera.position.y += delta;
    }
    if(keyCode == 68){
        camera.position.x -= delta;
    }
    if(keyCode == 82){
        camera.position.x = object.position.x;
        camera.position.y = object.position.y;
        camera.position.z = 5;
        cube.position.x = object.position.x;
        cube.position.y = object.position.y;
        cube.position.z = -20;
    }

    is_key_down = true;
});

window.addEventListener('keyup', function(event){
    is_key_down = false;
});

window.addEventListener('mousemove', function(event){
    mouseX = event.clientX - windowHalfx;
    mouseY = event.clientY - windowHalfy;
    
    
});

}
