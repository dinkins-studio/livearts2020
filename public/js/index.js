//Some general Three.js components
let renderer, scene, camera, controls;

let depthkit;
// Depthkit character
let character;
let rotationStep = Math.PI / 9.0;

// custom video layout
let videoShape1, videoShape2;
let videoShapeXPos = -3.25;
let interval;
let videoSrcList = [];

import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/OBJLoader2.js';

init();
// identify button that opens modal
let modalButton = document.getElementById("submit-video");

// identify <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

modalButton.addEventListener("click", function () {
  // mute depthkit character
  depthkit.video.muted = true;

})

span.addEventListener("click", function () {
  depthkit.video.muted = false;
}
)

function init() {
  // Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Setup scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000);
  scene.fog = new THREE.Fog(0x301934, 0.0, 10.0);

  // Setup camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.set( 0.75,.6, 0);

  // Setup controls
  controls = new THREE.OrbitControls(camera);
  controls.target.set(0, 0.75, 0);
  camera.lookAt(controls.target);

  // A grid helper as a floor reference
  let gridHelper = new THREE.GridHelper(50, 50);
  // scene.add(gridHelper);

  // Shaders
  let uniforms = {


  }

  // background
  // create the video element
let video = document.createElement( 'video' );
video.src = "../assets/videos/background.mp4";
video.load(); // must call after setting/changing source
video.muted = true;
video.play();
let videoImage = document.createElement( 'canvas' );
videoImage.width = 480;
videoImage.height = 204;

let videoImageContext = videoImage.getContext( '2d' );
// background color if no video present
videoImageContext.fillStyle = '#000000';
videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

let videoTexture = new THREE.Texture( videoImage );
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
const rt = new THREE.WebGLCubeRenderTarget(videoTexture.image.height);
rt.fromEquirectangularTexture(renderer, videoTexture);
scene.background = rt;

  depthkit = new Depthkit();
  depthkit.load(
    "../assets/character/prof.txt",
    "../assets/character/prof.mp4",
    dkCharacter => {
      character = dkCharacter;

      // Position and rotation adjustments
      character.rotation.set(Math.PI - 3.5, 2, Math.PI / -2.2);
      character.position.set(-1., 1.5, 1.0);
      character.scale.set(4.5, 4.5, 4.5);

      // Depthkit video playback control
      // Muting necessary for auto-play in chrome
      depthkit.video.muted = true;
      depthkit.setLoop(true);
      depthkit.play();
      console.log("hellos");
      interval = setInterval(function(){depthkit.video.currentTime=1;},5000)
      depthkit.video.onended = function(){
        interval = setInterval(function(){depthkit.video.currentTime=1;},5000)
      }
      // Add the character to the scene
      scene.add(character);
    }
  );

  // Add videos from database
  // Use fetch() to request list of videos in database
  // this could be revised to use async and await
  fetch('/list')
    .then(response => response.json())
    .then(json => {

      // Create an array of videos based on the JSON data
      let videos = [];
      json.forEach(elt => {
        // aws
        videos.push(setUpVideo(`${elt.url}`));
        // file system
        // videos.push(setUpVideo(`upload/${elt.filename}`));
      });

      // iterate through videoShapes to create grid, one ver video
      for (let i = 0; i < videos.length; i += 1) {
        var videoShape
        // Create a texture for each video
        const texture = createTextureFromVideoElement(videos[i]);

        const objLoader = new OBJLoader2();
        let material = new THREE.MeshBasicMaterial({
                          map: texture,
                          side: THREE.DoubleSide
        })
        let mesh;
        // objLoader.addMaterials(materials);
        objLoader.load("../assets/models/rect.obj", (root) => {

          root.traverse( function( child ) {
            if ( child.type === "Mesh" ) {

                child.material = material
              //  child.material.color = 0xffb830;
                videoShape = child
                videoShape.position.x = (Math.random() - 0.5) * 6;
                videoShape.position.y = (Math.random() - 0.5) * 5;
                videoShape.scale.multiplyScalar(0.0005) //object scale.
                scene.add(videoShape)
                //scene.add(child)

            }
            //scene.add(root)


        } );

        });
        if(videoShape == undefined){
            videoShape = new THREE.Mesh(
              new THREE.CubeGeometry(0.5, 0.5, 0.2),
              material
            );
        }
      }

    });

  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("keydown", onKeyDown, false);
  render();
}

function setUpVideo(inSrc) {
  var videlem = document.createElement("video");
  var sourceMP4 = document.createElement("source");
  sourceMP4.type = "video/mp4";
  sourceMP4.src = inSrc;
  videlem.appendChild(sourceMP4);

  videlem.autoplay = true;
  videlem.muted = false;
  videlem.volume= 0.0;// this was where the audio for the small Object based video sound is now when audio level is above 0 video does not load
  videlem.setAttribute("crossorigin", "anonymous"); // i think this will not be not be needed if you have a server
  videlem.style.display = "none"; // hide html video element
  videlem.load();
  videlem.play();
  return videlem;
}
document.addEventListener("click", function(){
  playDK();
});
function playDK() {
  depthkit.play();
  depthkit.video.muted = false;
  clearInterval(interval);
}

function vertexShaderhader() {

}

function createTextureFromVideoElement(video) {
  let texture = new THREE.VideoTexture(video);
  texture.crossOrigin = "anonymous";
  texture.needsUpdate;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  return texture;
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 49: // key '1'
      depthkit.setMeshScalar(1);
      break;
    case 50: // key '2'
      depthkit.setMeshScalar(2);
      break;
    case 51: // key '3'
      depthkit.setMeshScalar(3);
      break;
    case 81: // key 'q'
      character.rotation.x += rotationStep;
      break;
    case 87: // key 'w'
      character.rotation.x -= rotationStep;
      break;
    case 65: // key 'a'
      character.rotation.y += rotationStep;
      break;
    case 83: // key 's'
      character.rotation.y -= rotationStep;
      break;
    case 90: // key 'z'
      character.rotation.z += rotationStep;
      break;
    case 88: // key 'x'
      character.rotation.z -= rotationStep;
      break;

    default:
      scene.updateMatrixWorld();

      var v = new THREE.Vector3();
      v.setFromMatrixPosition(character.matrixWorld);
      console.log(v);

      return;
  }
}
