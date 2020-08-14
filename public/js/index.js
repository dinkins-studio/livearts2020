//Some general Three.js components
let renderer, scene, camera, controls;

let depthkit;
// Depthkit character
let character;
let rotationStep = Math.PI / 9.0;

// custom video layout
let videoShape1, videoShape2;
let videoShapeXPos = -3.25;

let videoSrcList = [];

init();

function init() {
  // Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Setup scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x301934, 0.0, 10.0);

  // Setup camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.set(0, 2, 3);

  // Setup controls
  controls = new THREE.OrbitControls(camera);
  controls.target.set(0, 0.75, 0);
  camera.lookAt(controls.target);

  // A grid helper as a floor reference
  let gridHelper = new THREE.GridHelper(50, 50);
  // scene.add(gridHelper);

  depthkit = new Depthkit();
  depthkit.load(
    // "https://cdn.glitch.com/88ddef19-31c1-4772-bdd6-29b3a07403ad%2FTAKE_07_30_01_45_31_Export_07_30_04_09_05.txt?v=1596219873183",
    // "https://cdn.glitch.com/88ddef19-31c1-4772-bdd6-29b3a07403ad%2FTAKE_07_30_01_45_31_Export_07_30_04_09_05.webm?v=1596219863242",
    "../assets/character/prof.txt",
    "../assets/character/prof.webm",
    dkCharacter => {
      character = dkCharacter;

      // Position and rotation adjustments
      dkCharacter.rotation.set(Math.PI - 3.5, 3, Math.PI / -2.0);
      dkCharacter.position.set(-1.5, 1.5, .85);
      dkCharacter.scale.set(4.5, 4.5, 4.5);

      // Depthkit video playback control
      depthkit.video.muted = "muted"; // Necessary for auto-play in chrome now
      depthkit.setLoop(true);
      depthkit.play();

      // Add the character to the scene
      scene.add(character);
    }
  );

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
          new THREE.CubeGeometry(0.5, 0.5, 0.25),
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

  let element = setUpVideo();
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
  videlem.muted = true;
  videlem.setAttribute("crossorigin", "anonymous"); // i think this will not be not be needed if you have a server
  videlem.style.display = "none"; // hide html video element
  videlem.load();
  videlem.play();
  return videlem;
}

// function draw() {
//   requestAnimationFrame(draw);
//   renderer.render(scene, camera);
//   // controls.update();
//   // camera.position.x += 0.01;
// }

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