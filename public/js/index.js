// fiddling numbers:

// this controls the sound radius
let positionalAudioRadius = 3.0

// starting volume for videos
let startingVolume = 0.04

// how many videos per row
let videoRowSize = 4.

// what would it look like with this many videos

let numberOfTestVideos=4

// the width & height of the video
let videoSize = 1.0

let profSinScale = 0.09// this will control how much or how little the professor rotates side to side

// starting rotation of the professor
let profRotx = Math.PI -3.4 //rotate back and forward
let profRoty = -.7 //left /-=right
let profRotz = Math.PI / -2.0

//Some general Three.js components
let renderer, scene, camera, controls, profCamera, profScene, profControls;

let depthkit;
// Depthkit character
let character;
//let rotationStep = Math.PI / 9.0;

// custom video layout
let videoShape1, videoShape2;
let videoShapeXPos = -3.25;
let interval;
let videoSrcList = [];
let videos = [];
let videoShapes = [];
let increasingNumber = 0;

let dkplay = false
//import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/OBJLoader2.js';

init();
// identify button that opens modal
modalButton = document.getElementById("submit-video");

// identify <span> element that closes the modal
span = document.getElementsByClassName("close")[0];

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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
  renderer.autoClearColor = false;
  renderer.autoClear = false;
  // Setup scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000);
  scene.fog = new THREE.Fog(0x301934, 0.0, 10.0);

  profScene = new THREE.Scene();

  // Setup camera for videos
  camera = new THREE.PerspectiveCamera(
75,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.set(-.0, 0, -1);

  profCamera = new THREE.PerspectiveCamera(
50,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  profCamera.position.set(-0, -0, -5);//z y x
  profScene.add(profCamera)
  // Setup controls
  profControls = new THREE.OrbitControls(profCamera);
  profControls.enabled = false;

  controls = new THREE.OrbitControls(camera);
 controls.target.set(0, 0.75, 0);
 controls.minDistance = 0;
  camera.lookAt(controls.target);
  profCamera.lookAt(0, 0.5, 0)
  // A grid helper as a floor reference
  let gridHelper = new THREE.GridHelper(50, 50);
  // scene.add(gridHelper);

  // Shaders
  let uniforms = {


  }

  // background
  // create the video element
// let video = document.createElement( 'video' );
// video.src = "../assets/videos/background.mp4";
// video.load(); // must call after setting/changing source
// video.muted = true;
// video.play();

let videoImage = document.createElement( 'canvas' );
videoImage.width = 480;
videoImage.height = 204;
let ratio = videoImage.height/videoImage.width
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
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
      if(character !=undefined){return}
      character = dkCharacter;

      // Position and rotation adjustments

      character.rotation.set(profRotx,profRoty, profRotz); //(Math.PI - 3.4, 2, Math.PI / -2.1);
      character.position.set(-1,.7, 0);
      character.scale.set(8, 6, 6);

      // character.rotation.set(Math.PI - 3.3, -.7, Math.PI / -2.0); //(Math.PI - 3.4, 2, Math.PI / -2.1);
      // character.position.set(0, .07, -2);
      // character.scale.set(8, 5, 5);

      // Depthkit video playback control
      // Muting necessary for auto-play in chrome
      depthkit.video.muted = true;
      depthkit.setLoop(true);
      depthkit.play();
      // this makes the depthkit character loop
      interval = setInterval(function(){depthkit.video.currentTime=0;}, 3700)
      setTimeout(function(){
        interval = setInterval(function(){depthkit.video.currentTime=0;}, 3700)
        dkplay=false
      }, 352000); // 5 min and 52 seconds

      // Add the character to the scene
      profScene.add(character);
    }
  );

  // Add videos from database
  // Use fetch() to request list of videos in database
  // this could be revised to use async and await
  fetch('/list')
    .then(response => response.json())
    .then(json => {

      // Create an array of videos based on the JSON data

      json.forEach(elt => {
        // aws
        videos.push(setUpVideo(`${elt.url}`));
        // file system
        // videos.push(setUpVideo(`upload/${elt.filename}`));
      });


      // iterate through videoShapes to create grid, one ver video
      for (let i = 0; i < numberOfTestVideos; i += 1) {
        var videoShape
        // Create a texture for each video
        const texture = createTextureFromVideoElement(videos[i% videos.length]);

       // const objLoader = new OBJLoader2();
        let material = new THREE.MeshBasicMaterial({
                          map: texture,
                          side: THREE.DoubleSide
        })
        let mesh;
        // objLoader.addMaterials(materials);
        // objLoader.load("../assets/models/rect.obj", (root) => {

        //   root.traverse( function( child ) {
        //     if ( child.type === "Mesh" ) {

        //         child.material = material
        //       //  child.material.color = 0xffb830;
        //         videoShape = child
        //         videoShape.position.x = (Math.random() - 0.5) * 6;
        //         videoShape.position.y = (Math.random() ) * 3;
        //         videoShape.scale.multiplyScalar(0.000375) //object scale.
        //
        //         //scene.add(child)

        //     }
        //     //scene.add(root)


        // } );

        // });
        //if(videoShape == undefined){
            videoShape = new THREE.Mesh(
              new THREE.CubeGeometry(videoSize,videoSize,0.2),
              material
            );
       videoShape.position.x = ((i%videoRowSize)- videoRowSize/4)*3  ;
       videoShape.position.y = -(Math.floor(i/videoRowSize)*3) + Math.floor(numberOfTestVideos/videoRowSize)
       videoShape.position.z = 3;
       scene.add(videoShape)
        //}
        // this is for testing positional audio later
        videoShapes[i]= videoShape
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
  videlem.loop = true;

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
function getDistance(mesh1, mesh2) {
  var dx = mesh1.position.x - mesh2.position.x;
  var dy = mesh1.position.y - mesh2.position.y;
  var dz = mesh1.position.z - mesh2.position.z;
  return Math.sqrt(dx*dx+dy*dy+dz*dz);
}
function playDK() {
  if(dkplay){return}
  dkplay=true
  depthkit.play();
  depthkit.video.muted = false;
  clearInterval(interval);
  for (let i = 0; i < numberOfTestVideos; i += 1) {
    videos[i].volume= startingVolume;
  }
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

  //renderer.render(profScene, camera);
  renderer.render(scene, camera)
  renderer.render(profScene, profCamera)


  controls.update();
  increasingNumber+=0.01;
  if(character != undefined){
    character.rotation.set(profRotx,profRoty+ (Math.sin(increasingNumber) * profSinScale), profRotz)
  }
  if (videoShapes.length > 0){
    for (let i = 0; i < videos.length; i += 1) {
      let dist = getDistance(videoShapes[i], camera);
      videos[i].volume =startingVolume
      if (dist < positionalAudioRadius){
        let v = startingVolume + ((1-startingVolume) * (positionalAudioRadius-dist));
        if (v>1.0){v=1.0}
        videos[i].volume =v
        character.setVolume(1-v)
      }
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  profCamera.aspect = window.innerWidth / window.innerHeight;
  profCamera.updateProjectionMatrix();
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
