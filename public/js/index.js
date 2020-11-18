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

  // Shaders
  let uniforms = {


  }

  depthkit = new Depthkit();
  depthkit.load(
    "../assets/character/scream.txt",
    "../assets/character/scream.mp4",
    dkCharacter => {
      character = dkCharacter;

      // Position and rotation adjustments
      dkCharacter.rotation.set(Math.PI - 3.5, -3, Math.PI /-2.0);
      dkCharacter.position.set(-.1, 1.5, 1.85);
      dkCharacter.scale.set(3.5, 3.5, 3.5);

      // Depthkit video playback control
      // Muting necessary for auto-play in chrome
      depthkit.video.muted = "muted";
      depthkit.setLoop(true);
      depthkit.play();

      function playDK() {
        depthkit.pause();
      }

      // Add the character to the scene
      scene.add(character);
    }
  );

  // temporary video for Ari's soundscape
  // let video1 = setUpVideo(
  //   "../upload/Huntley_1099240_Screener.webm"
  //   // "https://cdn.glitch.com/39b7ba95-a96e-44aa-9110-0d917a3046ad%2FpartA_Trim.mp4?v=1596058682930"
  // );

  // let texture1 = createTextureFromVideoElement(video1);

  // temporaryVideoShape = new THREE.Mesh(
  //   new THREE.SphereGeometry(0.25, 0.25, 0.25),
  //   new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide })
  // );

  // temporaryVideoShape.position.x = (Math.random() - 0.5) * 5;
  // temporaryVideoShape.position.set(3, 1, -1);
  // temporaryVideoShape.scale.set(2,2,2);

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
          new THREE.CubeGeometry(0.5, 0.5, 0.2),
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

  // let element = setUpVideo();
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
