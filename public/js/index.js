//Some general Three.js components
var renderer, scene, camera3, controls;

//DepthKit character


var character;
let rotationStep = Math.PI / 9.0;
//let rotation =0, rotationTarget = 0;

// custom video layout
let videoShape1, videoShape2;
let videoShapeXPos = -3.25;

let ray, projector, mouse;
//let videos,
let objects;
let idle; //sd added

init();

function init() {
  //Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Setup scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  //scene.fog = new THREE.Fog(0x17348D, 0.0, 40.0);

  // Setup camera
  camera3 = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera3.position.set(0, 0, 100);

  // Setup controls
  controls = new THREE.OrbitControls(camera3);
  controls.target.set(0, 0, 0); // orig (0, 0.75, 0)
  camera3.lookAt(controls.target);

  // A grid helper as a floor reference
  var gridHelper = new THREE.GridHelper(25, 25);
  //  scene.add(gridHelper);

  //DepthKit(mesh/wire/points rendering, path to txt, path to video)
  character = new DepthKit(
    "point",
    "https://cdn.glitch.com/6faea614-1ebe-4ba0-957e-9b31be8b6ba8%2FTAKE_Bob01_02_16_12_38_Export_06_22_23_02_49.txt?v=1593111510918",
    "../assets/character/prof-short.webm"
  );

  // Position and rotation adjustments
  character.position.set(3, 3, 10);
  character.scale.set(30, 30, 30);
  character.rotateY((Math.PI / 2) * 2);
  character.rotateZ(-Math.PI / 2);

  //character.rotation.set(Math.PI - 3.5, 3, Math.PI / -2.0);

  // Depthkit methods
  character.depthkit.setLoop(false);

  //Add the character to the scene
  scene.add(character);

  // audio
  // create an AudioListener and add it to the camera
  var listener = new THREE.AudioListener();
  camera3.add(listener);

  // create a global audio source
  var sound = new THREE.Audio(listener);

  // load a sound and set it as the Audio object's buffer
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load('public/audio/pagejamq.ogg', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
  });

  // temporary video for Ari's soundscape
  // let video1 = setUpVideo(

  //   "../upload/Huntley_1099240_Screener.webm"
  //   // "https://cdn.glitch.com/39b7ba95-a96e-44aa-9110-0d917a3046ad%2FpartA_Trim.mp4?v=1596058682930"
  // );

  // let texture1 = createTextureFromVideoElement(video1);

  // temporaryVideoShape = new THREE.Mesh(
  //   new THREE.SphereGeometry(0.25, 1.00, 0.25),
  //   new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide })
  // );

  // temporaryVideoShape.position.x = (Math.random() - 0.5) * 5;
  // temporaryVideoShape.position.set(3, 1, -1);
  // temporaryVideoShape.scale.set(2, 2, 2);

  // scene.add(temporaryVideoShape);

  // Add videos from database
  // Use fetch() to request list of videos in database
  // this could be revised to use async and await
  fetch('/list')
    .then(response => response.json())
    .then(json => {

      // Create an array of videos based on the JSON data
      let videos = [];
      json.forEach(elt => {
        videos.push(setUpVideo(`upload/${elt.filename}`));
      });

      // iterate through videoShapes to create grid, one ver video
      for (let i = 0; i < videos.length; i += 1) {
        // Create a texture for each video
        const texture = createTextureFromVideoElement(videos[i]);
        videoShape = new THREE.Mesh(
          new THREE.CubeGeometry(0.65, 0.7, 0.7),
          new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
          })
        );

        videoShape.position.x = (Math.random() - 0.5) * 5;
        videoShape.position.y = (Math.random() - 0.5) * 5;
        // videoShape.position.z = ( Math.random() - 0.5 ) * 10;

        scene.add(videoShape);
      }
    });

  window.addEventListener("resize", onWindowResize, false);

  render();
}

function playDK() {
  character.depthkit.play();
}

function setUpVideo(inSrc) {
  var videlem = document.createElement("video");
  var sourceMP4 = document.createElement("source");
  sourceMP4.type = "video/mp4";
  sourceMP4.src = inSrc;
  videlem.appendChild(sourceMP4);

  videlem.autoplay = true;
  videlem.muted = false;
  videlem.volume = 0.03; //sd add volume
  videlem.setAttribute("crossorigin", "anonymous");
  videlem.style.display = "none"; // hide html video element
  videlem.load();
  videlem.play;
  return videlem;

  //sd add trying to make small video play from begingin on click

  //function restartVidelem ()
  //{onclick = videlem.pause();
  //videlem.currentTime = 0;
  //videlem.play();}
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
  renderer.render(scene, camera3);
}

function onWindowResize() {
  camera3.aspect = window.innerWidth / window.innerHeight;
  camera3.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}



// onMouseClick() {

//   character.depthkit.play();
// }